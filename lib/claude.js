// lib/claude.js

const ANTHROPIC_BASE_URL = 'https://litellm-339960399182.us-central1.run.app';
const API_KEY = process.env.NEXT_PUBLIC_ANTHROPIC_AUTH_TOKEN;

export async function callClaude(messages, maxTokens = 1024) {
  try {
    const response = await fetch(`${ANTHROPIC_BASE_URL}/v1/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-1-20250805',
        max_tokens: maxTokens,
        messages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Claude API call failed:', error);
    throw error;
  }
}

export async function classifyContent(content, url, imageData = null) {
  const prompt = `Analyze this content and return ONLY valid JSON (no markdown, no backticks):

Content: ${content}
${url ? `URL: ${url}` : ''}

${imageData ? `
IMPORTANT: An image is attached. Analyze the visual content including:
- Any text visible in the image (OCR)
- Diagrams, charts, or flowcharts
- Color schemes and design elements
- Objects, people, or scenes
- Technical content (code, screenshots, UI designs)
- Overall context and purpose

Include image analysis in your classification.
` : ''}

Return this exact structure:
{
  "contentType": "article|product|video|todo|quote|image|note|design|code|screenshot|diagram|meme",
  "title": "extracted or generated title",
  "summary": "one sentence summary",
  "metadata": {
    "author": "if available",
    "price": "if product",
    "date": "if available",
    "source": "website/platform name",
    "imageUrl": "if available",
    "description": "brief description",
    "imageAnalysis": "detailed description of image content (if image provided)",
    "extractedText": "any text found in image (if applicable)",
    "colors": ["dominant", "colors"] (if image),
    "visualType": "screenshot|diagram|photo|design|chart|meme|other" (if image)
  },
  "tags": ["relevant", "tags"],
  "keywords": ["searchable", "keywords", "phrases"],
  "visualFormat": "card|list|gallery|player|document"
}`;

  try {
    // Build message content with optional image
    const messageContent = [];

    if (imageData) {
      // Add image first
      messageContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/png',
          data: imageData,
        },
      });
    }

    // Add text prompt
    messageContent.push({
      type: 'text',
      text: prompt,
    });

    const response = await callClaude([{
      role: 'user',
      content: messageContent
    }], 2048);

    const cleanedResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('Classification failed:', error);
    return {
      contentType: imageData ? 'image' : 'note',
      title: imageData ? 'Uploaded Image' : 'Untitled',
      summary: content ? content.substring(0, 100) : 'Image content',
      metadata: {},
      tags: [],
      keywords: [],
      visualFormat: 'card'
    };
  }
}

export async function semanticSearch(query, items) {
  const prompt = `Given this search query: "${query}"

And these saved items:
${items.map(item => `
ID: ${item.id}
Type: ${item.type}
Title: ${item.metadata.title || 'Untitled'}
Keywords: ${item.keywords.join(', ')}
Tags: ${item.tags.join(', ')}
`).join('\n---\n')}

Return ONLY a JSON array of item IDs that match, ordered by relevance:
["id1", "id2", "id3"]

Match based on semantic meaning, keywords, tags, and metadata.
Return empty array [] if no matches.`;

  try {
    const response = await callClaude([{ role: 'user', content: prompt }], 1024);
    const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const matchedIds = JSON.parse(cleanedResponse);
    
    return matchedIds
      .map(id => items.find(item => item.id === id))
      .filter(Boolean);
  } catch (error) {
    console.error('Search failed:', error);
    const lowerQuery = query.toLowerCase();
    return items.filter(item => 
      item.metadata.title?.toLowerCase().includes(lowerQuery) ||
      item.keywords.some(k => k.toLowerCase().includes(lowerQuery)) ||
      item.tags.some(t => t.toLowerCase().includes(lowerQuery))
    );
  }
}

export async function analyzeVoiceTranscript(transcript) {
  const prompt = `Analyze this voice note transcript:

"${transcript}"

Return ONLY valid JSON:
{
  "keywords": ["key", "concepts"],
  "tone": "excited|important|casual|urgent|thoughtful",
  "summary": "one sentence",
  "categories": ["topics"]
}`;

  try {
    const response = await callClaude([{ role: 'user', content: prompt }], 512);
    const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error('Voice analysis failed:', error);
    return {
      keywords: [],
      tone: 'casual',
      summary: transcript.substring(0, 100),
      categories: []
    };
  }
}