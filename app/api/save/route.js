// app/api/save/route.js
import { NextResponse } from 'next/server';
import { classifyContent } from '@/lib/claude';
import fs from 'fs';
import path from 'path';

// File-based storage (since we can't use localStorage on server)
const STORAGE_FILE = path.join(process.cwd(), 'data', 'items.json');

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Read items from file
function getItems() {
  ensureDataDir();
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading items:', error);
  }
  return [];
}

// Save items to file
function saveItems(items) {
  ensureDataDir();
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(items, null, 2));
  } catch (error) {
    console.error('Error saving items:', error);
    throw error;
  }
}

export async function POST(request) {
  try {
    const { content, url, imageData } = await request.json();

    if (!content && !url && !imageData) {
      return NextResponse.json(
        { error: 'Content, URL, or image is required' },
        { status: 400 }
      );
    }

    // Build content string for classification
    let fullContent = content || '';

    if (imageData) {
      fullContent += '\n[Image attached - analyze visual content]';
    }

    if (url) {
      fullContent += `\nURL: ${url}`;
    }

    // Call Claude to classify the content
    const classification = await classifyContent(fullContent, url);

    // Create new item
    const newItem = {
      id: Date.now().toString(),
      type: classification.contentType,
      rawContent: content || url || '',
      url: url || null,
      metadata: {
        title: classification.title,
        summary: classification.summary,
        author: classification.metadata?.author,
        price: classification.metadata?.price,
        date: classification.metadata?.date,
        source: classification.metadata?.source,
        imageUrl: classification.metadata?.imageUrl,
        description: classification.metadata?.description,
      },
      keywords: classification.keywords || [],
      tags: classification.tags || [],
      image: imageData ? `data:image/png;base64,${imageData}` : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to file storage
    const items = getItems();
    items.unshift(newItem); // Add to beginning
    saveItems(items);

    // Return both the item and classification
    return NextResponse.json({
      success: true,
      item: newItem,
      classification: {
        contentType: classification.contentType,
        metadata: newItem.metadata,
        tags: newItem.tags,
        keywords: newItem.keywords,
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
export async function GET() {
  try {
    const items = getItems();
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Get items error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve items', details: error.message },
      { status: 500 }
    );
  }
}
