<div align="center">

  <h1>✨ Yuvi Master — Universal Copy & Paste Enabler</h1>

  <p align="center">
    <strong>A lightweight Manifest V3 Chrome Extension that automatically bypasses copy-paste restrictions on ALL websites at all times — zero configuration required!</strong>
  </p>

  <p align="center">
    <a href="https://github.com/SINGH0883/Yuvi-Master">
      <img src="https://img.shields.io/badge/Manifest_Version-V3-38bdf8?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Manifest V3">
    </a>
    <a href="https://github.com/SINGH0883/Yuvi-Master">
      <img src="https://img.shields.io/badge/JavaScript-Smart_Clipboard-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
    </a>
    <a href="https://github.com/SINGH0883/Yuvi-Master">
      <img src="https://img.shields.io/badge/CSS3-Modern_UI-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
    </a>
    <a href="https://github.com/SINGH0883/Yuvi-Master/blob/main/LICENSE">
      <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License">
    </a>
  </p>

</div>

<hr />

## 🌟 Overview

**Yuvi Master** is a high-utility browser extension designed to **enable full copy and paste functionality across every website automatically**, without needing to turn any settings ON or OFF.

Whenever a website attempts to block text selection, disable context menus, or prevent pasting into locked forms, **Yuvi Master** overrides the site's script restrictions and seamlessly injects your copied text into any `<input>`, `<textarea>`, or `contenteditable` field.

---

## 🔄 Architecture Workflow Chart

```mermaid
flowchart TD
    A["📄 Web Page Loaded (document_start)"] --> B["Inject content.js Listener"]
    
    subgraph CSS_ENFORCER ["Selection CSS Enforcer"]
      B --> C["Inject user-select: text !important"]
    end
    
    subgraph UNBLOCKER ["Inline Event Handler Cleaner"]
      B --> D["Wipe oncopy, onpaste, oncontextmenu restrictions"]
    end

    subgraph COPY_ENGINE ["Copy & Selection Engine"]
        E["User Highlights & Copies Text"] --> F["Store Selection in Memory Buffer (storedText)"]
    end

    subgraph PASTE_ENGINE ["Smart Insertion Engine (Ctrl + V / Cmd + V)"]
        G["User Presses Ctrl + V"] --> H["Override Site e.preventDefault()"]
        H --> I{"Try navigator.clipboard.readText()"}
        I -->|Allowed| J["Use System Clipboard"]
        I -->|Blocked| K["Fallback to Memory Buffer"]
        J --> L["insertTextSmart(text)"]
        K --> L
        L --> M["Dispatch Reactive 'input' & 'change' Events"]
        M --> N["✅ Successful Text Paste on Protected Form"]
    end
```

---

## ⚡ Core Features

* **⚡ Universal Always-On Engine:** Automatically enables copy and paste across **all websites** without needing any ON/OFF toggle switches.
* **🛡️ Bypasses Copy & Paste Restrictions:** Overrides `disabled` paste event handlers, blocked context menus, and custom website script restrictions.
* **💾 Dual-Buffer Fallback System:** Automatically caches highlighted text selections in extension memory. If browser security blocks `navigator.clipboard`, the extension seamlessly falls back to memory storage.
* **🎯 Reactive Form Insertion:** Injects text precisely at current cursor position (`selectionStart`/`selectionEnd`) and dispatches native reactive `input` and `change` events for full compatibility with React, Vue, Angular, and Svelte forms.
* **✨ Clean Popup Interface:** Minimalist rounded popup card UI displaying current active website status.

---

## 💻 How to Install on Your Computer

Follow these quick steps to install **Yuvi Master** on any Chromium-based browser (**Google Chrome**, **Microsoft Edge**, **Brave**, **Vivaldi**, or **Opera**):

### Step 1: Download or Clone the Repository
* **Option A (Git):** Open your terminal/command prompt and run:
  ```bash
  git clone https://github.com/SINGH0883/Yuvi-Master.git
  ```
* **Option B (ZIP):** Download the repository ZIP file from GitHub and extract it to a folder on your computer.

---

### Step 2: Open Extensions Page in Your Browser
Open your preferred browser and navigate to the Extensions management page:
* **Google Chrome:** Type `chrome://extensions/` in the address bar and press **Enter**.
* **Microsoft Edge:** Type `edge://extensions/` in the address bar and press **Enter**.
* **Brave:** Type `brave://extensions/` in the address bar and press **Enter**.
* **Opera:** Type `opera://extensions` in the address bar and press **Enter**.

---

### Step 3: Enable Developer Mode
In the top right corner of the Extensions page, toggle the **Developer mode** switch to **ON** (Enabled).

```
Developer mode  [  ON  ]
```

---

### Step 4: Load the Unpacked Extension
1. Click the **"Load unpacked"** button that appears in the top left control bar.
2. A file picker window will open. Select the `Yuvi-Master` folder containing `manifest.json`.
3. Click **Select Folder**.

---

### Step 5: Pin & Enjoy!
* Click the Extensions puzzle icon (🧩) in your browser toolbar next to the address bar.
* Find **Yuvi Master** and click the **Pin** icon (📌).
* Enjoy unrestricted copy and paste capabilities everywhere!

---

## 🛠️ Project Structure

```
Yuvi-Master/
├── manifest.json      # Chrome Extension Manifest V3 Configuration
├── content.js         # Universal Copy-Paste Enabler & DOM Inserter Script
├── popup.html         # Minimalist Control Panel Interface
├── popup.js           # Extension Popup Script
├── icon.png           # Extension Toolbar & Store Icon
└── README.md          # Project Documentation & Installation Guide
```

---

## 📬 Author & License

**Yuvraj Singh** — *AI & Data Science Engineer \| Full-Stack Developer*

* 🌐 **GitHub:** [@SINGH0883](https://github.com/SINGH0883)
* 💼 **LinkedIn:** [Yuvraj Singh](https://www.linkedin.com/in/yuvraj-singh-85abc)

Licensed under the [MIT License](LICENSE).
