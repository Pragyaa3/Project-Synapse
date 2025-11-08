// MCP (Model-Context-Protocol) Server for Synapse
// Allows third-party AI tools (Claude Desktop, Cursor, etc.) to save content to Synapse

import { createServer } from 'http';
import { parse } from 'url';

const PORT = process.env.MCP_PORT || 3001;
const API_KEYS = (process.env.MCP_API_KEYS || '').split(',').filter(Boolean);
const SYNAPSE_API_URL = process.env.SYNAPSE_API_URL || 'http://localhost:3000';

// Simple in-memory rate limiting
const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 100; // requests per window

function checkRateLimit(apiKey) {
  const now = Date.now();
  const limit = rateLimits.get(apiKey) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW };

  if (now > limit.resetAt) {
    limit.count = 0;
    limit.resetAt = now + RATE_LIMIT_WINDOW;
  }

  limit.count++;
  rateLimits.set(apiKey, limit);

  return limit.count <= RATE_LIMIT_MAX;
}

function validateApiKey(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return { valid: false, error: 'Missing Authorization header' };
  }

  const match = authHeader.match(/^Bearer (.+)$/);
  if (!match) {
    return { valid: false, error: 'Invalid Authorization format. Use: Bearer <api_key>' };
  }

  const apiKey = match[1];

  // If no API keys configured, allow all (dev mode)
  if (API_KEYS.length === 0) {
    console.warn('⚠️  No API keys configured. All requests allowed (dev mode).');
    return { valid: true, apiKey: 'dev' };
  }

  if (!API_KEYS.includes(apiKey)) {
    return { valid: false, error: 'Invalid API key' };
  }

  if (!checkRateLimit(apiKey)) {
    return { valid: false, error: 'Rate limit exceeded. Try again later.' };
  }

  return { valid: true, apiKey };
}

async function handleRequest(req, res) {
  const { pathname } = parse(req.url, true);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check
  if (pathname === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'synapse-mcp' }));
    return;
  }

  // Info endpoint
  if (pathname === '/info' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      service: 'Synapse MCP Server',
      version: '1.0.0',
      endpoints: {
        '/save': 'POST - Save content to Synapse',
        '/health': 'GET - Health check',
        '/info': 'GET - This information'
      },
      authentication: 'Bearer token required',
      rateLimit: `${RATE_LIMIT_MAX} requests per ${RATE_LIMIT_WINDOW / 1000} seconds`
    }));
    return;
  }

  // All other endpoints require authentication
  const auth = validateApiKey(req);
  if (!auth.valid) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: auth.error }));
    return;
  }

  // Save endpoint
  if (pathname === '/save' && req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);

        // Validate request
        if (!data.content && !data.url && !data.imageData) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'At least one of content, url, or imageData is required',
            received: Object.keys(data)
          }));
          return;
        }

        // Transform MCP format to Synapse API format
        const synapsePayload = {
          content: data.content || '',
          url: data.url || null,
          imageData: data.imageData || null,
          pageTitle: data.metadata?.title || data.title || null,
          metadata: {
            title: data.metadata?.title || data.title || null,
            description: data.metadata?.description || data.description || null,
            author: data.metadata?.author || data.author || null,
            platform: data.metadata?.source || data.source || null,
            price: data.metadata?.price || null,
            thumbnail: data.metadata?.imageUrl || null,
            ...data.metadata
          }
        };

        // Forward to Synapse API
        const response = await fetch(`${SYNAPSE_API_URL}/api/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(synapsePayload),
        });

        const result = await response.json();

        if (!response.ok) {
          res.writeHead(response.status, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'Failed to save to Synapse',
            details: result.error || result.details
          }));
          return;
        }

        // Return success with item ID
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          itemId: result.item?.id,
          type: result.item?.type,
          message: 'Content saved to Synapse successfully'
        }));

      } catch (error) {
        console.error('MCP Server error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'Internal server error',
          details: error.message
        }));
      }
    });

    return;
  }

  // 404 for unknown routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
}

const server = createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`🧠 Synapse MCP Server running on port ${PORT}`);
  console.log(`📡 Endpoints:`);
  console.log(`   POST http://localhost:${PORT}/save`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   GET  http://localhost:${PORT}/info`);
  console.log(`🔐 API Keys: ${API_KEYS.length > 0 ? API_KEYS.length + ' configured' : 'None (dev mode)'}`);
});
