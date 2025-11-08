// app/api/save/route.js
import { NextResponse } from 'next/server';
import { classifyContent } from '@/lib/claude';
import prisma from '@/lib/prisma';
import { uploadImage } from '@/lib/supabase';
import getQueue from '@/lib/jobQueue';

// Helper function to retry with exponential backoff
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

export async function POST(request) {
  const queue = getQueue();
  let itemId;

  try {
    const { content, url, imageData, pageTitle, metadata: providedMetadata, voice, async: isAsync } = await request.json();

    if (!content && !url && !imageData) {
      return NextResponse.json(
        { error: 'Content, URL, or image is required' },
        { status: 400 }
      );
    }

    // Generate unique ID for this item
    itemId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // STRATEGY: Save immediately with "processing" status, then classify in background
    // This ensures fast response times and no data loss if classification fails

    // Step 1: Save with minimal data immediately (fast response)
    const initialItem = await prisma.item.create({
      data: {
        id: itemId,
        type: 'processing', // Temporary type until classification completes
        rawContent: content || url || '',
        url: url || null,
        title: providedMetadata?.title || pageTitle || 'Processing...',
        summary: 'Content is being analyzed...',
        keywords: [],
        tags: [],
        voice: voice || null,
        imageUrl: null, // Will be updated after image upload
      },
    });

    // Step 2: Queue background jobs for classification and image upload
    const jobs = {
      classifyJobId: null,
      imageJobId: null
    };

    // Build content string for classification
    let fullContent = content || '';
    if (url) {
      fullContent += `\nURL: ${url}`;
    }

    // Queue classification job
    jobs.classifyJobId = await queue.addJob('classify', {
      content: fullContent,
      url,
      imageData
    });

    // Queue image upload job if image provided
    if (imageData) {
      jobs.imageJobId = await queue.addJob('image_upload', {
        imageData,
        itemId
      });
    }

    // Step 3: Process jobs and update item (with retry logic)
    // If async=true, return immediately; otherwise wait for completion
    if (isAsync) {
      // Return immediately with job IDs
      return NextResponse.json({
        success: true,
        async: true,
        item: {
          id: initialItem.id,
          type: 'processing',
          status: 'processing',
          message: 'Content saved. Processing in background...'
        },
        jobs
      });
    }

    // Wait for jobs to complete (default behavior for backward compatibility)
    const [classification, imageResult] = await Promise.allSettled([
      waitForJob(queue, jobs.classifyJobId),
      jobs.imageJobId ? waitForJob(queue, jobs.imageJobId) : Promise.resolve(null)
    ]);

    // Handle classification result
    let classificationData = null;
    if (classification.status === 'fulfilled') {
      classificationData = classification.value;
    } else {
      console.error('Classification failed:', classification.reason);
      // Fallback: use basic classification
      classificationData = {
        contentType: 'note',
        keywords: [],
        tags: [],
        metadata: {}
      };
    }

    // Handle image upload result
    let uploadedImageUrl = null;
    if (imageResult && imageResult.status === 'fulfilled' && imageResult.value) {
      uploadedImageUrl = imageResult.value.imageUrl;
    } else if (imageData) {
      console.error('Image upload failed, storing base64 as fallback');
      uploadedImageUrl = `data:image/png;base64,${imageData}`;
    }

    // Prepare metadata fields
    const title = providedMetadata?.title || classificationData.title || pageTitle || 'Untitled';
    const summary = providedMetadata?.description || classificationData.summary || null;
    const author = providedMetadata?.author || classificationData.metadata?.author || null;
    const source = providedMetadata?.platform || classificationData.metadata?.source || null;
    const date = classificationData.metadata?.date || null;
    const price = providedMetadata?.price || classificationData.metadata?.price || null;
    const description = providedMetadata?.description || classificationData.metadata?.description || null;

    // Image-specific fields
    const imageUrl = uploadedImageUrl || providedMetadata?.thumbnail || classificationData.metadata?.imageUrl || null;
    const imageAnalysis = classificationData.metadata?.imageAnalysis || null;
    const extractedText = classificationData.metadata?.extractedText || null;
    const colors = classificationData.metadata?.colors || [];
    const visualType = classificationData.metadata?.visualType || null;

    // Step 4: Update item with classification results (with retry)
    const updatedItem = await retryWithBackoff(async () => {
      return await prisma.item.update({
        where: { id: itemId },
        data: {
          type: classificationData.contentType,

          // Core metadata
          title,
          summary,
          author,
          source,
          date,
          price,
          description,

          // AI-extracted data
          keywords: classificationData.keywords || [],
          tags: classificationData.tags || [],

          // Image-specific fields
          imageUrl,
          imageAnalysis,
          extractedText,
          colors,
          visualType,
        },
      });
    }, 3, 1000);

    // Return the saved item
    return NextResponse.json({
      success: true,
      item: {
        id: updatedItem.id,
        type: updatedItem.type,
        rawContent: updatedItem.rawContent,
        url: updatedItem.url,
        metadata: {
          title: updatedItem.title,
          summary: updatedItem.summary,
          author: updatedItem.author,
          source: updatedItem.source,
          date: updatedItem.date,
          price: updatedItem.price,
          description: updatedItem.description,
          imageUrl: updatedItem.imageUrl,
          imageAnalysis: updatedItem.imageAnalysis,
          extractedText: updatedItem.extractedText,
          colors: updatedItem.colors,
          visualType: updatedItem.visualType,
        },
        keywords: updatedItem.keywords,
        tags: updatedItem.tags,
        voice: updatedItem.voice,
        image: updatedItem.imageUrl, // For backward compatibility with frontend
        createdAt: updatedItem.createdAt.toISOString(),
        updatedAt: updatedItem.updatedAt.toISOString(),
      },
    });

  } catch (error) {
    console.error('Save API error:', error);

    // If we created an item but failed to update it, mark it as failed
    if (itemId) {
      try {
        await prisma.item.update({
          where: { id: itemId },
          data: {
            type: 'error',
            summary: `Failed to process: ${error.message}`
          }
        });
      } catch (updateError) {
        console.error('Failed to mark item as error:', updateError);
      }
    }

    return NextResponse.json(
      { error: 'Failed to save content', details: error.message },
      { status: 500 }
    );
  }
}

// Helper to wait for a job to complete
async function waitForJob(queue, jobId, timeout = 30000) {
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const checkInterval = setInterval(() => {
      const job = queue.getJob(jobId);

      if (!job) {
        clearInterval(checkInterval);
        reject(new Error('Job not found'));
        return;
      }

      if (job.status === 'completed') {
        clearInterval(checkInterval);
        resolve(job.result);
        return;
      }

      if (job.status === 'failed') {
        clearInterval(checkInterval);
        reject(new Error(job.error || 'Job failed'));
        return;
      }

      // Check timeout
      if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        reject(new Error('Job timeout'));
      }
    }, 100); // Check every 100ms
  });
}

// GET endpoint to retrieve all items
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 100;
    const offset = parseInt(searchParams.get('offset')) || 0;
    const type = searchParams.get('type');

    // Build query
    const where = type ? { type } : {};

    // Fetch items from database
    const items = await prisma.item.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Transform to frontend format
    const formattedItems = items.map(item => ({
      id: item.id,
      type: item.type,
      rawContent: item.rawContent,
      url: item.url,
      metadata: {
        title: item.title,
        summary: item.summary,
        author: item.author,
        source: item.source,
        date: item.date,
        price: item.price,
        description: item.description,
        imageUrl: item.imageUrl,
        imageAnalysis: item.imageAnalysis,
        extractedText: item.extractedText,
        colors: item.colors,
        visualType: item.visualType,
      },
      keywords: item.keywords,
      tags: item.tags,
      voice: item.voice,
      image: item.imageUrl, // For backward compatibility
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));

    return NextResponse.json({ items: formattedItems });
  } catch (error) {
    console.error('Get items error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve items', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE endpoint to remove an item
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    // Delete from database with retry
    await retryWithBackoff(async () => {
      await prisma.item.delete({
        where: { id },
      });
    }, 3, 1000);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete item error:', error);
    return NextResponse.json(
      { error: 'Failed to delete item', details: error.message },
      { status: 500 }
    );
  }
}
