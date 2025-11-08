// app/api/save/route.js
import { NextResponse } from 'next/server';
import { classifyContent } from '@/lib/claude';
import prisma from '@/lib/prisma';
import { uploadImage } from '@/lib/supabase';

export async function POST(request) {
  try {
    const { content, url, imageData, pageTitle, metadata: providedMetadata, voice } = await request.json();

    if (!content && !url && !imageData) {
      return NextResponse.json(
        { error: 'Content, URL, or image is required' },
        { status: 400 }
      );
    }

    // Build content string for classification
    let fullContent = content || '';

    if (url) {
      fullContent += `\nURL: ${url}`;
    }

    // Call Claude to classify the content (with image if provided)
    const classification = await classifyContent(fullContent, url, imageData);

    // Generate unique ID for this item
    const itemId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Upload image to Supabase Storage if provided
    let uploadedImageUrl = null;
    if (imageData) {
      try {
        uploadedImageUrl = await uploadImage(imageData, itemId);
      } catch (error) {
        console.error('Image upload failed, storing base64 as fallback:', error);
        // Fallback: store base64 in imageUrl field (not ideal for large images)
        uploadedImageUrl = `data:image/png;base64,${imageData}`;
      }
    }

    // Prepare metadata fields
    const title = providedMetadata?.title || classification.title || pageTitle || 'Untitled';
    const summary = providedMetadata?.description || classification.summary || null;
    const author = providedMetadata?.author || classification.metadata?.author || null;
    const source = providedMetadata?.platform || classification.metadata?.source || null;
    const date = classification.metadata?.date || null;
    const price = providedMetadata?.price || classification.metadata?.price || null;
    const description = providedMetadata?.description || classification.metadata?.description || null;

    // Image-specific fields
    const imageUrl = uploadedImageUrl || providedMetadata?.thumbnail || classification.metadata?.imageUrl || null;
    const imageAnalysis = classification.metadata?.imageAnalysis || null;
    const extractedText = classification.metadata?.extractedText || null;
    const colors = classification.metadata?.colors || [];
    const visualType = classification.metadata?.visualType || null;

    // Create item in database using Prisma
    const newItem = await prisma.item.create({
      data: {
        id: itemId,
        type: classification.contentType,
        rawContent: content || url || '',
        url: url || null,

        // Core metadata
        title,
        summary,
        author,
        source,
        date,
        price,
        description,

        // AI-extracted data
        keywords: classification.keywords || [],
        tags: classification.tags || [],

        // Image-specific fields
        imageUrl,
        imageAnalysis,
        extractedText,
        colors,
        visualType,

        // Voice data (stored as JSON)
        voice: voice || null,
      },
    });

    // Return the saved item
    return NextResponse.json({
      success: true,
      item: {
        id: newItem.id,
        type: newItem.type,
        rawContent: newItem.rawContent,
        url: newItem.url,
        metadata: {
          title: newItem.title,
          summary: newItem.summary,
          author: newItem.author,
          source: newItem.source,
          date: newItem.date,
          price: newItem.price,
          description: newItem.description,
          imageUrl: newItem.imageUrl,
          imageAnalysis: newItem.imageAnalysis,
          extractedText: newItem.extractedText,
          colors: newItem.colors,
          visualType: newItem.visualType,
        },
        keywords: newItem.keywords,
        tags: newItem.tags,
        voice: newItem.voice,
        image: newItem.imageUrl, // For backward compatibility with frontend
        createdAt: newItem.createdAt.toISOString(),
        updatedAt: newItem.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Save API error:', error);
    return NextResponse.json(
      { error: 'Failed to save content', details: error.message },
      { status: 500 }
    );
  }
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

    // Delete from database
    await prisma.item.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete item error:', error);
    return NextResponse.json(
      { error: 'Failed to delete item', details: error.message },
      { status: 500 }
    );
  }
}
