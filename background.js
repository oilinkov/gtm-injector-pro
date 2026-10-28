chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.sync.set({
      gtmId: '',
      enabled: false
    });
  }
  updateActionIcon(false);
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'triggerInjection') {
    handleInjection(request.tabId, request.enabled, request.gtmId);
  } else if (request.action === 'clearInjection') {
    clearInjection(request.tabId);
  }
  sendResponse({ status: 'ok' });
});

// Automatically inject on tab navigation/complete if enabled
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    chrome.storage.sync.get(['enabled', 'gtmId'], (data) => {
      if (data.enabled && data.gtmId) {
        handleInjection(tabId, true, data.gtmId);
      }
    });
  }
});

async function handleInjection(tabId, enabled, gtmId) {
  if (enabled && gtmId) {
    try {
      const tab = await chrome.tabs.get(tabId);
      if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about://') || tab.url.startsWith('chrome-extension://')) {
        return;
      }

      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        world: 'MAIN',
        args: [gtmId],
        func: (id) => {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            'gtm.start': new Date().getTime(),
            event: 'gtm.js',
            'gtm.injector': 'pro'
          });

          // Prevent duplicate injection
          if (document.getElementById('gtm-injector-pro-main-script')) return;

          const script = document.createElement('script');
          script.id = 'gtm-injector-pro-main-script';
          script.async = true;
          script.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(id);
          const target = document.head || document.documentElement;
          if (target) {
            target.insertBefore(script, target.firstChild);
          }
        }
      });

      chrome.tabs.sendMessage(tabId, { action: 'showBanner', gtmId: gtmId }).catch(() => {});
    } catch (e) {
      console.error('Injection error:', e);
    }
  } else {
    clearInjection(tabId);
  }
}

async function clearInjection(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('about://') || tab.url.startsWith('chrome-extension://')) {
      return;
    }

    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      world: 'MAIN',
      func: () => {
        const script = document.getElementById('gtm-injector-pro-main-script');
        if (script) script.remove();
      }
    });

    chrome.tabs.sendMessage(tabId, { action: 'hideBanner' }).catch(() => {});
  } catch (e) {
    console.error('Clear error:', e);
  }
}

async function updateActionIcon(isEnabled) {
  try {
    if (!isEnabled) {
      // Revert to original icon files from manifest
      chrome.action.setIcon({
        path: {
          16: 'icons/icon16.png',
          48: 'icons/icon48.png',
          128: 'icons/icon128.png'
        }
      });
      return;
    }

    // Load original icon image and draw status dot overlay
    const response = await fetch(chrome.runtime.getURL('icons/icon16.png'));
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);

    const canvas = new OffscreenCanvas(16, 16);
    const ctx = canvas.getContext('2d');
    
    // Draw original icon
    ctx.drawImage(bitmap, 0, 0, 16, 16);

    // Draw crisp status dot in top-right
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(13.5, 2.5, 2.5, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.stroke();

    const imageData = ctx.getImageData(0, 0, 16, 16);
    chrome.action.setIcon({ imageData: imageData });
  } catch (e) {
    console.error('Icon update error:', e);
    chrome.action.setBadgeText({ text: isEnabled ? '•' : '' });
    chrome.action.setBadgeBackgroundColor({ color: '#10b981' });
  }
}

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.enabled !== undefined) {
    const isEnabled = changes.enabled.newValue;
    updateActionIcon(isEnabled);

    if (!isEnabled) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].id) {
          clearInjection(tabs[0].id);
        }
      });
    }
  }
});