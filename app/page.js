// app/page.js
'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Brain, Mic, Loader2, Sparkles } from 'lucide-react';
import { classifyContent, semanticSearch, analyzeVoiceTranscript } from '@/lib/claude';
import { storage } from '@/lib/storage';
import ContentCard from '@/components/ContentCard';

export default function Home() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Capture form
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [voiceNote, setVoiceNote] = useState(null);

  // Load items on mount
  useEffect(() => {
    const loadedItems = storage.getAll();
    setItems(loadedItems);
    setFilteredItems(loadedItems);
  }, []);

  // Voice recording setup
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(blob);
        setVoiceNote({ audioUrl, blob });
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  // Simulate voice transcription (in real app, use Whisper API)
  const transcribeAudio = async (blob) => {
    // Simulated transcription - in production, send to Whisper API
    return "This is a placeholder transcript. User said something about this content.";
  };

  // Capture and classify content
  const handleCapture = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsProcessing(true);
    try {
      // Classify content with AI
      const classification = await classifyContent(content, url);

      // Process voice note if exists
      let voiceData = null;
      if (voiceNote) {
        const transcript = await transcribeAudio(voiceNote.blob);
        const analysis = await analyzeVoiceTranscript(transcript);
        voiceData = {
          audioUrl: voiceNote.audioUrl,
          transcript,
          keywords: analysis.keywords,
          tone: analysis.tone
        };
      }

      // Create new item
      const newItem = {
        id: Date.now().toString(),
        type: classification.contentType,
        rawContent: content,
        url: url || null,
        metadata: classification.metadata,
        voice: voiceData,
        keywords: classification.keywords,
        tags: classification.tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Save to storage
      storage.save(newItem);

      // Update state
      const updatedItems = [newItem, ...items];
      setItems(updatedItems);
      setFilteredItems(updatedItems);

      // Reset form
      setContent('');
      setUrl('');
      setVoiceNote(null);
      setIsCapturing(false);
      
      alert('✅ Content captured and classified!');
    } catch (error) {
      console.error('Capture failed:', error);
      alert('❌ Failed to capture content. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredItems(items);
      return;
    }

    setIsSearching(true);
    try {
      const results = await semanticSearch(searchQuery, items);
      setFilteredItems(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Delete item
  const handleDelete = (id) => {
    if (confirm('Delete this item?')) {
      storage.delete(id);
      const updated = items.filter(item => item.id !== id);
      setItems(updated);
      setFilteredItems(updated);
    }
  };

  // Filter by type
  const filterByType = (type) => {
    if (type === 'all') {
      setFilteredItems(items);
    } else {
      setFilteredItems(storage.filterByType(type));
    }
  };

  const stats = storage.getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-10 h-10 text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Project Synapse
                </h1>
                <p className="text-sm text-gray-600">Your Intelligent Second Brain</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-purple-600">{stats.total}</span> items saved
              </div>
              <button
                onClick={() => setIsCapturing(!isCapturing)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Capture
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Capture Form */}
        {isCapturing && (
          <div className="mb-8 bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Capture New Content
            </h2>
            <form onSubmit={handleCapture} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Content (paste text, URL, or describe what you want to save)
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste an article, product link, your thoughts, or anything..."
                  className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  URL (optional)
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Voice Note */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Add Voice Note (optional)
                </label>
                <div className="flex items-center gap-3">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <Mic className="w-5 h-5" />
                      Start Recording
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg animate-pulse"
                    >
                      <Mic className="w-5 h-5" />
                      Stop Recording
                    </button>
                  )}
                  {voiceNote && (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      ✓ Voice note recorded
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Capture & Classify
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCapturing(false);
                    setContent('');
                    setUrl('');
                    setVoiceNote(null);
                  }}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6 bg-white rounded-xl shadow-md p-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search naturally: 'black shoes under $300', 'articles about AI', 'my todo list'..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isSearching ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search
                </>
              )}
            </button>
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2 mt-3 flex-wrap">
            <button onClick={() => filterByType('all')} className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200">
              All
            </button>
            <button onClick={() => filterByType('article')} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200">
              Articles
            </button>
            <button onClick={() => filterByType('product')} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200">
              Products
            </button>
            <button onClick={() => filterByType('todo')} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200">
              Todos
            </button>
            <button onClick={() => filterByType('video')} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm hover:bg-red-200">
              Videos
            </button>
          </div>
        </div>

        {/* Content Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {items.length === 0 
                ? "No items yet. Start by capturing something!" 
                : "No results found. Try a different search."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ContentCard key={item.id} item={item} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}