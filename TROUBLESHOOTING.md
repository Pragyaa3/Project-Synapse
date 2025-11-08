# Troubleshooting Guide

Common issues and solutions for Synapse.

---

## Issue: Port 3000 Already in Use

**Error:**
```
⚠ Port 3000 is in use by process 4332, using available port 3002 instead.
```

**Solution 1: Kill the existing process (Windows)**

```bash
# Find what's using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with the actual number)
taskkill //F //PID <PID>
```

**Solution 2: Kill the existing process (Mac/Linux)**

```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

**Solution 3: Use a different port**

```bash
# Start on port 3002
PORT=3002 npm run dev
```

---

## Issue: Next.js Lock File Error

**Error:**
```
⨯ Unable to acquire lock at .next/dev/lock, is another instance of next dev running?
```

**Solution 1: Remove lock file**

```bash
# Windows
del .next\dev\lock

# Mac/Linux
rm .next/dev/lock
```

**Solution 2: Kill all Node processes**

```bash
# Windows
taskkill //F //IM node.exe

# Mac/Linux
pkill -f node
```

**Solution 3: Clean and restart**

```bash
# Remove .next directory
rm -rf .next

# Restart
npm run dev
```

---

## Issue: Module Type Warning for MCP Server

**Error:**
```
Warning: Module type of file:///C:/Users/pragy/synapse/mcp/server.js is not specified
```

**Solution:**

This is already fixed! The file [`mcp/package.json`](mcp/package.json) has been created with `"type": "module"`.

If you still see the warning, it's harmless and can be ignored. The MCP server will work correctly.

---

## Issue: MCP Server Won't Start

**Error:**
```
EADDRINUSE: address already in use :::3001
```

**Solution 1: Kill process on port 3001**

```bash
# Windows
netstat -ano | findstr :3001
taskkill //F //PID <PID>

# Mac/Linux
lsof -i :3001
kill -9 <PID>
```

**Solution 2: Use different port**

```bash
MCP_PORT=3002 npm run mcp
```

---

## Issue: Both Servers Won't Start Together

**Error:**
```
npm run dev exited with code 1
```

**Solution: Start servers separately**

**Terminal 1:**
```bash
npm run dev
```

**Terminal 2:**
```bash
npm run mcp
```

This gives you more control and better error visibility.

---

## Issue: Authentication Fails on MCP

**Error:**
```
{"error": "Invalid API key"}
```

**Solution 1: Check .env.local**

Make sure [.env.local](.env.local) has:
```env
MCP_API_KEYS=synapse-dev-key-123,synapse-prod-key-456
```

**Solution 2: Check request format**

Ensure you're using the correct header format:
```bash
curl -H "Authorization: Bearer synapse-dev-key-123" ...
```

NOT:
```bash
curl -H "Authorization: synapse-dev-key-123" ...  # Missing "Bearer"
```

---

## Issue: Jobs Stuck in "Processing"

**Error:**
```
Job status remains "processing" forever
```

**Solution 1: Check queue stats**

```bash
curl http://localhost:3000/api/jobs
```

If `processing` count is high, restart the server:
```bash
# Ctrl+C to stop
npm run dev
```

**Solution 2: Check Claude API**

Make sure your Claude API key is valid in [.env.local](.env.local):
```env
NEXT_PUBLIC_ANTHROPIC_AUTH_TOKEN=sk-...
```

**Solution 3: Increase timeout**

Jobs have a 30-second timeout. For large operations, you may need to increase this in [`app/api/save/route.js`](app/api/save/route.js:242):

```javascript
async function waitForJob(queue, jobId, timeout = 60000) { // Increase to 60s
```

---

## Issue: Search Returns Empty Results

**Problem:** Query returns no results even though items exist

**Solution 1: Check if items exist**

```bash
curl http://localhost:3000/api/save
```

If empty, you have no items in the database.

**Solution 2: Check query parsing**

Open browser console at `http://localhost:3000` and run:

```javascript
const response = await fetch('/api/search', {
  method: 'POST',
  body: JSON.stringify({
    query: 'your query here',
    items: [] // Empty for testing
  })
});
const data = await response.json();
console.log(data.parsed);
```

Check if filters are too restrictive.

**Solution 3: Disable AI parsing**

```javascript
const response = await fetch('/api/search', {
  method: 'POST',
  body: JSON.stringify({
    query: 'your query',
    items: yourItems,
    useAI: false  // Use simple regex parsing
  })
});
```

---

## Issue: Database Connection Error

**Error:**
```
PrismaClientKnownRequestError: Can't reach database server
```

**Solution 1: Check DATABASE_URL**

Make sure [.env.local](.env.local) has correct Supabase credentials:
```env
DATABASE_URL="postgresql://..."
```

**Solution 2: Test connection**

```bash
npx prisma db pull
```

If this fails, your database credentials are wrong.

**Solution 3: Check Supabase status**

Visit https://status.supabase.com/ to check if Supabase is down.

---

## Issue: Image Upload Fails

**Error:**
```
Image upload failed, storing base64 as fallback
```

**Solution 1: Check Supabase Storage**

Make sure you have a bucket named `synapse-images` in your Supabase project.

**Solution 2: Check Supabase credentials**

Verify [.env.local](.env.local) has:
```env
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**Solution 3: Accept base64 fallback**

The system automatically falls back to base64 storage if upload fails. This is less efficient but ensures no data loss.

---

## Issue: Voice Transcription Fails

**Error:**
```
Voice transcription failed
```

**Solution 1: Check OpenAI API key**

Make sure [.env.local](.env.local) has:
```env
OPENAI_API_KEY=sk-proj-...
```

**Solution 2: Check audio format**

Ensure the audio is in a supported format (WAV, MP3, M4A, etc.)

**Solution 3: Check file size**

OpenAI Whisper has a 25MB limit. Compress large audio files.

---

## Issue: Claude API Rate Limit

**Error:**
```
Claude API error: 429 - Too Many Requests
```

**Solution 1: Wait and retry**

The retry logic will automatically handle this with exponential backoff.

**Solution 2: Reduce concurrency**

In [`lib/jobQueue.js`](lib/jobQueue.js:6), reduce:
```javascript
this.concurrency = 2; // Instead of 5
```

**Solution 3: Use async mode**

```javascript
// Save with async mode to avoid blocking
await fetch('/api/save', {
  method: 'POST',
  body: JSON.stringify({
    content: 'Your content',
    async: true  // Don't wait for classification
  })
});
```

---

## Issue: Concurrently Not Working (Windows)

**Error:**
```
'concurrently' is not recognized as an internal or external command
```

**Solution:**

Reinstall dependencies:
```bash
npm install
```

Or run servers separately:
```bash
# Terminal 1
npm run dev

# Terminal 2
npm run mcp
```

---

## Quick Fixes Checklist

When something goes wrong, try these in order:

1. **Restart the servers**
   ```bash
   # Ctrl+C to stop
   npm run dev:all
   ```

2. **Clear Next.js cache**
   ```bash
   rm -rf .next
   npm run dev
   ```

3. **Check environment variables**
   - Verify [.env.local](.env.local) has all required keys
   - Ensure no extra spaces or quotes

4. **Check API keys are valid**
   - Claude API key (NEXT_PUBLIC_ANTHROPIC_AUTH_TOKEN)
   - OpenAI API key (OPENAI_API_KEY)
   - Supabase keys (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)

5. **Check database connection**
   ```bash
   npx prisma db pull
   ```

6. **Check logs**
   - Look at terminal output for error messages
   - Check browser console for frontend errors

7. **Test individual components**
   - Test MCP: `curl http://localhost:3001/health`
   - Test API: `curl http://localhost:3000/api/save`
   - Test queue: `curl http://localhost:3000/api/jobs`

---

## Getting Help

If you're still stuck:

1. **Check the logs**: Terminal output often has helpful error messages
2. **Check documentation**:
   - [QUICK_START.md](QUICK_START.md)
   - [BLUEPRINT_IMPLEMENTATION.md](BLUEPRINT_IMPLEMENTATION.md)
   - [TEST_HIGH_PRIORITY.md](TEST_HIGH_PRIORITY.md)
3. **Run tests**: See [TEST_HIGH_PRIORITY.md](TEST_HIGH_PRIORITY.md)
4. **Check GitHub issues**: [github.com/your-repo/issues](github.com)

---

## Prevention Tips

To avoid issues in the future:

1. **Always stop servers properly** (Ctrl+C, not closing terminal)
2. **Keep one terminal per server** for better visibility
3. **Use `.env.local` for secrets** (never commit to git)
4. **Back up your database** regularly
5. **Monitor queue stats** (`/api/jobs`) to catch stuck jobs
6. **Test in dev before deploying** to production

---

## Clean Slate Procedure

If everything is broken and you want to start fresh:

```bash
# 1. Stop all servers
# Ctrl+C in all terminals

# 2. Kill all Node processes
# Windows
taskkill //F //IM node.exe

# Mac/Linux
pkill -f node

# 3. Clear caches
rm -rf .next
rm -rf node_modules

# 4. Reinstall
npm install

# 5. Reset database (optional - WARNING: deletes all data)
npx prisma migrate reset

# 6. Start fresh
npm run dev:all
```

---

**Most issues can be solved by restarting the servers or checking environment variables!** 🔧
