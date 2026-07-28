// Yuvi Master - Universal Copy & Paste Enabler Popup

document.addEventListener("DOMContentLoaded", () => {
  detectCurrentTabDomain();
});

function detectCurrentTabDomain() {
  const domainEl = document.getElementById("currentDomain");
  if (!domainEl) return;

  if (typeof chrome === "undefined" || !chrome.tabs || !chrome.tabs.query) {
    domainEl.textContent = "All Web Pages";
    return;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs[0] && tabs[0].url) {
      try {
        const urlObj = new URL(tabs[0].url);
        if (urlObj.protocol.startsWith("http")) {
          domainEl.textContent = urlObj.hostname.replace(/^www\./, "");
          return;
        }
      } catch (e) {}
    }
    domainEl.textContent = "All Web Pages";
  });
}