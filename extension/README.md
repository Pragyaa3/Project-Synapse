# Synapse Chrome Extension

Browser extension for capturing content from anywhere on the web.

## Features

### Right-Click Context Menus
- **Save Selection** - Highlight text → Right-click → Save to Synapse
- **Save Link** - Right-click any link → Save Link to Synapse
- **Save Image** - Right-click any image → Save Image to Synapse
- **Save Video** - Right-click video → Save Video to Synapse
- **Save Page** - Right-click → Save Page to Synapse
- **Save as Todo** - Convert any content to a todo
- **Save as Quote** - Save highlighted text as a quote

### Floating Button
- Select any text on a webpage
- 🧠 button appears near your selection
- Click it to quick-save
- Auto-hides after 5 seconds

### Keyboard Shortcuts
- `Ctrl+Shift+X` (Win) / `Cmd+Shift+X` (Mac) - Quick save selection
- `Ctrl+Shift+S` (Win) / `Cmd+Shift+S` (Mac) - Save current page

### Double-Click Images
- Double-click any image
- Confirm to save to Synapse

## Installation

### Development Mode

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `extension` folder
5. Extension is now installed!

### Update API URL

Before using, update the API URL in:
- `scripts/background.js` - Line 3: Change `API_BASE_URL`
- `scripts/popup.js` - Line 3: Change `APP_URL`

From: `http://localhost:3000`
To: Your deployed URL

## Icons

You need to add icon files to the `icons/` folder:
- `icon16.png` - 16x16px
- `icon48.png` - 48x48px
- `icon128.png` - 128x128px

Use a brain emoji or purple gradient logo.

## How It Works

1. User right-clicks content on any webpage
2. Extension captures the content
3. Sends to your Synapse API at `/api/classify`
4. Content is classified and saved
5. User sees success notification

## Tech Stack

- Manifest V3 (latest Chrome extension standard)
- Vanilla JavaScript (no frameworks needed)
- Service Worker for background tasks
- Content Scripts for page interaction

## File Structure

```
extension/
├── manifest.json          # Extension config
├── popup.html             # Extension popup UI
├── icons/                 # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── scripts/
│   ├── background.js      # Service worker (context menus, API calls)
│   ├── content.js         # Page interaction (floating button, shortcuts)
│   └── popup.js           # Popup functionality
└── styles/
    └── content.css        # Content script styles
```

## Development

### Testing
1. Make changes to files
2. Go to `chrome://extensions/`
3. Click refresh icon on Synapse extension
4. Test on any webpage

### Debugging
- **Background script**: Click "service worker" link in extension details
- **Content script**: Right-click page → Inspect → Console tab
- **Popup**: Right-click extension icon → Inspect popup

## Publishing (Later)

1. Create icons
2. Update URLs to production
3. Zip the extension folder
4. Go to Chrome Web Store Developer Dashboard
5. Upload zip and submit for review

## Privacy

- Only captures content you explicitly save
- No tracking or analytics
- No data sent to third parties
- All data goes to your Synapse API

## License

MIT
