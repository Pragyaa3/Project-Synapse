# Chrome Extension - Quick Start

## 🚀 Install in 3 Steps

### Step 1: Load Extension
1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select the `extension` folder

### Step 2: Start Web App
```bash
npm run dev
```
(Web app must be running at http://localhost:3000)

### Step 3: Test It!
1. Go to any website
2. Highlight some text
3. Right-click → "🧠 Save to Synapse"
4. See green toast notification ✅

---

## 🎯 How to Use

### Right-Click Menus
- **Text selected** → "Save to Synapse"
- **On a link** → "Save Link to Synapse"
- **On an image** → "Save Image to Synapse"
- **On a video** → "Save Video to Synapse"
- **Anywhere** → "Save Page to Synapse"

### Floating Button
- Select text → 🧠 button appears → Click it

### Keyboard Shortcuts
- `Ctrl+Shift+X` - Quick save
- `Ctrl+Shift+S` - Save page

### Extension Popup
Click the 🧠 icon in toolbar for quick actions

---

## ⚠️ Important Notes

1. **Icons**: You need to generate icon files (see `icons/GENERATE_ICONS.md`)
   - Temporary: Extension works without icons, just looks plain

2. **API URL**: Currently set to `http://localhost:3000`
   - For production, update in `scripts/background.js` and `scripts/popup.js`

3. **Web App Must Be Running**: Extension sends data to localhost:3000
   - If web app isn't running, saves will fail

---

## 🐛 Troubleshooting

**Not working?**
1. Is web app running? (`npm run dev`)
2. Check `chrome://extensions/` for errors
3. Click refresh on the extension
4. Check browser console (F12)

**No notifications?**
- Right-click page → Inspect → Console
- Look for error messages

**Extension disappeared?**
- Go to `chrome://extensions/`
- Find "Synapse" and click "Reload"

---

## 📁 File Structure
```
extension/
├── manifest.json           ← Extension config
├── popup.html              ← Popup UI
├── icons/                  ← Icons (need to generate)
├── scripts/
│   ├── background.js       ← Context menus & API calls
│   ├── content.js          ← Floating button & shortcuts
│   └── popup.js            ← Popup logic
└── styles/
    └── content.css         ← Styles
```

---

That's it! Now go save the internet! 🎉
