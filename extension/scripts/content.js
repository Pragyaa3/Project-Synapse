// Content Script - Runs on every page

let floatingButton = null;
let selectedText = '';

// Create floating button
function createFloatingButton() {
  if (floatingButton) return floatingButton;

  const button = document.createElement('div');
  button.id = 'synapse-floating-btn';
  button.innerHTML = '🧠';
  button.title = 'Save to Synapse';
  button.style.cssText = `
    position: absolute;
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    z-index: 999998;
    opacity: 0;
    transform: scale(0.8);
    transition: all 0.2s ease;
    pointer-events: none;
  `;

  button.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    saveSelectedText();
    hideFloatingButton();
  });

  document.body.appendChild(button);
  floatingButton = button;
  return button;
}

// Show floating button near selection
function showFloatingButton(x, y) {
  const button = createFloatingButton();

  // Position near selection
  button.style.left = `${x}px`;
  button.style.top = `${y - 50}px`;
  button.style.opacity = '1';
  button.style.transform = 'scale(1)';
  button.style.pointerEvents = 'auto';

  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (floatingButton) {
      hideFloatingButton();
    }
  }, 5000);
}

// Hide floating button
function hideFloatingButton() {
  if (floatingButton) {
    floatingButton.style.opacity = '0';
    floatingButton.style.transform = 'scale(0.8)';
    floatingButton.style.pointerEvents = 'none';
  }
}

// Save selected text
function saveSelectedText() {
  if (selectedText) {
    chrome.runtime.sendMessage({
      action: 'quickSave',
      data: {
        content: selectedText,
        url: window.location.href,
        pageTitle: document.title
      }
    });
  }
}

// Listen for text selection
document.addEventListener('mouseup', (e) => {
  const selection = window.getSelection();
  const text = selection.toString().trim();

  if (text.length > 0) {
    selectedText = text;

    // Get selection position
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    showFloatingButton(
      rect.left + (rect.width / 2) - 20 + window.scrollX,
      rect.top + window.scrollY
    );
  } else {
    hideFloatingButton();
    selectedText = '';
  }
});

// Hide button when clicking elsewhere
document.addEventListener('mousedown', (e) => {
  if (floatingButton && e.target !== floatingButton) {
    const selection = window.getSelection();
    if (!selection.toString().trim()) {
      hideFloatingButton();
    }
  }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl+Shift+X (Windows) or Cmd+Shift+X (Mac) - Quick save
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'X') {
    e.preventDefault();
    const selection = window.getSelection().toString().trim();
    if (selection) {
      selectedText = selection;
      saveSelectedText();
    }
  }

  // Ctrl+Shift+S (Windows) or Cmd+Shift+S (Mac) - Save page
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
    e.preventDefault();
    chrome.runtime.sendMessage({
      action: 'savePage'
    });
  }
});

// Double-click on images to save
document.addEventListener('dblclick', (e) => {
  if (e.target.tagName === 'IMG') {
    e.preventDefault();

    const confirmed = confirm('Save this image to Synapse?');
    if (confirmed) {
      chrome.runtime.sendMessage({
        action: 'saveImage',
        data: {
          imageUrl: e.target.src,
          pageUrl: window.location.href,
          pageTitle: document.title,
          altText: e.target.alt
        }
      });
    }
  }
});

// Flash effect on captured element
function flashElement(element) {
  const originalBg = element.style.backgroundColor;
  const originalTransition = element.style.transition;

  element.style.transition = 'background-color 0.3s ease';
  element.style.backgroundColor = 'rgba(102, 126, 234, 0.3)';

  setTimeout(() => {
    element.style.backgroundColor = originalBg;
    setTimeout(() => {
      element.style.transition = originalTransition;
    }, 300);
  }, 300);
}

console.log('🧠 Synapse extension loaded!');
