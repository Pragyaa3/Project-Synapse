// app/api/classify/route.js
import { NextResponse } from 'next/server';
import { classifyContent } from '@/lib/claude';

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
    const result = await classifyContent(fullContent, url);

    // Return classification results
    return NextResponse.json({
      classification: {
        contentType: result.contentType,
        metadata: {
          title: result.title,
          summary: result.summary,
          author: result.metadata?.author,
          price: result.metadata?.price,
          date: result.metadata?.date,
          source: result.metadata?.source,
          imageUrl: result.metadata?.imageUrl,
          description: result.metadata?.description,
        },
        tags: result.tags || [],
        keywords: result.keywords || [],
        visualFormat: result.visualFormat || 'card',
      },
    });
  } catch (error) {
    console.error('Classification API error:', error);
    return NextResponse.json(
      { error: 'Failed to classify content', details: error.message },
      { status: 500 }
    );
  }
}
