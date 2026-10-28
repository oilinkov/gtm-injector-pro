document.addEventListener('DOMContentLoaded', async () => {
  const toggle = document.getElementById('injectionToggle');
  const gtmInput = document.getElementById('gtmIdInput');
  const saveBtn = document.getElementById('saveBtn');
  const resetBtn = document.getElementById('resetBtn');
  const pasteBtn = document.getElementById('pasteBtn');
  const statusBadge = document.getElementById('statusBadge');
  const statusText = document.getElementById('statusText');
  const badgeTag = document.getElementById('badgeTag');
  const currentDomain = document.getElementById('currentDomain');
  const footerStatus = document.getElementById('footerStatus');

  let statusTimer;
  function showStatus(message) {
    clearTimeout(statusTimer);
    footerStatus.textContent = message;
    statusTimer = setTimeout(() => {
      footerStatus.textContent = 'Ready';
    }, 2500);
  }

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.url) {
      const url = new URL(tab.url);
      currentDomain.textContent = 'Target: ' + url.hostname;
    }
  } catch (e) {
    currentDomain.textContent = 'Target: Web Page';
  }

  chrome.storage.sync.get(['gtmId', 'enabled'], (data) => {
    if (data.gtmId) gtmInput.value = data.gtmId;
    toggle.checked = !!data.enabled;
    updateUIState(!!data.enabled, data.gtmId || '');
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'sync') {
      if (changes.enabled !== undefined) {
        toggle.checked = changes.enabled.newValue;
        chrome.storage.sync.get(['gtmId'], (data) => {
          updateUIState(changes.enabled.newValue, data.gtmId || '');
        });
      }
    }
  });

  function updateUIState(isEnabled, gtmId) {
    if (isEnabled && gtmId) {
      statusBadge.className = 'status-card active';
      statusText.textContent = 'active';
      badgeTag.textContent = 'on';
    } else {
      statusBadge.className = 'status-card';
      statusText.textContent = isEnabled ? 'missing id' : 'disabled';
      badgeTag.textContent = 'off';
    }
  }

  saveBtn.addEventListener('click', async () => {
    const rawId = gtmInput.value.trim().toUpperCase();
    const gtmIdPattern = /^GTM-[A-Z0-9]+$/;

    if (!rawId) {
      showStatus('⚠️ Enter ID');
      gtmInput.focus();
      return;
    }

    if (!gtmIdPattern.test(rawId)) {
      showStatus('⚠️ Invalid ID');
      return;
    }

    toggle.checked = true;
    const enabled = true;

    chrome.storage.sync.set({ gtmId: rawId, enabled: enabled }, async () => {
      updateUIState(enabled, rawId);
      showStatus('⚡ Injected!');

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id) {
        chrome.runtime.sendMessage({
          action: 'triggerInjection',
          tabId: tab.id,
          enabled: enabled,
          gtmId: rawId
        });
      }
    });
  });

  toggle.addEventListener('change', async () => {
    const enabled = toggle.checked;
    const rawId = gtmInput.value.trim().toUpperCase();

    chrome.storage.sync.set({ enabled: enabled }, async () => {
      updateUIState(enabled, rawId);
      showStatus(enabled ? '✅ Enabled' : '⏸️ Disabled');

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id) {
        chrome.runtime.sendMessage({
          action: 'triggerInjection',
          tabId: tab.id,
          enabled: enabled,
          gtmId: rawId
        });
      }
    });
  });

  resetBtn.addEventListener('click', async () => {
    chrome.storage.sync.clear(async () => {
      gtmInput.value = '';
      toggle.checked = false;
      updateUIState(false, '');
      showStatus('🔄 Cleared');

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id) {
        chrome.runtime.sendMessage({
          action: 'clearInjection',
          tabId: tab.id
        });
      }
    });
  });

  pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        gtmInput.value = text.trim().toUpperCase();
        showStatus('📋 Pasted');
      }
    } catch (err) {
      showStatus('⚠️ No clipboard');
    }
  });
});