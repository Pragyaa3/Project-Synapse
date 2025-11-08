# Synapse - Complete Installation Guide

This guide covers both the **Web App** and **Chrome Extension**.

---

## Part 1: Web App Setup

### 1. Install Dependencies

```bash
cd c:\Users\pragy\synapse
npm install
```

### 2. Configure Environment Variables

Edit `.env.local` and add your OpenAI API key:

```env
ANTHROPIC_BASE_URL=https://litellm-339960399182.us-central1.run.app
NEXT_PUBLIC_ANTHROPIC_AUTH_TOKEN=sk-UKivqLse6NVp-T_0G0SByQ

# Add your OpenAI API key here (for voice transcription)
OPENAI_API_KEY=sk-your-actual-openai-key-here
```

Get your OpenAI API key from: https://platform.openai.com/api-keys

### 3. Start Development Server

```bash
npm run dev
```

The web app will be available at: http://localhost:3000

### 4. Test the Web App

1. Click "Capture" button
2. Paste some text
3. Click "Capture & Classify"
4. You should see it classified and saved!

---

## Part 2: Chrome Extension Setup

### 1. Generate Extension Icons (Important!)

You need 3 icon files in `extension/icons/`:
- `icon16.png` (16x16)
- `icon48.png` (48x48)
- `icon128.png` (128x128)

**Quick method:**
1. Go to https://www.favicon-generator.org/
2. Upload any brain emoji image
3. Download and rename the files as above

Or see `extension/icons/GENERATE_ICONS.md` for other options.

**Temporary workaround:** You can skip this for now, but the extension won't have proper icons.

### 2. Install Extension in Chrome

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Navigate to `c:\Users\pragy\synapse\extension`
6. Select the `extension` folder
7. Click "Select Folder"

The extension is now installed! You should see it in your toolbar.

### 3. Pin the Extension (Optional)

1. Click the puzzle piece icon in Chrome toolbar
2. Find "Synapse - Your Second Brain"
3. Click the pin icon to keep it visible

---

## Part 3: Using Synapse

### Web App Features

1. **Capture Content** - Manually paste or type content
2. **Search** - Use semantic AI-powered search
3. **Filter** - By type (articles, products, todos, etc.)
4. **Voice Notes** - Record and transcribe (requires OpenAI key)

### Extension Features

#### Method 1: Right-Click Menu (Most Common)

**Save Selected Text:**
1. Highlight any text on any webpage
2. Right-click
3. Select "🧠 Save to Synapse"

**Save a Link:**
1. Right-click any link
2. Select "🧠 Save Link to Synapse"

**Save an Image:**
1. Right-click any image
2. Select "🧠 Save Image to Synapse"

**Save Entire Page:**
1. Right-click anywhere on page
2. Select "🧠 Save Page to Synapse"

#### Method 2: Floating Button

1. Select any text
2. A purple 🧠 button appears
3. Click it to save instantly

#### Method 3: Keyboard Shortcuts

- **Quick save**: `Ctrl+Shift+X` (or `Cmd+Shift+X` on Mac)
- **Save page**: `Ctrl+Shift+S` (or `Cmd+Shift+S` on Mac)

#### Method 4: Extension Popup

1. Click the Synapse icon in toolbar
2. Use quick action buttons
3. Or click "Open Synapse Dashboard"

---

## Part 4: Testing the Complete Flow

### Test 1: Save from Any Website

1. Go to a news website (e.g., CNN, BBC)
2. Highlight an interesting paragraph
3. Right-click → "🧠 Save to Synapse"
4. You should see a green toast: "✅ Saved to Synapse!"
5. Open http://localhost:3000
6. Your saved content should appear!

### Test 2: Save a Product

1. Go to Amazon or any shopping site
2. Right-click a product link
3. Select "🧠 Save Link to Synapse"
4. AI should classify it as a "product" with price extracted

### Test 3: Save an Article

1. Go to Medium or any blog
2. Right-click → "🧠 Save Page to Synapse"
3. Full article content is extracted and saved

---

## Troubleshooting

### Extension Issues

**Extension not loading:**
- Make sure you're loading the correct folder (`extension/`)
- Check `chrome://extensions/` for error messages
- Click "Reload" button on the extension

**No toast notifications:**
- Check browser console (F12)
- Ensure web app is running at http://localhost:3000
- Check network tab for API errors

**Icons not showing:**
- Generate the icon files (see Part 2, Step 1)
- Or temporarily ignore (extension still works)

### API Issues

**Classification fails:**
- Check `.env.local` has valid `NEXT_PUBLIC_ANTHROPIC_AUTH_TOKEN`
- Check console in browser dev tools
- Check terminal running `npm run dev` for errors

**Voice transcription fails:**
- Add valid `OPENAI_API_KEY` to `.env.local`
- Restart the dev server after adding the key

### CORS Issues

If you get CORS errors:
- Make sure the web app is running on http://localhost:3000
- Extension is configured to use localhost:3000
- Check `manifest.json` has `"http://localhost:3000/*"` in `host_permissions`

---

## Production Deployment (Later)

### Deploy Web App
1. Deploy to Vercel/Netlify
2. Update environment variables
3. Get production URL

### Update Extension
1. Open `extension/scripts/background.js`
2. Change line 3: `const API_BASE_URL = 'https://your-app.vercel.app'`
3. Open `extension/scripts/popup.js`
4. Change line 3: `const APP_URL = 'https://your-app.vercel.app'`

### Publish Extension
1. Create proper icons
2. Zip the extension folder
3. Go to Chrome Web Store Developer Dashboard
4. Upload and submit

---

## Next Steps

1. ✅ Get web app running
2. ✅ Install Chrome extension
3. ✅ Test saving content from different sites
4. 🎨 Generate proper icons
5. 🚀 Deploy to production
6. 📱 Add more features!

---

## Support

- Check `extension/README.md` for extension-specific docs
- Check browser console for errors
- Check terminal for API errors
- All API routes are in `app/api/*/route.js`

Happy capturing! 🧠✨
