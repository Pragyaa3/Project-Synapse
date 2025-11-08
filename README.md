# 🧠 Project Synapse

**Build the Brain You've Always Wanted**

An intelligent second brain that captures, understands, and retrieves your thoughts across any medium - from web articles to voice notes.

![Project Synapse](https://img.shields.io/badge/AI-Powered-blue) ![Next.js](https://img.shields.io/badge/Next.js-16-black) ![Claude](https://img.shields.io/badge/Claude-Sonnet%204-purple) ![Blueprint](https://img.shields.io/badge/Blueprint-100%25-success)

> **✅ All Blueprint Requirements Met!** See [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) for details.

---

## 🎯 **What is Synapse?**

Synapse is your personal knowledge management system powered by AI. It:

- 🎤 **Captures** anything - URLs, text, images, voice notes
- 🤖 **Understands** content using Claude AI - auto-classifies and extracts metadata
- 🔍 **Searches** naturally - "Show me articles about AI" or "Black shoes under $300"
- 🎨 **Displays** beautifully - Each content type gets its perfect visual format

---

## ✨ **Features**

### **Intelligent Content Classification**
- Automatically detects content type (article, product, todo, quote, video, etc.)
- Extracts metadata (title, author, price, date, tags)
- Generates searchable keywords

### **Voice Notes**
- Record voice memos while saving content
- Automatic transcription
- Keyword extraction from voice
- Playback with waveform visualization

### **Semantic Search**
- Natural language queries
- Search across all saved items
- Filter by type, date, tags
- Find content by concepts, not just keywords

### **Beautiful Visual Display**
- Product cards with prices and images
- Article cards with summaries
- Formatted todo lists
- Playable voice notes
- Responsive grid layout

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ and npm
- Claude API key 

### **Installation**

```bash
# Clone the repository
git clone https://github.com/YOUR-USERNAME/synapse.git
cd synapse

# Install dependencies
npm install

# Set up environment variables
# Create .env.local and add:
ANTHROPIC_BASE_URL=https://litellm-339960399182.us-central1.run.app
NEXT_PUBLIC_ANTHROPIC_AUTH_TOKEN=your-api-key-here

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---


## 🛠️ **Tech Stack**

- **Frontend**: Next.js 14 (App Router), React, JavaScript
- **Styling**: Tailwind CSS
- **AI**: Claude Sonnet 4 via Anthropic API
- **Storage**: Browser LocalStorage + Persistent Storage API
- **Voice**: Web Audio API + Whisper (via Claude)
- **Search**: Vector embeddings with Gemini
- **UI Components**: Lucide Icons, Custom components

---

## 🎨 **Usage**

### **Capturing Content**

1. **Paste or Upload**
   - Paste any URL, text, or upload images
   - System automatically detects content type

2. **Add Voice Note (Optional)**
   - Click microphone icon
   - Record your thoughts about the content
   - AI transcribes and extracts keywords

3. **Save**
   - Content is automatically classified
   - Metadata extracted
   - Displayed in optimal format

### **Searching**

Use natural language queries:
- "Show me all articles about AI"
- "Products under $300"
- "My todo list from yesterday"
- "Design inspiration I saved last week"

### **Viewing**

Content displays in intelligent formats:
- **Articles**: Title, summary, author, date
- **Products**: Image, price, name, description
- **Todos**: Formatted checklist
- **Voice**: Playable audio with transcript
- **Videos**: Embedded player

---

## 🚀 **Quick Start**

```bash
# Install dependencies
npm install

# Start both web app + MCP server
npm run dev:all

# Or start separately
npm run dev    # Web app on :3000
npm run mcp    # MCP server on :3001
```

**See [QUICK_START.md](QUICK_START.md) for 5-minute tutorial.**

---

## 📚 **Documentation**

- **[QUICK_START.md](QUICK_START.md)** - Get started in 5 minutes
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Overview of all features
- **[BLUEPRINT_IMPLEMENTATION.md](BLUEPRINT_IMPLEMENTATION.md)** - Detailed feature docs
- **[TEST_HIGH_PRIORITY.md](TEST_HIGH_PRIORITY.md)** - Complete test suite
- **[mcp/README.md](mcp/README.md)** - MCP server integration guide

---

## 🎯 **Roadmap**

### **Phase 1: Core Features** ✅ COMPLETE
- ✅ Content capture and classification
- ✅ Voice notes with transcription
- ✅ Semantic search
- ✅ Beautiful type-specific displays
- ✅ Image analysis with OCR

### **Phase 2: Browser Extension** ✅ COMPLETE
- ✅ Chrome extension for one-click capture
- ✅ Right-click context menus (8 options)
- ✅ Keyboard shortcuts (Ctrl+Shift+X)
- ✅ Floating brain button
- ✅ Toast notifications

### **Phase 3: Backend & Sync** ✅ COMPLETE
- ✅ Supabase PostgreSQL database
- ✅ Prisma ORM
- ✅ Image storage (Supabase Storage)
- ✅ Voice file uploads
- ✅ Production-ready architecture

### **Phase 4: High Priority (NEW)** ✅ COMPLETE
- ✅ **MCP Server** - Third-party AI integrations
- ✅ **Background Job Processing** - Async classification
- ✅ **Error Handling & Retry Logic** - Production resilience
- ✅ **Query Parsing** - Intelligent search with filters

### **Phase 5: Medium Priority** 🔄 IN PROGRESS
- ⏳ Reader mode for articles
- ⏳ Vector embeddings (pgvector)
- ⏳ Mobile app
- ⏳ Email integration

### **Phase 4: Advanced Features** 
- Smart collections
- Collaboration
- Mobile app
- Integrations

### **Phase 5: Extraordinary UI** 
- 3D mind map visualization
- Timeline river view
- Constellation clustering
- Advanced animations

---

### **Development**

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

---

**Built for Appointy Internship Drive 2025**