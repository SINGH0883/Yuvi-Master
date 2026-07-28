<div align="center">

  <h1>✨ Yuvi Master — Automatic Copy & Paste Guard</h1>

  <p align="center">
    <strong>A lightweight Manifest V3 Chrome Extension that automatically blocks copy-paste actions across all visited websites by default, featuring an Allowed Sites Whitelist for trusted domains.</strong>
  </p>

  <p align="center">
    <a href="https://github.com/SINGH0883/Yuvi-Master">
      <img src="https://img.shields.io/badge/Manifest_Version-V3-38bdf8?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Manifest V3">
    </a>
    <a href="https://github.com/SINGH0883/Yuvi-Master">
      <img src="https://img.shields.io/badge/JavaScript-Auto_Guard-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
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

**Yuvi Master** is an automatic web guard extension designed to **block copy-paste actions across every site you visit by default**, without requiring manual domain additions.

Whenever you navigate to a webpage, **Yuvi Master** automatically prevents `copy`, `cut`, `paste`, and keyboard shortcuts (`Ctrl/Cmd+C/V/X`). Users can easily add trusted websites to an **Allowed Sites Whitelist** to enable copy-paste where needed.

---

## 🔄 Architecture Workflow Chart

```mermaid
flowchart TD
    A["📄 Web Page Loaded (document_start)"] --> B["Inject content.js Listener"]
    B --> C{"Is Global Auto-Block ON?"}

    subgraph AUTO_BLOCK_ACTIVE ["🌐 Global Auto-Block Mode (Default: ON)"]
        C -->|Yes| D{"Is Domain Whitelisted?"}
        D -->|No (Default)| E["🚫 Automatically Block copy, cut, paste & Ctrl/Cmd+C/V/X"]
        D -->|Yes (Allowed)| F["✅ Allow Copy & Paste"]
    end

    subgraph AUTO_BLOCK_OFF ["⚙️ Global Mode OFF"]
        C -->|No| F
    end

    subgraph PASTE_FALLBACK ["Smart Paste Fallback (Whitelisted Sites)"]
        F --> G["Store Text Selection & Enable Smart Insertion Engine"]
    end
```

---

## ⚡ Core Features

* **🌐 Global Auto-Block Mode:** Automatically blocks copy-paste actions on **every website you visit by default** — zero manual configuration required!
* **✅ Allowed Sites Whitelist:** Easily whitelist trusted websites (e.g. `github.com`) to allow normal copy-paste functionality on those specific domains.
* **⚡ 1-Click Current Site Whitelisting:** Instantly toggle copy-paste permissions for your current active tab directly from the extension popup.
* **💾 Dual-Buffer Smart Insertion:** On allowed sites, Yuvi Master provides a smart fallback paste engine for restricted web forms.
* **✨ Sleek Control Popup:** Modern Inter-font rounded card interface featuring active domain status detection, global toggle switch, quick whitelist addition, and custom site manager.

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
* Enjoy automatic copy-paste protection across all visited web pages!

---

## 🛠️ Project Structure

```
Yuvi-Master/
├── manifest.json      # Chrome Extension Manifest V3 Configuration
├── content.js         # Global Auto-Block & Whitelist Content Script
├── popup.html         # Modern Control Panel Interface with Global Toggle
├── popup.js           # Whitelist & Global State Storage Script
├── icon.png           # Extension Toolbar & Store Icon
└── README.md          # Project Documentation & Installation Guide
```

---

## 📬 Author & License

**Yuvraj Singh** — *AI & Data Science Engineer \| Full-Stack Developer*

* 🌐 **GitHub:** [@SINGH0883](https://github.com/SINGH0883)
* 💼 **LinkedIn:** [Yuvraj Singh](https://www.linkedin.com/in/yuvraj-singh-85abc)

Licensed under the [MIT License](LICENSE).
