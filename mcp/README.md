# Synapse MCP Server

Model-Context-Protocol server for Synapse that enables third-party AI tools (Claude Desktop, Cursor, etc.) to save content directly to your Synapse knowledge base.

## Quick Start

### 1. Configure API Keys (Optional)

Add to [.env.local](.env.local):

```env
# MCP Server Configuration
MCP_PORT=3001
MCP_API_KEYS=your-secret-key-1,your-secret-key-2
SYNAPSE_API_URL=http://localhost:3000
```

If no `MCP_API_KEYS` are set, the server runs in dev mode (no authentication).

### 2. Start the Server

```bash
node mcp/server.js
```

The server will run on `http://localhost:3001`

### 3. Test the Server

```bash
# Health check
curl http://localhost:3001/health

# Save content (with API key)
curl -X POST http://localhost:3001/save \
  -H "Authorization: Bearer your-secret-key-1" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is a test note from Claude Desktop",
    "metadata": {
      "title": "Test Note",
      "source": "claude-desktop"
    }
  }'
```

## API Reference

### Authentication

All endpoints except `/health` and `/info` require Bearer token authentication:

```
Authorization: Bearer <your-api-key>
```

### Rate Limiting

- **100 requests per minute** per API key
- Returns `401` when limit exceeded

### Endpoints

#### `POST /save`

Save content to Synapse.

**Request Body:**

```json
{
  "content": "string (optional)",
  "url": "string (optional)",
  "imageData": "base64 string (optional)",
  "title": "string (optional)",
  "description": "string (optional)",
  "author": "string (optional)",
  "source": "string (optional)",
  "metadata": {
    "title": "string",
    "description": "string",
    "author": "string",
    "source": "string",
    "price": "string",
    "imageUrl": "string"
  }
}
```

**At least one of** `content`, `url`, or `imageData` **is required**.

**Response (200):**

```json
{
  "success": true,
  "itemId": "1234567890-abc123",
  "type": "article",
  "message": "Content saved to Synapse successfully"
}
```

**Response (400 - Missing data):**

```json
{
  "error": "At least one of content, url, or imageData is required",
  "received": ["metadata"]
}
```

**Response (401 - Unauthorized):**

```json
{
  "error": "Invalid API key"
}
```

#### `GET /health`

Health check endpoint (no authentication required).

**Response (200):**

```json
{
  "status": "ok",
  "service": "synapse-mcp"
}
```

#### `GET /info`

Server information (no authentication required).

**Response (200):**

```json
{
  "service": "Synapse MCP Server",
  "version": "1.0.0",
  "endpoints": {
    "/save": "POST - Save content to Synapse",
    "/health": "GET - Health check",
    "/info": "GET - This information"
  },
  "authentication": "Bearer token required",
  "rateLimit": "100 requests per 60 seconds"
}
```

## Integration Examples

### Claude Desktop

Configure Claude Desktop to use Synapse MCP:

1. Add to Claude Desktop's MCP settings (usually in `~/Library/Application Support/Claude/mcp_settings.json` on Mac):

```json
{
  "mcpServers": {
    "synapse": {
      "url": "http://localhost:3001",
      "apiKey": "your-secret-key-1"
    }
  }
}
```

2. In Claude Desktop, you can now say:
   - "Save this to Synapse: [your content]"
   - "Remember this article: [URL]"
   - "Add to my knowledge base: [text]"

### Cursor IDE

Use the MCP server in Cursor:

```javascript
// In Cursor, call the MCP endpoint
await fetch('http://localhost:3001/save', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-secret-key-1',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: selectedText,
    metadata: {
      source: 'cursor-ide',
      title: fileName
    }
  })
});
```

### JavaScript/Node.js

```javascript
async function saveToSynapse(content, metadata = {}) {
  const response = await fetch('http://localhost:3001/save', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer your-secret-key-1',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      content,
      metadata
    })
  });

  return await response.json();
}

// Usage
await saveToSynapse('Important note', {
  title: 'Meeting Notes',
  author: 'John Doe',
  source: 'my-app'
});
```

### Python

```python
import requests

def save_to_synapse(content, metadata=None):
    response = requests.post(
        'http://localhost:3001/save',
        headers={
            'Authorization': 'Bearer your-secret-key-1',
            'Content-Type': 'application/json'
        },
        json={
            'content': content,
            'metadata': metadata or {}
        }
    )
    return response.json()

# Usage
save_to_synapse('Important note', {
    'title': 'Meeting Notes',
    'author': 'John Doe',
    'source': 'my-script'
})
```

## Data Contract

The MCP server accepts data in a flexible format and transforms it to Synapse's internal format:

**Input (MCP format):**
```json
{
  "content": "text content",
  "url": "https://example.com",
  "imageData": "base64...",
  "title": "string",
  "description": "string",
  "author": "string",
  "source": "string",
  "metadata": {
    "any": "additional fields"
  }
}
```

**Output (Synapse format):**
```json
{
  "content": "text content",
  "url": "https://example.com",
  "imageData": "base64...",
  "pageTitle": "string",
  "metadata": {
    "title": "string",
    "description": "string",
    "author": "string",
    "platform": "string",
    "price": "string",
    "thumbnail": "string"
  }
}
```

The server automatically:
- Validates required fields
- Transforms field names
- Forwards to Synapse API
- Returns success/error responses

## Production Deployment

### Environment Variables

```env
MCP_PORT=3001
MCP_API_KEYS=prod-key-1,prod-key-2,prod-key-3
SYNAPSE_API_URL=https://your-synapse-domain.com
NODE_ENV=production
```

### With PM2

```bash
npm install -g pm2

pm2 start mcp/server.js --name synapse-mcp
pm2 save
pm2 startup
```

### With Docker

```dockerfile
# Dockerfile.mcp
FROM node:20-alpine

WORKDIR /app
COPY mcp/server.js .

EXPOSE 3001

CMD ["node", "server.js"]
```

```bash
docker build -f Dockerfile.mcp -t synapse-mcp .
docker run -d -p 3001:3001 --env-file .env.local synapse-mcp
```

### Security Considerations

1. **Always use HTTPS** in production
2. **Rotate API keys** regularly
3. **Use strong, random keys**: `openssl rand -base64 32`
4. **Monitor rate limits** and adjust based on usage
5. **Set up firewall rules** to restrict access
6. **Use environment variables** for sensitive data (never commit keys)

## Troubleshooting

### Server won't start

```bash
# Check if port is in use
lsof -i :3001

# Use different port
MCP_PORT=3002 node mcp/server.js
```

### 401 Unauthorized

- Check that `Authorization` header is present
- Verify API key is in `MCP_API_KEYS` environment variable
- Ensure format is `Bearer <key>` (not just `<key>`)

### Connection refused

- Make sure Synapse web app is running on `http://localhost:3000`
- Check `SYNAPSE_API_URL` environment variable
- Verify network connectivity

### Rate limit exceeded

- Wait 60 seconds for window to reset
- Increase `RATE_LIMIT_MAX` in server.js
- Use multiple API keys to distribute load

## Development

### Run with auto-reload

```bash
npm install -g nodemon
nodemon mcp/server.js
```

### Enable debug logging

```javascript
// Add to server.js
const DEBUG = process.env.DEBUG === 'true';

if (DEBUG) {
  console.log('Request:', req.method, req.url, body);
}
```

```bash
DEBUG=true node mcp/server.js
```

## License

Part of the Synapse project.
