// Yuvi Master - Content Script with Dual-Engine Copy-Paste Blocker

let storedText = "";
let blockedSites = [];
let blockerEngineMode = "auto"; // 'primary' | 'secondary' | 'auto'
let isSiteBlocked = false;
let styleElement = null;

// Storage reference
const storageArea = (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync)
  ? chrome.storage.sync
  : (typeof chrome !== "undefined" && chrome.storage ? chrome.storage.local : null);

// Initialize storage & listeners
initStorage();

function initStorage() {
  if (!storageArea) return;

  storageArea.get({ blockedSites: [], blockerEngineMode: "auto" }, (items) => {
    blockedSites = items.blockedSites || [];
    blockerEngineMode = items.blockerEngineMode || "auto";
    checkBlockingState();
  });

  if (chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.blockedSites) {
        blockedSites = changes.blockedSites.newValue || [];
      }
      if (changes.blockerEngineMode) {
        blockerEngineMode = changes.blockerEngineMode.newValue || "auto";
      }
      checkBlockingState();
    });
  }
}

function cleanDomain(urlOrDomain) {
  if (!urlOrDomain) return "";
  let domain = urlOrDomain.trim().toLowerCase();
  domain = domain.replace(/^(https?:\/\/)?(www\.)?/, "");
  return domain.split("/")[0].split("?")[0].split("#")[0].split(":")[0];
}

function checkBlockingState() {
  const currentHost = cleanDomain(window.location.hostname);
  if (!currentHost) {
    isSiteBlocked = false;
    applySecondaryEngine(false);
    return;
  }

  isSiteBlocked = blockedSites.some((site) => {
    const cleanSite = cleanDomain(site);
    if (!cleanSite) return false;
    return (
      currentHost === cleanSite ||
      currentHost.endsWith("." + cleanSite) ||
      cleanSite.endsWith("." + currentHost)
    );
  });

  // Apply or remove secondary aggressive backup engine based on state & mode
  const shouldRunSecondary = isSiteBlocked && (blockerEngineMode === "secondary" || blockerEngineMode === "auto");
  applySecondaryEngine(shouldRunSecondary);
}

// -------------------------------------------------------------
// PRIMARY BLOCKER ENGINE (CAPTURE PHASE EVENT INTERCEPTION)
// -------------------------------------------------------------

document.addEventListener("copy", (e) => {
  if (isSiteBlocked) {
    e.preventDefault();
    e.stopImmediatePropagation();
    return false;
  }

  // Allowed site behavior: store selected text for smart fallback
  const text = window.getSelection().toString();
  if (text) storedText = text;
}, true);

document.addEventListener("cut", (e) => {
  if (isSiteBlocked) {
    e.preventDefault();
    e.stopImmediatePropagation();
    return false;
  }
}, true);

document.addEventListener("paste", (e) => {
  if (isSiteBlocked) {
    e.preventDefault();
    e.stopImmediatePropagation();
    return false;
  }
}, true);

document.addEventListener("keydown", async (e) => {
  const key = e.key ? e.key.toLowerCase() : "";
  const isCtrlOrCmd = e.ctrlKey || e.metaKey;

  if (isSiteBlocked) {
    if (isCtrlOrCmd && (key === "c" || key === "v" || key === "x")) {
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    }
    return;
  }

  // Allowed site behavior: Smart Ctrl+V fallback
  if (isCtrlOrCmd && key === "v") {
    e.preventDefault();
    let text = storedText;
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) text = clip;
    } catch (err) {}
    insertTextSmart(text);
  }
}, true);

document.addEventListener("contextmenu", async (e) => {
  if (isSiteBlocked) {
    // If secondary engine is enabled, also prevent contextmenu copy/paste actions
    if (blockerEngineMode === "secondary" || blockerEngineMode === "auto") {
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    }
    return;
  }

  try {
    const text = await navigator.clipboard.readText();
    insertTextSmart(text);
  } catch (err) {}
}, true);

// -------------------------------------------------------------
// SECONDARY BLOCKER ENGINE (AGGRESSIVE BACKUP ENFORCEMENT)
// -------------------------------------------------------------

function applySecondaryEngine(enable) {
  if (enable) {
    // 1. Inject CSS user-select: none to prevent text selection
    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = "yuvi-master-block-style";
      styleElement.textContent = `
        html, body, body * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }
      `;
      (document.head || document.documentElement).appendChild(styleElement);
    }

    // 2. Selection sweeper
    document.addEventListener("selectionchange", clearSelectionSweeper, true);
    document.addEventListener("selectstart", preventSelectStart, true);

    // 3. Clear inline handlers
    clearInlineHandlers();
  } else {
    // Remove CSS user-select rule
    if (styleElement && styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement);
      styleElement = null;
    }

    document.removeEventListener("selectionchange", clearSelectionSweeper, true);
    document.removeEventListener("selectstart", preventSelectStart, true);
  }
}

function clearSelectionSweeper() {
  if (!isSiteBlocked) return;
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0) {
    sel.removeAllRanges();
  }
}

function preventSelectStart(e) {
  if (!isSiteBlocked) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  return false;
}

function clearInlineHandlers() {
  try {
    document.oncopy = null;
    document.oncut = null;
    document.onpaste = null;
    document.onselectstart = null;
    window.oncopy = null;
    window.oncut = null;
    window.onpaste = null;
    window.onselectstart = null;
  } catch (e) {}
}

// -------------------------------------------------------------
// DOM TEXT INSERTER (FOR ALLOWED SITES ONLY)
// -------------------------------------------------------------

function insertTextSmart(text) {
  if (!text || isSiteBlocked) return;

  const el = document.activeElement;
  if (!el) return;

  if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;

    el.value =
      el.value.substring(0, start) +
      text +
      el.value.substring(end);

    el.selectionStart = el.selectionEnd = start + text.length;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    return;
  }

  if (el.isContentEditable) {
    document.execCommand("insertText", false, text);
    return;
  }

  el.focus();
  document.execCommand("insertText", false, text);
}