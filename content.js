// Yuvi Master - Content Script with Copy-Paste Blocking Engine

let storedText = "";
let blockedSites = [];
let isSiteBlocked = false;

// Storage reference
const storageArea = (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync)
  ? chrome.storage.sync
  : (typeof chrome !== "undefined" && chrome.storage ? chrome.storage.local : null);

// Initialize blocked sites and start listeners
initStorage();

function initStorage() {
  if (!storageArea) return;

  storageArea.get({ blockedSites: [] }, (items) => {
    blockedSites = items.blockedSites || [];
    checkBlockingState();
  });

  if (chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (changes.blockedSites) {
        blockedSites = changes.blockedSites.newValue || [];
        checkBlockingState();
      }
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
}

// -------------------------------------------------------------
// EVENT LISTENERS (CAPTURE PHASE FOR STRICT OVERRIDE)
// -------------------------------------------------------------

// BLOCK / ALLOW: COPY
document.addEventListener("copy", (e) => {
  if (isSiteBlocked) {
    e.preventDefault();
    e.stopImmediatePropagation();
    return false;
  }

  // Standard Yuvi Master helper behavior: store text selection
  const text = window.getSelection().toString();
  if (text) storedText = text;
}, true);

// BLOCK / ALLOW: CUT
document.addEventListener("cut", (e) => {
  if (isSiteBlocked) {
    e.preventDefault();
    e.stopImmediatePropagation();
    return false;
  }
}, true);

// BLOCK / ALLOW: PASTE
document.addEventListener("paste", (e) => {
  if (isSiteBlocked) {
    e.preventDefault();
    e.stopImmediatePropagation();
    return false;
  }
}, true);

// KEYDOWN INTERCEPTOR: CTRL/CMD + C, V, X
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

  // Standard Yuvi Master helper behavior: Smart Ctrl+V fallback
  if (isCtrlOrCmd && key === "v") {
    e.preventDefault();

    let text = storedText;

    try {
      const clip = await navigator.clipboard.readText();
      if (clip) text = clip;
    } catch (err) {
      console.log("Clipboard blocked, using stored text");
    }

    insertTextSmart(text);
  }
}, true);

// Right click context menu paste support for non-blocked sites
document.addEventListener("contextmenu", async () => {
  if (isSiteBlocked) return;

  try {
    const text = await navigator.clipboard.readText();
    insertTextSmart(text);
  } catch (e) {}
}, true);

// -------------------------------------------------------------
// DOM TEXT INSERTER (FOR NON-BLOCKED SITES)
// -------------------------------------------------------------
function insertTextSmart(text) {
  if (!text || isSiteBlocked) return;

  const el = document.activeElement;
  if (!el) return;

  // INPUT / TEXTAREA
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

  // CONTENT EDITABLE
  if (el.isContentEditable) {
    document.execCommand("insertText", false, text);
    return;
  }

  // FALLBACK (force focus)
  el.focus();
  document.execCommand("insertText", false, text);
}