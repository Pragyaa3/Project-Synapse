# Quick Start Guide - High Priority Features

Get started with the new features in under 5 minutes.

## Start the Servers

```bash
npm install
npm run dev:all
```

This starts:
- 🌐 Web app: `http://localhost:3000`
- 🧠 MCP server: `http://localhost:3001`

---

## Feature 1: MCP Server (30 seconds)

Save content from external tools.

### Test It

```bash
curl -X POST http://localhost:3001/save \
  -H "Authorization: Bearer synapse-dev-key-123" \
  -H "Content-Type: application/json" \
  -d '{"content": "My first MCP save!"}'
```

✅ **Success:** Returns `{"success": true, "itemId": "..."}`

### Use It

**From JavaScript:**
```javascript
await fetch('http://localhost:3001/save', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer synapse-dev-key-123',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    content: 'Important note',
    metadata: { source: 'my-app' }
  })
});
```

**From Python:**
```python
import requests

requests.post('http://localhost:3001/save',
  headers={'Authorization': 'Bearer synapse-dev-key-123'},
  json={'content': 'Important note'}
)
```

---

## Feature 2: Background Processing (1 minute)

Fast saves, no waiting.

### Test It

```bash
curl -X POST http://localhost:3000/api/save \
  -H "Content-Type: application/json" \
  -d '{"content": "Test async", "async": true}'
```

✅ **Success:** Returns immediately with `jobs` object

### Check Status

```bash
# Get queue stats
curl http://localhost:3000/api/jobs

# Get specific job (use jobId from above)
curl "http://localhost:3000/api/jobs?id=<JOB_ID>"
```

### Use It

**Async mode (fast):**
```javascript
const response = await fetch('/api/save', {
  method: 'POST',
  body: JSON.stringify({
    content: 'My content',
    async: true  // Returns in <500ms
  })
});
```

**Sync mode (wait for classification):**
```javascript
const response = await fetch('/api/save', {
  method: 'POST',
  body: JSON.stringify({
    content: 'My content'
    // async: false is default
  })
});
```

---

## Feature 3: Smart Search (2 minutes)

Natural language queries with filters.

### Test It

1. Open `http://localhost:3000`

2. Try these queries:
   - `articles from last week`
   - `products under $100`
   - `videos about AI`
   - `quotes I saved yesterday`

3. Open browser console to see parsed query

### See Parsing

```javascript
const response = await fetch('/api/search', {
  method: 'POST',
  body: JSON.stringify({
    query: 'articles about AI from last month',
    items: [] // Empty for testing
  })
});

const data = await response.json();
console.log(data.parsed);
```

**Output:**
```json
{
  "semantic": "AI",
  "filters": {
    "types": ["article"],
    "dateRange": {
      "start": "2025-10-01",
      "end": "2025-10-31"
    }
  },
  "explanation": "Looking for articles about AI from last month"
}
```

### Supported Patterns

| Query | Extracts |
|-------|----------|
| "articles" | type: article |
| "last week" | date range |
| "under $100" | price ≤ 100 |
| "by Karpathy" | author: Karpathy |
| "AI agents" | semantic: AI agents |

---

## Feature 4: Error Recovery (Auto)

No data loss, ever.

### How It Works

1. Save fails → Auto-retry (1s delay)
2. Still fails → Retry again (2s delay)
3. Still fails → Retry once more (4s delay)
4. All fail → Save with fallback classification

### Test It

1. Temporarily break Claude API (invalid key in [.env.local](.env.local))
2. Save content:
   ```bash
   curl -X POST http://localhost:3000/api/save \
     -H "Content-Type: application/json" \
     -d '{"content": "Test retry"}'
   ```
3. Check server logs - you'll see retry attempts
4. Content still saved (type: "note" fallback)
5. Restore API key

✅ **Result:** Content never lost, even during failures

---

## Daily Usage

### Morning Routine

1. **Start servers:**
   ```bash
   npm run dev:all
   ```

2. **Open web app:**
   - `http://localhost:3000`

3. **Browse and capture:**
   - Use browser extension for quick saves
   - MCP server auto-captures from AI tools
   - Everything syncs to database

### Evening Review

1. **Search your day:**
   ```
   articles I saved today
   ```

2. **Check queue stats:**
   ```bash
   curl http://localhost:3000/api/jobs
   ```

3. **View processed items:**
   - All items auto-classified
   - Images analyzed
   - Ready to search

---

## Production Checklist

Before deploying to production:

### 1. Security
```env
# Generate strong API keys
openssl rand -base64 32

# Update .env.local
MCP_API_KEYS=<strong-random-key>
```

### 2. Performance
- [ ] Upgrade job queue to Redis/BullMQ
- [ ] Enable database connection pooling
- [ ] Add Redis cache for search results
- [ ] Set up CDN for images

### 3. Monitoring
- [ ] Add error tracking (Sentry)
- [ ] Set up uptime monitoring
- [ ] Configure log aggregation
- [ ] Create alerts for queue backlog

### 4. Deployment
- [ ] Deploy web app (Vercel/Railway)
- [ ] Deploy MCP server (separate service)
- [ ] Set up database backups
- [ ] Configure HTTPS/SSL

---

## Troubleshooting

### Problem: Port already in use

```bash
lsof -i :3001
kill -9 <PID>
```

### Problem: Jobs stuck

```bash
# Check queue
curl http://localhost:3000/api/jobs

# Restart server to clear
# Ctrl+C, then npm run dev:all
```

### Problem: Search not working

1. Check Claude API key in [.env.local](.env.local)
2. Try simple parsing: `useAI: false`
3. Check browser console for errors

### Problem: MCP authentication fails

1. Verify API key in [.env.local](.env.local)
2. Check header format: `Authorization: Bearer <key>`
3. Ensure no extra spaces

---

## Learn More

- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Overview of all features
- **[BLUEPRINT_IMPLEMENTATION.md](BLUEPRINT_IMPLEMENTATION.md)** - Detailed documentation
- **[TEST_HIGH_PRIORITY.md](TEST_HIGH_PRIORITY.md)** - Complete test suite
- **[mcp/README.md](mcp/README.md)** - MCP server guide

---

## Quick Commands

```bash
# Start everything
npm run dev:all

# Start web app only
npm run dev

# Start MCP only
npm run mcp

# Check MCP health
curl http://localhost:3001/health

# Check queue stats
curl http://localhost:3000/api/jobs

# Save via MCP
curl -X POST http://localhost:3001/save \
  -H "Authorization: Bearer synapse-dev-key-123" \
  -H "Content-Type: application/json" \
  -d '{"content": "Quick note"}'

# Test async save
curl -X POST http://localhost:3000/api/save \
  -H "Content-Type: application/json" \
  -d '{"content": "Async test", "async": true}'
```

---

## What's Next?

You now have all high-priority features working. Consider:

1. **Run tests** - [TEST_HIGH_PRIORITY.md](TEST_HIGH_PRIORITY.md)
2. **Explore integrations** - Connect Claude Desktop, Cursor, etc.
3. **Build workflows** - Automate with scripts
4. **Add medium-priority features** - Reader mode, vector search, mobile app

**Happy building!** 🚀
