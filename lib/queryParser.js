// Query parser for intelligent search
// Extracts entities, filters, and semantic meaning from natural language queries

import { callClaude } from './claude.js';

// Content types supported by Synapse
const CONTENT_TYPES = [
  'article', 'product', 'video', 'todo', 'quote', 'image',
  'screenshot', 'diagram', 'meme', 'book', 'link', 'note',
  'design', 'code'
];

// Date range patterns
const DATE_PATTERNS = {
  'today': () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return { start: today, end: new Date() };
  },
  'yesterday': () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const end = new Date(yesterday);
    end.setHours(23, 59, 59, 999);
    return { start: yesterday, end };
  },
  'this week': () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    start.setHours(0, 0, 0, 0);
    return { start, end: new Date() };
  },
  'last week': () => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() - 7);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  },
  'this month': () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start, end: new Date() };
  },
  'last month': () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { start, end };
  },
  'last 7 days': () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  },
  'last 30 days': () => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 30);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }
};

// Parse query using simple pattern matching (fast, no AI)
export function parseQuerySimple(query) {
  const lowerQuery = query.toLowerCase();

  const parsed = {
    semantic: query, // Original query for semantic search
    filters: {
      types: [],
      dateRange: null,
      entities: [],
      priceRange: null
    },
    keywords: []
  };

  // Extract content types
  for (const type of CONTENT_TYPES) {
    const regex = new RegExp(`\\b${type}s?\\b`, 'i');
    if (regex.test(query)) {
      parsed.filters.types.push(type);
      // Remove from semantic query
      parsed.semantic = parsed.semantic.replace(regex, '').trim();
    }
  }

  // Extract date ranges
  for (const [pattern, getRange] of Object.entries(DATE_PATTERNS)) {
    if (lowerQuery.includes(pattern)) {
      parsed.filters.dateRange = getRange();
      parsed.semantic = parsed.semantic.replace(new RegExp(pattern, 'gi'), '').trim();
      break;
    }
  }

  // Extract price ranges (e.g., "under $100", "$50-$200", "less than $300")
  const pricePatterns = [
    { regex: /under\s+\$(\d+)/i, type: 'max' },
    { regex: /less\s+than\s+\$(\d+)/i, type: 'max' },
    { regex: /below\s+\$(\d+)/i, type: 'max' },
    { regex: /over\s+\$(\d+)/i, type: 'min' },
    { regex: /more\s+than\s+\$(\d+)/i, type: 'min' },
    { regex: /above\s+\$(\d+)/i, type: 'min' },
    { regex: /\$(\d+)\s*-\s*\$(\d+)/i, type: 'range' }
  ];

  for (const { regex, type } of pricePatterns) {
    const match = query.match(regex);
    if (match) {
      if (type === 'range') {
        parsed.filters.priceRange = {
          min: parseInt(match[1]),
          max: parseInt(match[2])
        };
      } else if (type === 'max') {
        parsed.filters.priceRange = {
          min: 0,
          max: parseInt(match[1])
        };
      } else if (type === 'min') {
        parsed.filters.priceRange = {
          min: parseInt(match[1]),
          max: Infinity
        };
      }
      parsed.semantic = parsed.semantic.replace(regex, '').trim();
      break;
    }
  }

  // Extract quoted phrases (exact match keywords)
  const quotedRegex = /"([^"]+)"/g;
  let match;
  while ((match = quotedRegex.exec(query)) !== null) {
    parsed.keywords.push(match[1]);
    parsed.semantic = parsed.semantic.replace(match[0], '').trim();
  }

  // Clean up semantic query
  parsed.semantic = parsed.semantic
    .replace(/\s+/g, ' ')
    .replace(/^(from|by|about|saved|i saved)\s+/i, '')
    .trim();

  return parsed;
}

// Parse query using AI (more accurate, slower)
export async function parseQueryAI(query) {
  try {
    const prompt = `You are a query parser for a knowledge management system called Synapse.
Parse this natural language search query and extract structured information.

Query: "${query}"

Extract:
1. Content types (from: ${CONTENT_TYPES.join(', ')})
2. Date range (today, yesterday, this week, last week, this month, last month, last 7 days, last 30 days, or specific dates)
3. Author/entities mentioned
4. Price range (if mentioned)
5. Keywords and main semantic meaning
6. Any exact phrases to match

Return a JSON object with this structure:
{
  "semantic": "the core meaning of the query without filters",
  "filters": {
    "types": ["array of content types"],
    "author": "author name if mentioned",
    "entities": ["array of entities like names, products, topics"],
    "priceRange": { "min": number, "max": number } or null,
    "datePhrase": "original date phrase" or null
  },
  "keywords": ["exact phrases to match"],
  "explanation": "brief explanation of how you parsed the query"
}

Examples:

Query: "articles about AI agents I saved last month"
{
  "semantic": "AI agents",
  "filters": {
    "types": ["article"],
    "author": null,
    "entities": ["AI agents"],
    "priceRange": null,
    "datePhrase": "last month"
  },
  "keywords": [],
  "explanation": "Looking for articles about AI agents from last month"
}

Query: "that quote about new beginnings from the handwritten note"
{
  "semantic": "new beginnings",
  "filters": {
    "types": ["quote", "note"],
    "author": null,
    "entities": ["new beginnings"],
    "priceRange": null,
    "datePhrase": null
  },
  "keywords": ["new beginnings"],
  "explanation": "Looking for a quote about new beginnings in a handwritten note"
}

Query: "what Karpathy said about tokenization in that paper"
{
  "semantic": "tokenization",
  "filters": {
    "types": ["article", "note"],
    "author": "Karpathy",
    "entities": ["Karpathy", "tokenization"],
    "priceRange": null,
    "datePhrase": null
  },
  "keywords": ["tokenization"],
  "explanation": "Looking for content by Karpathy about tokenization"
}

Query: "black shoes under $300"
{
  "semantic": "black shoes",
  "filters": {
    "types": ["product"],
    "author": null,
    "entities": ["black shoes"],
    "priceRange": { "min": 0, "max": 300 },
    "datePhrase": null
  },
  "keywords": ["black", "shoes"],
  "explanation": "Looking for product items with black shoes under $300"
}

Now parse the query above and return ONLY the JSON object, no other text.`;

    const messages = [
      {
        role: 'user',
        content: prompt
      }
    ];

    const result = await callClaude(messages, 2048);

    // Extract JSON from response
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Convert date phrase to actual date range
    if (parsed.filters.datePhrase) {
      const datePhraseNormalized = parsed.filters.datePhrase.toLowerCase();
      for (const [pattern, getRange] of Object.entries(DATE_PATTERNS)) {
        if (datePhraseNormalized.includes(pattern)) {
          parsed.filters.dateRange = getRange();
          break;
        }
      }
    }

    return parsed;

  } catch (error) {
    console.error('AI query parsing failed, falling back to simple parser:', error);
    return parseQuerySimple(query);
  }
}

// Apply filters to items array
export function applyFilters(items, filters) {
  let filtered = items;

  // Filter by content types
  if (filters.types && filters.types.length > 0) {
    filtered = filtered.filter(item =>
      filters.types.includes(item.type)
    );
  }

  // Filter by date range
  if (filters.dateRange) {
    filtered = filtered.filter(item => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= filters.dateRange.start &&
             itemDate <= filters.dateRange.end;
    });
  }

  // Filter by author
  if (filters.author) {
    filtered = filtered.filter(item =>
      item.metadata?.author?.toLowerCase().includes(filters.author.toLowerCase())
    );
  }

  // Filter by price range
  if (filters.priceRange) {
    filtered = filtered.filter(item => {
      if (!item.metadata?.price) return false;

      // Extract numeric price
      const priceStr = item.metadata.price.replace(/[^0-9.]/g, '');
      const price = parseFloat(priceStr);

      if (isNaN(price)) return false;

      return price >= filters.priceRange.min &&
             price <= filters.priceRange.max;
    });
  }

  return filtered;
}

// Main query parsing function (combines simple + AI)
export async function parseQuery(query, useAI = true) {
  if (useAI) {
    return await parseQueryAI(query);
  } else {
    return parseQuerySimple(query);
  }
}

export default parseQuery;
