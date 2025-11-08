// Background Service Worker for Synapse Extension

const API_BASE_URL = 'http://localhost:3000'; // Change this when deployed

console.log('🧠 Synapse background script loaded!');

// Function to create all context menus
function createContextMenus() {
  // Remove all existing menus first
  chrome.contextMenus.removeAll(() => {
    console.log('Creating context menus...');

  // Main menu - Save to Synapse
  chrome.contextMenus.create({
    id: 'save-selection',
    title: '🧠 Save to Synapse',
    contexts: ['selection']
  }, () => {
    if (chrome.runtime.lastError) {
      console.error('Error creating save-selection menu:', chrome.runtime.lastError);
    } else {
      console.log('save-selection menu created');
    }
  });

  // Save link
  chrome.contextMenus.create({
    id: 'save-link',
    title: '🧠 Save Link to Synapse',
    contexts: ['link']
  });

  // Save image
  chrome.contextMenus.create({
    id: 'save-image',
    title: '🧠 Save Image to Synapse',
    contexts: ['image']
  });

  // Save video
  chrome.contextMenus.create({
    id: 'save-video',
    title: '🧠 Save Video to Synapse',
    contexts: ['video']
  });

  // Save page
  chrome.contextMenus.create({
    id: 'save-page',
    title: '🧠 Save Page to Synapse',
    contexts: ['page']
  });

  // Save as todo
  chrome.contextMenus.create({
    id: 'save-todo',
    title: '✅ Save as Todo',
    contexts: ['selection', 'page']
  });

  // Save as quote
  chrome.contextMenus.create({
    id: 'save-quote',
    title: '💬 Save as Quote',
    contexts: ['selection']
  });

    console.log('Context menus created!');
  });
}

// Create menus on install and startup
chrome.runtime.onInstalled.addListener(createContextMenus);
chrome.runtime.onStartup.addListener(createContextMenus);

// Also create menus immediately when script loads
createContextMenus();

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('Context menu clicked:', info.menuItemId);

  switch (info.menuItemId) {
    case 'save-selection':
      handleSaveSelection(info, tab);
      break;
    case 'save-link':
      handleSaveLink(info, tab);
      break;
    case 'save-image':
      handleSaveImage(info, tab);
      break;
    case 'save-video':
      handleSaveVideo(info, tab);
      break;
    case 'save-page':
      handleSavePage(info, tab);
      break;
    case 'save-todo':
      handleSaveTodo(info, tab);
      break;
    case 'save-quote':
      handleSaveQuote(info, tab);
      break;
  }
});

// Handler functions
async function handleSaveSelection(info, tab) {
  console.log('handleSaveSelection called', info, tab);
  const data = {
    content: info.selectionText,
    url: tab.url,
    pageTitle: tab.title,
    type: 'selection'
  };

  console.log('Sending data:', data);
  await sendToSynapse(data, tab.id);
}

async function handleSaveLink(info, tab) {
  const data = {
    content: info.linkUrl,
    url: info.linkUrl,
    pageTitle: tab.title,
    sourceUrl: tab.url,
    type: 'link'
  };

  await sendToSynapse(data, tab.id);
}

async function handleSaveImage(info, tab) {
  const data = {
    content: info.srcUrl,
    url: tab.url,
    pageTitle: tab.title,
    imageUrl: info.srcUrl,
    type: 'image'
  };

  await sendToSynapse(data, tab.id);
}

async function handleSaveVideo(info, tab) {
  // Extract video metadata from the page
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: extractVideoMetadata
  });

  const data = {
    content: `${tab.title}\n\n${result.description || ''}`,
    url: tab.url,
    pageTitle: tab.title,
    videoUrl: info.srcUrl || tab.url,
    metadata: result,
    type: 'video'
  };

  await sendToSynapse(data, tab.id);
}

async function handleSavePage(info, tab) {
  // Inject script to get page content
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: extractPageContent
  });

  const data = {
    content: result.content,
    url: tab.url,
    pageTitle: tab.title,
    metaDescription: result.metaDescription,
    type: 'page'
  };

  await sendToSynapse(data, tab.id);
}

async function handleSaveTodo(info, tab) {
  const data = {
    content: info.selectionText || tab.title,
    url: tab.url,
    pageTitle: tab.title,
    type: 'todo',
    forceType: 'todo' // Force classification as todo
  };

  await sendToSynapse(data, tab.id);
}

async function handleSaveQuote(info, tab) {
  const data = {
    content: info.selectionText,
    url: tab.url,
    pageTitle: tab.title,
    type: 'quote',
    forceType: 'quote' // Force classification as quote
  };

  await sendToSynapse(data, tab.id);
}

// Function to extract video metadata (runs in page context)
function extractVideoMetadata() {
  // Try to extract YouTube-specific metadata
  const isYouTube = window.location.hostname.includes('youtube.com');

  if (isYouTube) {
    // YouTube metadata extraction
    const title = document.querySelector('meta[name="title"]')?.content ||
                  document.querySelector('h1.ytd-video-primary-info-renderer')?.textContent ||
                  document.title.replace(' - YouTube', '');

    const description = document.querySelector('meta[name="description"]')?.content || '';

    const author = document.querySelector('ytd-channel-name a')?.textContent ||
                   document.querySelector('meta[name="author"]')?.content || '';

    const thumbnail = document.querySelector('meta[property="og:image"]')?.content || '';

    const duration = document.querySelector('meta[itemprop="duration"]')?.content || '';

    return {
      title,
      description,
      author,
      thumbnail,
      duration,
      platform: 'YouTube'
    };
  }

  // Generic video metadata extraction
  const title = document.querySelector('meta[property="og:title"]')?.content ||
                document.querySelector('meta[name="title"]')?.content ||
                document.title;

  const description = document.querySelector('meta[property="og:description"]')?.content ||
                     document.querySelector('meta[name="description"]')?.content || '';

  const thumbnail = document.querySelector('meta[property="og:image"]')?.content || '';

  return {
    title,
    description,
    thumbnail,
    platform: 'Video'
  };
}

// Function to extract page content (runs in page context)
function extractPageContent() {
  // Get main content
  const article = document.querySelector('article');
  const main = document.querySelector('main');
  const body = document.body;

  let content = '';
  if (article) {
    content = article.innerText;
  } else if (main) {
    content = main.innerText;
  } else {
    content = body.innerText.substring(0, 5000); // Limit to 5000 chars
  }

  // Get meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  const metaDescription = metaDesc ? metaDesc.content : '';

  return {
    content,
    metaDescription
  };
}

// Send data to Synapse API
async function sendToSynapse(data, tabId) {
  console.log('sendToSynapse called with:', data, 'tabId:', tabId);
  try {
    // Show loading notification
    console.log('Showing processing notification...');
    await showNotification(tabId, 'processing', 'Saving to Synapse...');

    // Build the payload
    const payload = {
      content: data.content,
      url: data.url,
      imageData: data.imageUrl ? null : null,
      pageTitle: data.pageTitle,
      metadata: data.metadata || null,
    };

    console.log('Making API call to:', `${API_BASE_URL}/api/save`);
    console.log('Payload:', payload);

    const response = await fetch(`${API_BASE_URL}/api/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('API response status:', response.status);

    if (!response.ok) {
      throw new Error('Failed to save to Synapse');
    }

    const result = await response.json();
    console.log('API response data:', result);

    // Show success notification
    console.log('Showing success notification...');
    await showNotification(tabId, 'success', '✅ Saved to Synapse!');

    console.log('Saved to Synapse:', result);
  } catch (error) {
    console.error('Error saving to Synapse:', error);
    await showNotification(tabId, 'error', '❌ Failed to save. Check console.');
  }
}

// Show notification to user
async function showNotification(tabId, type, message) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: displayToast,
      args: [type, message]
    });
  } catch (error) {
    console.error('Failed to show notification:', error);
  }
}

// Function to display toast (runs in page context)
function displayToast(type, message) {
  // Remove existing toast if any
  const existing = document.getElementById('synapse-toast');
  if (existing) {
    existing.remove();
  }

  // Create toast element
  const toast = document.createElement('div');
  toast.id = 'synapse-toast';
  toast.textContent = message;

  // Style based on type
  const baseStyles = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    z-index: 999999;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    animation: slideIn 0.3s ease-out;
  `;

  if (type === 'success') {
    toast.style.cssText = baseStyles + 'background: #10b981; color: white;';
  } else if (type === 'error') {
    toast.style.cssText = baseStyles + 'background: #ef4444; color: white;';
  } else if (type === 'processing') {
    toast.style.cssText = baseStyles + 'background: #3b82f6; color: white;';
  }

  // Add animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  document.body.appendChild(toast);

  // Auto remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'quickSave') {
    handleSaveSelection({ selectionText: request.data.content }, sender.tab);
    sendResponse({ success: true });
  }
  return true;
});
