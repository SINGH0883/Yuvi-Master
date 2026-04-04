let storedText = "";

// COPY → Store text reliably
document.addEventListener("copy", () => {
  const text = window.getSelection().toString();
  if (text) storedText = text;
});

// PASTE → Smart handling
document.addEventListener("keydown", async (e) => {
  if (e.ctrlKey && e.key.toLowerCase() === "v") {
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
});

// Right click paste (extra support)
document.addEventListener("contextmenu", async () => {
  try {
    const text = await navigator.clipboard.readText();
    insertTextSmart(text);
  } catch (e) {}
});

function insertTextSmart(text) {
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