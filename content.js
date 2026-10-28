(function () {
  const BANNER_ID = 'gtm-injector-pro-debug-banner';

  function showInPageBanner(containerId) {
    let banner = document.getElementById(BANNER_ID);
    if (!banner) {
      banner = document.createElement('div');
      banner.id = BANNER_ID;
      banner.style.cssText = `
        position: fixed;
        bottom: 16px;
        right: 16px;
        z-index: 9999999;
        background: rgba(15, 23, 42, 0.94);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(6, 182, 212, 0.5);
        border-radius: 10px;
        padding: 10px 14px;
        color: #f8fafc;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 11px;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(6, 182, 212, 0.3);
        display: flex;
        align-items: center;
        gap: 10px;
        pointer-events: auto;
        user-select: none;
      `;

      const styleTag = document.createElement('style');
      styleTag.textContent = `
        @keyframes gtmPulseDot {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
      `;
      (document.head || document.documentElement).appendChild(styleTag);
    }

    banner.innerHTML = `
      <span style="width: 8px; height: 8px; border-radius: 50%; background-color: #10b981; display: inline-block; animation: gtmPulseDot 1.8s infinite;"></span>
      <span>active: <strong style="color: #22d3ee; font-family: monospace;">${containerId}</strong></span>
      <button id="gtmBannerClose" title="Turn Off & Close" style="background: none; border: none; color: #64748b; cursor: pointer; font-size: 16px; margin-left: 6px; line-height: 1; transition: color 0.2s;">&times;</button>
    `;

    if (document.body && !document.body.contains(banner)) {
      document.body.appendChild(banner);
    }

    const closeBtn = document.getElementById('gtmBannerClose');
    if (closeBtn) {
      closeBtn.addEventListener('mouseover', () => closeBtn.style.color = '#ef4444');
      closeBtn.addEventListener('mouseout', () => closeBtn.style.color = '#64748b');
      closeBtn.addEventListener('click', () => {
        chrome.storage.sync.set({ enabled: false });
      });
    }
  }

  function hideInPageBanner() {
    const banner = document.getElementById(BANNER_ID);
    if (banner) banner.remove();
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'showBanner') {
      showInPageBanner(request.gtmId);
    } else if (request.action === 'hideBanner') {
      hideInPageBanner();
    }
    sendResponse({ status: 'ok' });
  });
})();