# High Priority Features - Test Plan

Quick tests to verify all high-priority features are working correctly.

## Prerequisites

1. Start both servers:
   ```bash
   npm run dev
   ```

   In a separate terminal:
   ```bash
   npm run mcp
   ```

2. Or use the combined command:
   ```bash
   npm run dev:all
   ```

---

## Test 1: MCP Server

### Test 1.1: Health Check

```bash
curl http://localhost:3001/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "service": "synapse-mcp"
}
```

✅ Pass if status is "ok"

### Test 1.2: Info Endpoint

```bash
curl http://localhost:3001/info
```

**Expected Response:**
```json
{
  "service": "Synapse MCP Server",
  "version": "1.0.0",
  "endpoints": {...},
  "authentication": "Bearer token required",
  "rateLimit": "100 requests per 60 seconds"
}
```

✅ Pass if all fields present

### Test 1.3: Save Content via MCP

```bash
curl -X POST http://localhost:3001/save \
  -H "Authorization: Bearer synapse-dev-key-123" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test note from MCP server",
    "metadata": {
      "title": "MCP Test",
      "source": "test-script"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "itemId": "...",
  "type": "note",
  "message": "Content saved to Synapse successfully"
}
```

✅ Pass if success=true and itemId returned

### Test 1.4: Authentication Failure

```bash
curl -X POST http://localhost:3001/save \
  -H "Authorization: Bearer invalid-key" \
  -H "Content-Type: application/json" \
  -d '{"content": "Test"}'
```

**Expected Response:**
```json
{
  "error": "Invalid API key"
}
```

✅ Pass if returns 401 error

---

## Test 2: Background Job Processing

### Test 2.1: Async Save

```bash
curl -X POST http://localhost:3000/api/save \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test async processing",
    "async": true
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "async": true,
  "item": {
    "id": "...",
    "type": "processing",
    "status": "processing",
    "message": "Content saved. Processing in background..."
  },
  "jobs": {
    "classifyJobId": "...",
    "imageJobId": null
  }
}
```

✅ Pass if async=true and jobs object returned

### Test 2.2: Check Job Status

Using the `classifyJobId` from Test 2.1:

```bash
curl "http://localhost:3000/api/jobs?id=<JOB_ID>"
```

**Expected Response (while processing):**
```json
{
  "id": "...",
  "type": "classify",
  "status": "processing",
  "attempts": 1,
  "createdAt": "...",
  "updatedAt": "..."
}
```

**Expected Response (after completion):**
```json
{
  "id": "...",
  "type": "classify",
  "status": "completed",
  "attempts": 1,
  "result": {
    "contentType": "note",
    "keywords": [...],
    "tags": [...]
  }
}
```

✅ Pass if status changes from "processing" to "completed"

### Test 2.3: Queue Stats

```bash
curl http://localhost:3000/api/jobs
```

**Expected Response:**
```json
{
  "total": 5,
  "pending": 0,
  "processing": 1,
  "completed": 4,
  "failed": 0,
  "currentProcessing": 1,
  "maxConcurrency": 5
}
```

✅ Pass if stats returned with all fields

---

## Test 3: Error Handling & Retry Logic

### Test 3.1: Graceful Degradation

This test simulates Claude API failure.

**Setup:** Temporarily change the API key in [.env.local](.env.local) to an invalid value:

```env
NEXT_PUBLIC_ANTHROPIC_AUTH_TOKEN=invalid-key-for-testing
```

**Test:**

```bash
curl -X POST http://localhost:3000/api/save \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This should trigger fallback classification"
  }'
```

**Expected Behavior:**
- Server logs show retry attempts: "Attempt 1 failed, retrying in 1000ms..."
- After 3 retries, uses fallback classification
- Response includes `type: "note"` (fallback type)
- Content is still saved to database

✅ Pass if content saved despite API failure

**Cleanup:** Restore the correct API key in [.env.local](.env.local)

### Test 3.2: Database Retry

This is tested automatically by the retry logic. Check server logs when saving content - you should see successful saves even during brief network issues.

✅ Pass if no 500 errors occur during normal operation

---

## Test 4: Query Parsing

### Test 4.1: Simple Query Parsing

Open browser console at `http://localhost:3000` and run:

```javascript
const response = await fetch('/api/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'articles about AI',
    items: [], // Empty for testing parsing only
    useAI: false // Use simple regex parsing
  })
});

const data = await response.json();
console.log(data.parsed);
```

**Expected Output:**
```json
{
  "semantic": "AI",
  "filters": {
    "types": ["article"],
    "dateRange": null,
    "entities": [],
    "priceRange": null
  },
  "keywords": []
}
```

✅ Pass if "article" type extracted

### Test 4.2: Date Range Parsing

```javascript
const response = await fetch('/api/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'videos from last week',
    items: [],
    useAI: false
  })
});

const data = await response.json();
console.log(data.parsed);
```

**Expected Output:**
```json
{
  "semantic": "",
  "filters": {
    "types": ["video"],
    "dateRange": {
      "start": "2025-11-02T00:00:00.000Z",
      "end": "2025-11-08T23:59:59.999Z"
    }
  }
}
```

✅ Pass if date range correctly calculated for last week

### Test 4.3: Price Range Parsing

```javascript
const response = await fetch('/api/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'products under $100',
    items: [],
    useAI: false
  })
});

const data = await response.json();
console.log(data.parsed);
```

**Expected Output:**
```json
{
  "semantic": "",
  "filters": {
    "types": ["product"],
    "priceRange": {
      "min": 0,
      "max": 100
    }
  }
}
```

✅ Pass if price range extracted correctly

### Test 4.4: AI Query Parsing (Full Test)

This requires Claude API to be working.

```javascript
const response = await fetch('/api/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'articles about AI agents I saved last month',
    items: [],
    useAI: true // Enable AI parsing
  })
});

const data = await response.json();
console.log(data.parsed);
```

**Expected Output:**
```json
{
  "semantic": "AI agents",
  "filters": {
    "types": ["article"],
    "author": null,
    "entities": ["AI agents"],
    "priceRange": null,
    "dateRange": {
      "start": "2025-10-01T00:00:00.000Z",
      "end": "2025-10-31T23:59:59.999Z"
    }
  },
  "explanation": "Looking for articles about AI agents from last month"
}
```

✅ Pass if all filters extracted correctly + explanation provided

### Test 4.5: Search with Filtering

Create some test data first via the web UI, then search:

```javascript
// Get all items first
const itemsResponse = await fetch('/api/save');
const { items } = await itemsResponse.json();

// Search with query parsing
const searchResponse = await fetch('/api/search', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'articles from last 7 days',
    items: items,
    useAI: true
  })
});

const data = await searchResponse.json();
console.log(data.stats);
console.log(data.results);
```

**Expected Output:**
```json
{
  "results": [/* only articles from last 7 days */],
  "stats": {
    "total": 50,
    "filtered": 12,
    "returned": 5
  }
}
```

✅ Pass if:
- `filtered` < `total` (filtering worked)
- Results only include articles
- Results only from last 7 days

---

## Integration Test: Complete Flow

This tests all features together.

### Step 1: Save via MCP (Background Processing + Retry)

```bash
curl -X POST http://localhost:3001/save \
  -H "Authorization: Bearer synapse-dev-key-123" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Anthropic released Claude Sonnet 4 with improved coding abilities. The model shows significant improvements in agentic behavior and tool use.",
    "url": "https://anthropic.com/news/claude-sonnet-4",
    "metadata": {
      "title": "Claude Sonnet 4 Release",
      "author": "Anthropic",
      "source": "anthropic-blog"
    }
  }'
```

### Step 2: Wait for Processing (2-5 seconds)

### Step 3: Search with Query Parsing

Open web app at `http://localhost:3000` and search:

```
articles by Anthropic about Claude
```

**Expected Result:**
- The saved article appears in results
- Console shows parsed query with `filters.author: "Anthropic"`
- Result is ranked highly due to semantic match

✅ Pass if the saved article is found and ranked correctly

---

## Performance Benchmarks

### MCP Server Response Time

```bash
time curl -X POST http://localhost:3001/save \
  -H "Authorization: Bearer synapse-dev-key-123" \
  -H "Content-Type: application/json" \
  -d '{"content": "Quick test"}'
```

**Expected:** < 1 second
✅ Pass if response within 1s

### Async Save Response Time

```bash
time curl -X POST http://localhost:3000/api/save \
  -H "Content-Type: application/json" \
  -d '{"content": "Async test", "async": true}'
```

**Expected:** < 500ms
✅ Pass if response within 500ms

### Query Parsing Time

Use browser console:

```javascript
console.time('parse');
await fetch('/api/search', {
  method: 'POST',
  body: JSON.stringify({
    query: 'articles about AI from last month',
    items: [],
    useAI: false
  })
});
console.timeEnd('parse');
```

**Expected:** < 100ms (simple parsing)
✅ Pass if < 100ms

---

## Troubleshooting

### MCP Server won't start

**Error:** `EADDRINUSE: address already in use :::3001`

**Solution:**
```bash
# Find process using port 3001
lsof -i :3001
# Kill it
kill -9 <PID>
# Or use different port
MCP_PORT=3002 npm run mcp
```

### Jobs stuck in "processing"

**Check queue stats:**
```bash
curl http://localhost:3000/api/jobs
```

**Restart server to clear queue:**
```bash
# Ctrl+C to stop
npm run dev
```

### Search returns empty results

**Check:**
1. Are there items in the database?
   ```bash
   curl http://localhost:3000/api/save | json_pp
   ```

2. Is the query being parsed correctly?
   - Open browser console
   - Check `data.parsed` in response

3. Is Claude API working?
   - Check `.env.local` for valid API key
   - Check server logs for errors

### Authentication fails on MCP

**Check:**
1. API key is in `.env.local`: `MCP_API_KEYS=synapse-dev-key-123`
2. Using correct format: `Authorization: Bearer synapse-dev-key-123`
3. No spaces in API key

---

## Test Results Checklist

After running all tests, verify:

- ✅ MCP server health check passes
- ✅ MCP save endpoint works with authentication
- ✅ Async save returns immediately with job IDs
- ✅ Job status can be checked
- ✅ Queue stats endpoint works
- ✅ Retry logic handles failures gracefully
- ✅ Simple query parsing extracts filters
- ✅ AI query parsing works (if API key valid)
- ✅ Search applies filters correctly
- ✅ Integration test (MCP → Process → Search) passes
- ✅ Performance benchmarks meet targets

**All tests passing?** Congratulations! All high-priority features are working correctly. 🎉

---

## Next Steps

1. Run these tests in your environment
2. Add your own test cases for specific use cases
3. Consider adding automated tests (Jest/Vitest)
4. Monitor production performance
5. Implement medium-priority features (reader mode, vector search, etc.)

See [BLUEPRINT_IMPLEMENTATION.md](BLUEPRINT_IMPLEMENTATION.md) for complete documentation.
