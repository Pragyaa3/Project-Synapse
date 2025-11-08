// Popup Script

const APP_URL = 'http://localhost:3000'; // Change when deployed

// Get current tab
async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

// Save page
document.getElementById('save-page').addEventListener('click', async () => {
  const tab = await getCurrentTab();
  chrome.runtime.sendMessage({
    action: 'savePage',
    tabId: tab.id
  });
  window.close();
});

// Save selection
document.getElementById('save-selection').addEventListener('click', async () => {
  const tab = await getCurrentTab();

  // Get selected text from current tab
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => window.getSelection().toString()
  });

  if (result && result.trim()) {
    chrome.runtime.sendMessage({
      action: 'quickSave',
      data: {
        content: result,
        url: tab.url,
        pageTitle: tab.title
      }
    });
    window.close();
  } else {
    alert('Please select some text first!');
  }
});

// Save screenshot
document.getElementById('save-screenshot').addEventListener('click', async () => {
  const tab = await getCurrentTab();

  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });

    // Convert to blob and send to API
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    // TODO: Implement screenshot upload to API
    alert('Screenshot captured! (Upload implementation pending)');
    window.close();
  } catch (error) {
    console.error('Screenshot failed:', error);
    alert('Failed to capture screenshot');
  }
});

// Save as todo
document.getElementById('save-todo').addEventListener('click', async () => {
  const tab = await getCurrentTab();

  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => window.getSelection().toString()
  });

  const content = result && result.trim() ? result : tab.title;

  chrome.runtime.sendMessage({
    action: 'quickSave',
    data: {
      content,
      url: tab.url,
      pageTitle: tab.title,
      forceType: 'todo'
    }
  });
  window.close();
});

// Open app
document.getElementById('open-app').addEventListener('click', () => {
  chrome.tabs.create({ url: APP_URL });
  window.close();
});

// Load stats (optional - implement later)
async function loadStats() {
  // TODO: Fetch stats from storage or API
  // For now, just placeholder
}

loadStats();
