// Yuvi Master - Content Script (Global Auto-Block Copy Guard)

let storedText = "";
let allowedSites = [];
let globalBlockAuto = true;
let isSiteBlocked = false;

// Storage reference
const storageArea = (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync)
  ? chrome.storage.sync
  : (typeof chrome !== "undefined" && chrome.storage ? chrome.storage.local : null);

// Initialize storage & start listeners
initStorage();

function initStorage() {
  if (!storageArea) return;

  storageArea.get({ globalBlockAuto: true, allowedSites: [] }, (items) => {
    globalBlockAuto = items.globalBlockAuto !== false;
    allowedSites = items.allowedSites || [];
    checkBlockingState();
  });

  if (chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.globalBlockAuto !== undefined) {
        globalBlockAuto = changes.globalBlockAuto.newValue !== false;
      }
      if (changes.allowedSites !== undefined) {
        allowedSites = changes.allowedSites.newValue || [];
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

function isMatch(host, targetDomain) {
  if (!host || !targetDomain) return false;
  const cleanHost = cleanDomain(host);
  const cleanTarget = cleanDomain(targetDomain);
  return (
    cleanHost === cleanTarget ||
    cleanHost.endsWith("." + cleanTarget) ||
    cleanTarget.endsWith("." + cleanHost)
  );
}

function checkBlockingState() {
  const currentHost = cleanDomain(window.location.hostname);

  if (!currentHost || !globalBlockAuto) {
    isSiteBlocked = false;
    return;
  }

  // When Global Auto-Block is active, ALL sites are blocked EXCEPT allowed sites
  const isWhitelisted = allowedSites.some((site) => isMatch(currentHost, site));
  isSiteBlocked = !isWhitelisted;
}

// -------------------------------------------------------------
// CAPTURE-PHASE COPY-PASTE BLOCKING ENGINE
// -------------------------------------------------------------

document.addEventListener("copy", (e) => {
  if (isSiteBlocked) {
    e.preventDefault();
    e.stopImmediatePropagation();
    return false;
  }

  // Allowed site behavior: store text selection for smart fallback
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

document.addEventListener("contextmenu", async () => {
  if (isSiteBlocked) return;

  try {
    const text = await navigator.clipboard.readText();
    insertTextSmart(text);
  } catch (e) {}
}, true);

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