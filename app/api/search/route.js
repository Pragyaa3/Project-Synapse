// app/api/search/route.js
import { NextResponse } from 'next/server';
import { semanticSearch } from '@/lib/claude';

export async function POST(request) {
  try {
    const { query, items } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ results: [] });
    }

    // Use Claude for semantic search
    const results = await semanticSearch(query, items);

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search API error:', error);

    // Fallback to simple keyword search if AI fails
    const { query, items } = await request.json();
    const lowerQuery = query.toLowerCase();
    const fallbackResults = items.filter(item =>
      item.metadata?.title?.toLowerCase().includes(lowerQuery) ||
      item.keywords?.some(k => k.toLowerCase().includes(lowerQuery)) ||
      item.tags?.some(t => t.toLowerCase().includes(lowerQuery)) ||
      item.rawContent?.toLowerCase().includes(lowerQuery)
    );

    return NextResponse.json({
      results: fallbackResults,
      fallback: true
    });
  }
}
