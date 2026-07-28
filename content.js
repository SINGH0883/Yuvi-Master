// Yuvi Master — Universal Copy & Paste Enabler Content Script
// Automatically unlocks copy, cut, paste, and text selection on ALL websites at all times.

let storedText = "";

// -------------------------------------------------------------
// 1. CSS USER-SELECT ENFORCER (ENABLES SELECTION EVERYWHERE)
// -------------------------------------------------------------
function enableTextSelectionCSS() {
  if (document.getElementById("yuvi-master-enable-select")) return;
  const style = document.createElement("style");
  style.id = "yuvi-master-enable-select";
  style.textContent = `
    * {
      -webkit-user-select: text !important;
      -moz-user-select: text !important;
      -ms-user-select: text !important;
      user-select: text !important;
    }
  `;
  (document.head || document.documentElement).appendChild(style);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", enableTextSelectionCSS);
} else {
  enableTextSelectionCSS();
}

// -------------------------------------------------------------
// 2. UNBLOCK INLINE EVENT HANDLERS (ONCOPY, ONPASTE, ONCONTEXTMENU)
// -------------------------------------------------------------
function unblockInlineHandlers() {
  try {
    document.oncopy = null;
    document.oncut = null;
    document.onpaste = null;
    document.oncontextmenu = null;
    document.onselectstart = null;
    window.oncopy = null;
    window.oncut = null;
    window.onpaste = null;
    window.oncontextmenu = null;
    window.onselectstart = null;
  } catch (e) {}
}

unblockInlineHandlers();
setInterval(unblockInlineHandlers, 2000);

// -------------------------------------------------------------
// 3. COPY & CUT LISTENERS (RECORD SELECTION IN MEMORY)
// -------------------------------------------------------------
document.addEventListener("copy", (e) => {
  const selection = window.getSelection().toString();
  if (selection) {
    storedText = selection;
  }
  e.stopPropagation();
}, true);

document.addEventListener("cut", (e) => {
  const selection = window.getSelection().toString();
  if (selection) {
    storedText = selection;
  }
  e.stopPropagation();
}, true);

// Allow right-click context menu everywhere
document.addEventListener("contextmenu", (e) => {
  e.stopPropagation();
}, true);

// -------------------------------------------------------------
// 4. SMART PASTE ENGINE (CTRL+V / CMD+V OVERRIDE & INJECTION)
// -------------------------------------------------------------
document.addEventListener("keydown", async (e) => {
  const key = e.key ? e.key.toLowerCase() : "";
  const isCtrlOrCmd = e.ctrlKey || e.metaKey;

  // Unblock Copy & Cut key combinations
  if (isCtrlOrCmd && (key === "c" || key === "x")) {
    e.stopPropagation();
    const selection = window.getSelection().toString();
    if (selection) storedText = selection;
    return;
  }

  // Force Paste execution on Ctrl+V / Cmd+V
  if (isCtrlOrCmd && key === "v") {
    e.preventDefault();
    e.stopPropagation();

    let text = storedText;

    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) text = clipText;
    } catch (err) {
      console.log("Clipboard API read blocked, using stored memory buffer");
    }

    insertTextSmart(text);
  }
}, true);

// -------------------------------------------------------------
// 5. UNIVERSAL DOM TEXT INSERTER (REACTIVE FORM COMPATIBLE)
// -------------------------------------------------------------
function insertTextSmart(text) {
  if (!text) return;

  const el = document.activeElement;
  if (!el) return;

  // Standard INPUT / TEXTAREA
  if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
    const start = el.selectionStart || 0;
    const end = el.selectionEnd || 0;

    el.value =
      el.value.substring(0, start) +
      text +
      el.value.substring(end);

    el.selectionStart = el.selectionEnd = start + text.length;

    // Dispatch native reactive events for React/Vue/Angular/Svelte
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return;
  }

  // ContentEditable elements (Rich Text Editors)
  if (el.isContentEditable) {
    document.execCommand("insertText", false, text);
    return;
  }

  // Fallback focus & execCommand
  el.focus();
  document.execCommand("insertText", false, text);
}