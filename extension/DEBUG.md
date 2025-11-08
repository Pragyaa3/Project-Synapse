# Extension Debugging Guide

The API is working correctly. If the extension isn't saving, follow these steps:

## Step 1: Check Extension Service Worker Console

1. Go to `chrome://extensions/`
2. Find "Synapse - Your Second Brain"
3. Click **"service worker"** (blue link under "Inspect views")
4. A DevTools window opens
5. Keep this window open

## Step 2: Test Right-Click Save

1. Go to any website (e.g., wikipedia.org)
2. Highlight some text
3. Right-click → "🧠 Save to Synapse"
4. **WATCH the service worker console** - you should see:
   - "Context menu clicked: save-selection"
   - Network request logs
   - Any errors

## Step 3: Check for Errors

Look for these specific errors:

### Error 1: CORS Error
```
Access to fetch at 'http://localhost:3000/api/classify' from origin 'https://...' has been blocked by CORS
```
**Fix:** This shouldn't happen since we have `<all_urls>` permission

### Error 2: Network Error
```
Failed to fetch
```
**Fix:** Make sure dev server is running at http://localhost:3000

### Error 3: Permission Error
```
Cannot access chrome://
```
**Fix:** Extension can't run on chrome:// pages, try a regular website

## Step 4: Manual Test in Service Worker Console

In the service worker console, paste this code:

```javascript
// Test API call directly
fetch('http://localhost:3000/api/classify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ content: 'test from console', url: 'http://test.com' })
})
.then(r => r.json())
.then(data => console.log('API Response:', data))
.catch(err => console.error('API Error:', err));
```

**Expected result:** Should see API response with classification

## Step 5: Check Content Script

1. Go to any webpage
2. Press F12 (open DevTools)
3. Go to Console tab
4. You should see: "🧠 Synapse extension loaded!"
5. If not, content script isn't loading

## Step 6: Test Floating Button

1. On any webpage
2. Highlight some text
3. You should see a purple 🧠 button appear
4. If not, content script has an issue

## Common Issues

### Issue 1: No Toast Notifications
**Symptom:** Right-click saves but no toast appears
**Cause:** Content script not injecting toast
**Check:** Browser console (F12) for errors

### Issue 2: Context Menu Doesn't Appear
**Symptom:** No "🧠 Save to Synapse" in right-click menu
**Cause:** Extension not installed properly or on restricted page
**Fix:**
- Reload extension at chrome://extensions/
- Don't try on chrome:// or extension:// pages

### Issue 3: API Call Fails
**Symptom:** Error in service worker console
**Cause:** Server not running or wrong port
**Check:**
- Is http://localhost:3000 accessible?
- Run: `curl http://localhost:3000/api/classify -X POST -H "Content-Type: application/json" -d '{"content":"test"}'`

## Step-by-Step Verification

**[ ] 1. Server Running**
- Go to http://localhost:3000 in browser
- Should see Synapse web app

**[ ] 2. Extension Loaded**
- `chrome://extensions/` shows Synapse
- No errors on the card

**[ ] 3. Service Worker Active**
- Click "service worker" link
- Console opens with no errors

**[ ] 4. Content Script Loaded**
- Go to any website
- F12 → Console
- See "🧠 Synapse extension loaded!"

**[ ] 5. Context Menu Works**
- Right-click on page
- See "🧠 Save to Synapse" option

**[ ] 6. Save Function Called**
- Service worker console shows "Context menu clicked"

**[ ] 7. API Called**
- Service worker console shows fetch to localhost:3000

**[ ] 8. Toast Appears**
- Green notification on page

**[ ] 9. Data Saved**
- Refresh http://localhost:3000
- See saved item

## Still Not Working?

Copy all output from service worker console and share it.
