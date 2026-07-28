<div align="center">

  <h1>✨ Yuvi Master — Smart Copy & Paste Chrome Extension</h1>

  <p align="center">
    <strong>A lightweight Manifest V3 Chrome Extension designed to bypass copy-paste restrictions, force text insertion on protected forms, AND block copy-paste actions on specific user-designated websites.</strong>
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

**Yuvi Master** is a high-utility browser extension that restores full copy and paste functionality on web pages that restrict standard clipboard operations, while also offering a site-blocking engine that allows users to selectively **block copy-paste actions on specific websites**.

By capturing text selections at document execution, providing a dual-buffer fallback engine, and syncing user blocklists via `chrome.storage`, **Yuvi Master** gives you total control over clipboard behavior across all web pages.

---

## 🔄 Architecture Workflow Chart

```mermaid
flowchart TD
    A["📄 Web Page Loaded (document_start)"] --> B["Inject content.js Listener"]
    B --> C{"Check Domain against Blocklist"}

    subgraph BLOCKED_SITE ["🚫 Site Blocked Mode"]
        C -->|Match Found| D["Intercept copy, cut, paste & keydown events (capture phase)"]
        D --> E["e.preventDefault() & e.stopImmediatePropagation()"]
        E --> F["❌ Copy-Paste & Shortcuts strictly disabled"]
    end

    subgraph ALLOWED_SITE ["✅ Standard / Allowed Mode"]
        C -->|No Match| G["Enable Smart Copy & Paste Engine"]
        
        subgraph COPY_ENGINE ["Copy Event Listener"]
            G --> H["Store Selection in Memory Buffer (storedText)"]
        end
        
        subgraph PASTE_ENGINE ["Paste Event Listener (Ctrl + V / Right Click)"]
            G --> I["Try navigator.clipboard.readText()"]
            I -->|Allowed| J["Use System Clipboard Data"]
            I -->|Blocked| K["Fallback to Stored Memory Buffer"]
        end

        J --> L["insertTextSmart(text)"]
        K --> L
        L --> M["✅ Successful Text Paste"]
    end
```

---

## ⚡ Core Features

* **🚫 Site Copy-Paste Blocker:** Easily add any website to a custom blocklist to strictly prevent copy, cut, paste, and keyboard shortcuts (`Ctrl+C`, `Ctrl+V`, `Ctrl+X`, `Cmd+C`, `Cmd+V`, `Cmd+X`).
* **⚡ 1-Click Current Site Blocking:** Instantly toggle copy-paste permissions for your active browser tab from the popup toolbar.
* **🛡️ Bypasses Copy & Paste Restrictions:** Overrides `disabled` paste event handlers, blocked context menus, and custom website script restrictions on allowed sites.
* **💾 Dual-Buffer Fallback System:** Automatically caches highlighted text selections in extension memory. If browser security blocks `navigator.clipboard`, the extension falls back to memory storage.
* **🎯 Universal DOM Insertion Engine:**
  * **Input & Textarea:** Injects text precisely at current cursor position (`selectionStart`/`selectionEnd`) and dispatches native reactive `input` events for compatibility with React, Vue, Angular, and Svelte forms.
  * **ContentEditable Elements:** Uses native text insertion command for rich text editors.
  * **Protected Fields:** Automatically forces element focus before execution.
* **✨ Sleek Control Popup:** Modern Inter-font rounded card interface with active domain status detection, quick site addition input, scrollable blocklist manager, and toast feedback.

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
* Manage your blocked sites list or enjoy unrestricted copy-paste capabilities!

---

## 🛠️ Project Structure

```
Yuvi-Master/
├── manifest.json      # Chrome Extension Manifest V3 Configuration (with Storage Permission)
├── content.js         # Copy-Paste Blocking & DOM Inserter Content Script
├── popup.html         # Modern Control Panel Interface
├── popup.js           # Site Blocklist & Tab Manager Logic
├── icon.png           # Extension Toolbar & Store Icon
└── README.md          # Project Documentation & Installation Guide
```

---

## 📬 Author & License

**Yuvraj Singh** — *AI & Data Science Engineer \| Full-Stack Developer*

* 🌐 **GitHub:** [@SINGH0883](https://github.com/SINGH0883)
* 💼 **LinkedIn:** [Yuvraj Singh](https://www.linkedin.com/in/yuvraj-singh-85abc)

Licensed under the [MIT License](LICENSE).
