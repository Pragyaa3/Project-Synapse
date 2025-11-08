# 📸 Screenshots Guide

This guide explains what screenshots to take for the README documentation.

## Required Screenshots

### 1. Main Interface (`main-interface.png`)
**What to capture:**
- The main Synapse web application at http://localhost:3000
- Show the capture form with all input options visible:
  - Text/URL input field
  - Image upload area
  - Voice recording button
  - Save button
- Include 2-3 content cards below to show the interface in use

**How to take:**
1. Open Synapse at http://localhost:3000
2. Make sure you have some saved items showing
3. Take a full browser screenshot (avoid showing browser chrome if possible)
4. Crop to show the gradient background and main content area
5. Save as `docs/screenshots/main-interface.png`

**Recommended size:** 1920x1080 or similar 16:9 aspect ratio

---

### 2. Content Cards (`content-cards.png`)
**What to capture:**
- A grid view showing different content types side-by-side
- Should include at least 6-8 different card types:
  - Article (with title, author, summary)
  - Product (with image and price)
  - Todo list (with checkboxes)
  - Voice note (with audio player and transcript)
  - Image/screenshot (with OCR text)
  - Quote (with special formatting)
  - Video (with thumbnail)
  - Note (basic text)

**How to take:**
1. Save several different types of content to populate your database
2. Scroll to show a good variety of card types
3. Take a screenshot showing the grid layout
4. Ensure different colors are visible (purple, blue, green, pink cards)
5. Save as `docs/screenshots/content-cards.png`

**Recommended size:** 1920x1200 (to show multiple rows)

---

### 3. Natural Language Search (`search.png`)
**What to capture:**
- The search bar with an example natural language query
- Search results showing filtered content
- Quick filter chips (All, Articles, Products, etc.)

**Example queries to demonstrate:**
- "articles about AI from last week"
- "shoes under $300"
- "todo lists from this month"
- "screenshots with code"

**How to take:**
1. Type a natural language query in the search bar
2. Wait for results to appear
3. Take a screenshot showing:
   - Search query in the input field
   - Quick filter chips
   - Filtered results below
4. Save as `docs/screenshots/search.png`

**Recommended size:** 1920x1080

---

### 4. Browser Extension (`extension.png`)
**What to capture:**
- Context menu showing all 8 save options
- Optionally: Toast notification showing success message

**How to take:**
1. Navigate to any webpage
2. Right-click to open context menu
3. Hover over "Synapse" to expand submenu
4. Take screenshot showing all options:
   - Save Selection
   - Save Link
   - Save Image
   - Save Video
   - Save Page
   - Save as Todo
   - Save as Quote
   - Save Screenshot
5. Save as `docs/screenshots/extension.png`

**Recommended size:** 800x600 (can be smaller, focused on menu)

**Bonus:** Take a second screenshot showing the toast notification:
- Save something from the extension
- Screenshot the animated toast that appears
- Save as `docs/screenshots/extension-toast.png`

---

### 5. Voice Notes with AI Analysis (`voice-notes.png`)
**What to capture:**
- A voice note card showing all AI analysis features:
  - Audio player with waveform/controls
  - Full transcript
  - Main topics (as chips/badges)
  - Action items list
  - Entities (people, places, organizations)
  - Sentiment badge
  - Tone indicator

**How to take:**
1. Record a voice note with meaningful content
2. Wait for AI processing to complete
3. Find the voice note card in your saved items
4. Take a close-up screenshot of just that card
5. Make sure all metadata fields are visible
6. Save as `docs/screenshots/voice-notes.png`

**Recommended size:** 800x1000 (portrait orientation for full card)

---

### 6. Image Analysis & OCR (`image-ocr.png`)
**What to capture:**
- An image card showing OCR extraction
- Should show:
  - The original image
  - Extracted text section
  - Visual type badge (screenshot/diagram/photo)
  - Color palette display
  - AI-generated description

**How to take:**
1. Upload an image with text (screenshot, handwritten note, or document)
2. Wait for AI processing
3. Find the image card in your saved items
4. Take a screenshot showing the card with all metadata
5. Save as `docs/screenshots/image-ocr.png`

**Recommended size:** 800x1000 (portrait for full card)

---

## Optional Screenshots

### 7. Product Card Example (`product-card.png`)
- Close-up of a product card
- Shows price, image, description
- Demonstrates e-commerce classification

### 8. Todo List Card (`todo-card.png`)
- Close-up of a todo list card
- Shows checkbox formatting
- Demonstrates task management

### 9. MCP Server Integration (`mcp-integration.png`)
- Terminal showing MCP server running
- Example curl command or Claude Desktop config
- Success response

### 10. Architecture Diagram (`architecture.png`)
- Visual diagram of system architecture
- Can be created in draw.io, Excalidraw, or similar
- Shows data flow between components

---

## Screenshot Best Practices

### Tools Recommended:
- **Windows:** Win + Shift + S (Snipping Tool)
- **Mac:** Cmd + Shift + 4
- **Chrome Extension:** Awesome Screenshot, Nimbus
- **Full Page:** Chrome DevTools screenshot feature

### Quality Guidelines:
- **Resolution:** At least 1920px width for full-page shots
- **Format:** PNG (better quality than JPG for UI screenshots)
- **File Size:** Compress if over 1MB (use TinyPNG or similar)
- **Cropping:** Remove browser chrome/taskbar unless relevant
- **Privacy:** Remove any personal info, API keys, or sensitive data

### Styling Tips:
- Use a clean browser window (close unnecessary tabs)
- Make sure the gradient background is visible
- Capture during the day (good lighting for screen photos if needed)
- Ensure text is readable (no blur, proper zoom level)
- Show realistic data (not Lorem Ipsum if possible)

---

## Example Data to Create

To get good screenshots, create these example items:

### Articles:
```
URL: https://www.anthropic.com/news/claude-3-5-sonnet
(Will auto-classify as Article with title, author, summary)
```

### Products:
```
URL: https://www.amazon.com/dp/B08N5WRWNW
(Will auto-classify as Product with price and image)
```

### Todos:
```
Content:
- [ ] Review Synapse documentation
- [ ] Add screenshots to README
- [ ] Test browser extension
- [x] Set up Supabase
```

### Voice Notes:
```
Record: "Hey Synapse, I just had a meeting with the team about the Q1 roadmap.
Key action items: schedule follow-up next week, share the prototype with stakeholders,
and get feedback from Sarah and John. The overall sentiment was positive and everyone
seemed excited about the new features."
```

### Images with Text:
```
Upload: A screenshot of code, a handwritten note, or a diagram with labels
```

### Quotes:
```
Content: "The best way to predict the future is to invent it." - Alan Kay
(Use extension "Save as Quote" option)
```

---

## Updating README After Screenshots

Once you have all screenshots:

1. Save them to `docs/screenshots/` directory
2. Make sure filenames match exactly:
   - `main-interface.png`
   - `content-cards.png`
   - `search.png`
   - `extension.png`
   - `voice-notes.png`
   - `image-ocr.png`

3. The README will automatically display them (paths are already set)

4. If you want to use different filenames, update the README image paths:
```markdown
![Main Interface](docs/screenshots/your-filename.png)
```

---

## Alternative: Use Placeholder Images

If you want to deploy before taking screenshots, you can use placeholder services:

```markdown
![Main Interface](https://via.placeholder.com/1920x1080/5B21B6/FFFFFF?text=Synapse+Main+Interface)
```

But real screenshots are much better for documentation!

---

## GitHub Display Tips

- GitHub automatically renders images in markdown
- Large images are automatically scaled to fit
- Click to view full size
- Images load from the repository, not external sources
- PNG format ensures crispness on retina displays

---

## Need Help?

If you're unsure about any screenshot:
1. Check similar projects on GitHub for inspiration
2. Look at Notion, Obsidian, or Evernote documentation
3. Focus on showing the unique features (AI classification, voice notes, OCR)

Remember: Good screenshots can make your README 10x more engaging!
