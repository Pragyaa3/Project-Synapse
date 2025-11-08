// app/page.js
'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Brain, Mic, Loader2, Sparkles, Upload, Image as ImageIcon } from 'lucide-react';
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
  const [uploadedImage, setUploadedImage] = useState(null);
  
  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [voiceNote, setVoiceNote] = useState(null);

  // Load items on mount
  useEffect(() => {
    // Load from both localStorage and server
    const loadItems = async () => {
      // First load from localStorage for instant display
      const localItems = storage.getAll();
      setItems(localItems);
      setFilteredItems(localItems);

      // Then fetch from server to sync
      try {
        const response = await fetch('/api/save');
        const { items: serverItems } = await response.json();

        // Merge and deduplicate (prefer server items)
        const mergedItems = serverItems || localItems;
        setItems(mergedItems);
        setFilteredItems(mergedItems);

        // Update localStorage with server data
        localStorage.setItem('synapse_items', JSON.stringify(mergedItems));
      } catch (error) {
        console.error('Failed to load from server:', error);
        // Continue with localStorage items
      }
    };

    loadItems();
  }, []);

  // Voice recording
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

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage({
          file,
          preview: reader.result,
          base64: reader.result.split(',')[1],
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Capture and classify content
  const handleCapture = async (e) => {
    e.preventDefault();
    if (!content.trim() && !url && !uploadedImage) {
      alert('Please provide some content, URL, or upload an image');
      return;
    }

    setIsProcessing(true);
    try {
      // Step 1: Process voice note if exists
      let voiceData = null;
      if (voiceNote) {
        const formData = new FormData();
        formData.append('audio', voiceNote.blob, 'voice-note.webm');

        const voiceRes = await fetch('/api/voice', {
          method: 'POST',
          body: formData,
        });

        const voiceResult = await voiceRes.json();

        if (voiceResult.success) {
          voiceData = {
            audioUrl: voiceNote.audioUrl,
            transcript: voiceResult.transcript,
            keywords: voiceResult.analysis.keywords,
            tone: voiceResult.analysis.tone,
            sentiment: voiceResult.analysis.sentiment,
            actionItems: voiceResult.analysis.actionItems,
          };
        }
      }

      // Step 2: Save to server (includes classification)
      const saveRes = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: content.trim(),
          url: url.trim() || null,
          imageData: uploadedImage ? uploadedImage.base64 : null,
          pageTitle: null,
          metadata: null,
        }),
      });

      const { item: savedItem } = await saveRes.json();

      // Step 3: Add voice data if exists
      if (voiceData) {
        savedItem.voice = voiceData;
      }

      // Step 4: Update localStorage
      storage.save(savedItem);

      // Step 5: Update state
      const updatedItems = [savedItem, ...items];
      setItems(updatedItems);
      setFilteredItems(updatedItems);

      // Reset form
      setContent('');
      setUrl('');
      setVoiceNote(null);
      setUploadedImage(null);
      setIsCapturing(false);

      alert('✅ Content captured successfully!');
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
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          items,
        }),
      });

      const { results } = await response.json();
      setFilteredItems(results);
    } catch (error) {
      console.error('Search failed:', error);
      // Fallback to simple filter
      const lowerQuery = searchQuery.toLowerCase();
      const results = items.filter(item =>
        item.metadata.title?.toLowerCase().includes(lowerQuery) ||
        item.keywords.some(k => k.toLowerCase().includes(lowerQuery)) ||
        item.tags.some(t => t.toLowerCase().includes(lowerQuery))
      );
      setFilteredItems(results);
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
    setSearchQuery('');
  };

  const stats = storage.getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Brain className="w-10 h-10 text-purple-600" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Project Synapse
                </h1>
                <p className="text-xs text-gray-600">Your Intelligent Second Brain</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-purple-600">{stats.total}</span> items
              </div>
              <button
                onClick={() => setIsCapturing(!isCapturing)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Capture</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Capture Form */}
        {isCapturing && (
          <div className="mb-8 bg-white rounded-xl shadow-xl p-6 border-2 border-purple-200 animate-in slide-in-from-top">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Capture New Content
            </h2>
            <form onSubmit={handleCapture} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Content (text, thoughts, or paste anything)
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste an article, your thoughts, a quote, or describe what you want to save..."
                  className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  URL (optional)
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/article"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                />
                <p className="text-xs text-gray-500 mt-1">We'll automatically extract content from the URL</p>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Upload Image (optional)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 cursor-pointer">
                    <ImageIcon className="w-5 h-5" />
                    Choose Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {uploadedImage && (
                    <div className="flex items-center gap-2">
                      <img 
                        src={uploadedImage.preview} 
                        alt="Preview" 
                        className="w-12 h-12 object-cover rounded border"
                      />
                      <span className="text-sm text-green-600">✓ Image uploaded</span>
                      <button
                        type="button"
                        onClick={() => setUploadedImage(null)}
                        className="text-red-500 text-sm hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Voice Note */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Voice Note (optional)
                </label>
                <div className="flex items-center gap-3">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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
                    <div className="flex items-center gap-2">
                      <audio src={voiceNote.audioUrl} controls className="h-8" />
                      <button
                        type="button"
                        onClick={() => setVoiceNote(null)}
                        className="text-red-500 text-sm hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
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
                    setUploadedImage(null);
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
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
                placeholder="Try: 'black shoes under $300', 'articles about AI', 'my todo list from yesterday'..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 transition-colors shadow-md hover:shadow-lg"
            >
              {isSearching ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span className="hidden sm:inline">Search</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2 mt-3 flex-wrap">
            <button onClick={() => filterByType('all')} className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors">
              All
            </button>
            <button onClick={() => filterByType('article')} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors">
              Articles
            </button>
            <button onClick={() => filterByType('product')} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors">
              Products
            </button>
            <button onClick={() => filterByType('todo')} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm hover:bg-purple-200 transition-colors">
              Todos
            </button>
            <button onClick={() => filterByType('video')} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm hover:bg-red-200 transition-colors">
              Videos
            </button>
            <button onClick={() => filterByType('note')} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm hover:bg-orange-200 transition-colors">
              Notes
            </button>
          </div>
        </div>

        {/* Content Grid */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <Brain className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {items.length === 0 ? 'Your Brain is Empty' : 'No Results Found'}
            </h3>
            <p className="text-gray-500">
              {items.length === 0 
                ? "Start capturing your thoughts, articles, and ideas!" 
                : "Try a different search or filter."}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <ContentCard key={item.id} item={item} onDelete={handleDelete} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}