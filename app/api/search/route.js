// app/api/search/route.js
import { NextResponse } from 'next/server';
import { semanticSearch } from '@/lib/claude';
import { parseQuery, applyFilters } from '@/lib/queryParser';

export async function POST(request) {
  try {
    const { query, items, useAI = true } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ results: [], parsed: null });
    }

    // Step 1: Parse the query to extract filters and semantic meaning
    const parsed = await parseQuery(query, useAI);
    console.log('Parsed query:', parsed);

    // Step 2: Apply filters first to narrow down the search space
    let filtered = applyFilters(items, parsed.filters);

    console.log(`Filtered from ${items.length} to ${filtered.length} items`);

    // Step 3: If we have a semantic query, use Claude for ranking
    if (parsed.semantic && filtered.length > 0) {
      try {
        const results = await semanticSearch(parsed.semantic, filtered);

        return NextResponse.json({
          results,
          parsed: {
            semantic: parsed.semantic,
            filters: parsed.filters,
            explanation: parsed.explanation
          },
          stats: {
            total: items.length,
            filtered: filtered.length,
            returned: results.length
          }
        });
      } catch (semanticError) {
        console.error('Semantic search failed:', semanticError);
        // Fall through to keyword search
      }
    }

    // Step 4: Fallback to keyword search if no semantic query or AI failed
    if (parsed.keywords && parsed.keywords.length > 0) {
      // Match by exact keywords
      const keywordResults = filtered.filter(item => {
        const searchText = `${item.metadata?.title} ${item.rawContent} ${item.keywords?.join(' ')} ${item.tags?.join(' ')}`.toLowerCase();

        return parsed.keywords.some(keyword =>
          searchText.includes(keyword.toLowerCase())
        );
      });

      return NextResponse.json({
        results: keywordResults,
        parsed: {
          semantic: parsed.semantic,
          filters: parsed.filters,
          keywords: parsed.keywords,
          explanation: parsed.explanation
        },
        fallback: 'keyword',
        stats: {
          total: items.length,
          filtered: filtered.length,
          returned: keywordResults.length
        }
      });
    }

    // Step 5: Final fallback - return filtered results
    return NextResponse.json({
      results: filtered,
      parsed: {
        semantic: parsed.semantic,
        filters: parsed.filters,
        explanation: parsed.explanation
      },
      fallback: 'filter-only',
      stats: {
        total: items.length,
        filtered: filtered.length,
        returned: filtered.length
      }
    });

  } catch (error) {
    console.error('Search API error:', error);

    // Ultimate fallback to simple keyword search
    try {
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
        fallback: 'simple-keyword',
        error: error.message,
        stats: {
          total: items.length,
          returned: fallbackResults.length
        }
      });
    } catch (fallbackError) {
      return NextResponse.json(
        { error: 'Search failed', details: error.message },
        { status: 500 }
      );
    }
  }
}
