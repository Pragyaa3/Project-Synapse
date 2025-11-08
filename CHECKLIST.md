# Synapse Setup Checklist ✅

Use this checklist to make sure everything is configured correctly.

---

## ✅ Web App Setup

- [ ] Dependencies installed (`npm install`)
- [ ] `.env.local` exists with Anthropic API key
- [ ] `.env.local` has OpenAI API key (for voice features)
- [ ] Dev server runs without errors (`npm run dev`)
- [ ] Can access http://localhost:3000
- [ ] Can click "Capture" button and see the form
- [ ] Can manually save content through the web UI
- [ ] Tailwind CSS styles are working (purple gradients visible)

---

## ✅ Chrome Extension Setup

- [ ] Extension folder exists at `c:\Users\pragy\synapse\extension`
- [ ] Manifest.json is present
- [ ] All script files exist:
  - [ ] `scripts/background.js`
  - [ ] `scripts/content.js`
  - [ ] `scripts/popup.js`
- [ ] Popup HTML exists: `popup.html`
- [ ] Styles exist: `styles/content.css`
- [ ] Extension loaded in `chrome://extensions/`
- [ ] "Developer mode" is enabled
- [ ] Extension appears in toolbar (or extensions menu)

---

## ✅ Extension Icons (Optional for Testing)

- [ ] `icons/icon16.png` exists
- [ ] `icons/icon48.png` exists
- [ ] `icons/icon128.png` exists

**Note:** Extension works without icons, but looks better with them.

See `extension/icons/GENERATE_ICONS.md` for how to create them.

---

## ✅ Testing - Basic Functionality

### Test 1: Manual Capture (Web App)
- [ ] Open http://localhost:3000
- [ ] Click "Capture"
- [ ] Paste some text
- [ ] Click "Capture & Classify"
- [ ] Content appears in the grid below
- [ ] Content has a type badge (article, note, etc.)

### Test 2: Search (Web App)
- [ ] Add several items to Synapse
- [ ] Type a search query
- [ ] Click "Search"
- [ ] Results appear based on query

### Test 3: Right-Click Save (Extension)
- [ ] Go to any website
- [ ] Highlight some text
- [ ] Right-click
- [ ] See "🧠 Save to Synapse" option
- [ ] Click it
- [ ] See green toast: "✅ Saved to Synapse!"
- [ ] Refresh web app - item appears

### Test 4: Floating Button (Extension)
- [ ] Go to any website
- [ ] Highlight text
- [ ] Purple 🧠 button appears near selection
- [ ] Click the button
- [ ] Content saved (toast appears)

### Test 5: Keyboard Shortcut (Extension)
- [ ] Go to any website
- [ ] Highlight text
- [ ] Press `Ctrl+Shift+X` (or `Cmd+Shift+X`)
- [ ] Content saved

### Test 6: Save Link (Extension)
- [ ] Right-click any link on a webpage
- [ ] Click "🧠 Save Link to Synapse"
- [ ] Link is saved and classified

### Test 7: Save Image (Extension)
- [ ] Right-click any image
- [ ] Click "🧠 Save Image to Synapse"
- [ ] Image URL is saved

### Test 8: Save Page (Extension)
- [ ] Right-click anywhere on a page
- [ ] Click "🧠 Save Page to Synapse"
- [ ] Full page content is extracted and saved

---

## ✅ API Integration

- [ ] Classification API working (`/api/classify`)
- [ ] Search API working (`/api/search`)
- [ ] Voice API configured (even if not tested yet)
- [ ] No CORS errors in browser console
- [ ] API responses are valid JSON
- [ ] Items have all expected fields (type, metadata, keywords, tags)

---

## ✅ Error Handling

- [ ] Saving with no content shows error message
- [ ] Invalid API responses don't crash the app
- [ ] Extension shows error toast if API is down
- [ ] Web app shows error if classification fails

---

## 🎯 Common Issues & Fixes

### Issue: "Failed to save" in extension
**Fix:** Make sure web app is running (`npm run dev`)

### Issue: Toast notifications don't appear
**Fix:** Check browser console for errors, reload extension

### Issue: Extension not in context menu
**Fix:** Go to `chrome://extensions/`, find Synapse, click "Reload"

### Issue: Tailwind CSS not working
**Fix:** Already fixed! Using `@import "tailwindcss"` in globals.css

### Issue: API returns empty JSON
**Fix:** Check API route files are not empty (already fixed!)

### Issue: Voice transcription fails
**Fix:** Add valid `OPENAI_API_KEY` to `.env.local`

---

## 🚀 Ready to Use?

If you've checked all the boxes above, you're ready to go!

**Next steps:**
1. Start using it daily to save content
2. Test with different types of content (articles, products, videos)
3. Generate proper icons for the extension
4. Deploy to production when ready

---

## 📝 Notes

- Extension and web app must both be running for full functionality
- Web app can be used standalone (manual capture)
- Extension requires web app to store data
- All data is stored in browser localStorage (web app)
- Extension sends data to web app via API

---

**Last Updated:** 2025-11-08
