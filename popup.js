document.getElementById("copyBtn").onclick = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => window.getSelection().toString()
  }, (res) => {
    if (res && res[0].result) {
      navigator.clipboard.writeText(res[0].result);
    }
  });
};

document.getElementById("pasteBtn").onclick = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: async () => {
      const text = await navigator.clipboard.readText();
      const el = document.activeElement;

      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA")) {
        el.value += text;
      } else if (el.isContentEditable) {
        document.execCommand("insertText", false, text);
      }
    }
  });
};

document.getElementById("copyTextBtn").onclick = () => {
  const text = document.getElementById("textBox").value;
  navigator.clipboard.writeText(text);
};