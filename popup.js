// Yuvi Master - Extension Popup Script (Global Auto-Block System)

const storageArea = (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync)
  ? chrome.storage.sync
  : (typeof chrome !== "undefined" && chrome.storage ? chrome.storage.local : null);

let currentDomain = "";
let allowedSites = [];
let globalBlockAuto = true;

document.addEventListener("DOMContentLoaded", async () => {
  await initPopup();
});

async function initPopup() {
  const data = await getStorageData();
  globalBlockAuto = data.globalBlockAuto;
  allowedSites = data.allowedSites;
  
  await detectCurrentTabDomain();
  renderUI();
  setupEventListeners();
}

function getStorageData() {
  return new Promise((resolve) => {
    if (!storageArea) {
      resolve({ globalBlockAuto: true, allowedSites: [] });
      return;
    }
    storageArea.get({ globalBlockAuto: true, allowedSites: [] }, (items) => {
      resolve({
        globalBlockAuto: items.globalBlockAuto !== false,
        allowedSites: items.allowedSites || []
      });
    });
  });
}

function saveStorageData(data) {
  return new Promise((resolve) => {
    if (!storageArea) {
      resolve();
      return;
    }
    storageArea.set(data, () => {
      resolve();
    });
  });
}

function cleanDomain(urlOrDomain) {
  if (!urlOrDomain) return "";
  let domain = urlOrDomain.trim().toLowerCase();
  domain = domain.replace(/^(https?:\/\/)?(www\.)?/, "");
  return domain.split("/")[0].split("?")[0].split("#")[0].split(":")[0];
}

function isMatch(host, domain) {
  if (!host || !domain) return false;
  const cleanHost = cleanDomain(host);
  const cleanTarget = cleanDomain(domain);

  return (
    cleanHost === cleanTarget ||
    cleanHost.endsWith("." + cleanTarget) ||
    cleanTarget.endsWith("." + cleanHost)
  );
}

function isDomainWhitelisted(host) {
  return allowedSites.some((site) => isMatch(host, site));
}

function detectCurrentTabDomain() {
  return new Promise((resolve) => {
    if (typeof chrome === "undefined" || !chrome.tabs || !chrome.tabs.query) {
      currentDomain = "";
      resolve();
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].url) {
        try {
          const urlObj = new URL(tabs[0].url);
          if (urlObj.protocol.startsWith("http")) {
            currentDomain = cleanDomain(urlObj.hostname);
          } else {
            currentDomain = "";
          }
        } catch (e) {
          currentDomain = "";
        }
      }
      resolve();
    });
  });
}

function renderUI() {
  const globalToggle = document.getElementById("globalToggle");
  const currentDomainEl = document.getElementById("currentDomain");
  const statusBadge = document.getElementById("statusBadge");
  const toggleCurrentBtn = document.getElementById("toggleCurrentBtn");
  const siteListEl = document.getElementById("siteList");
  const siteCountEl = document.getElementById("siteCount");

  // Render global toggle
  globalToggle.checked = globalBlockAuto;

  // Render current tab status
  if (currentDomain) {
    currentDomainEl.textContent = currentDomain;
    const isWhitelisted = isDomainWhitelisted(currentDomain);

    if (globalBlockAuto) {
      if (isWhitelisted) {
        statusBadge.className = "status-badge allowed";
        statusBadge.textContent = "✅ Allowed (Whitelisted)";
        toggleCurrentBtn.className = "btn btn-danger";
        toggleCurrentBtn.textContent = "🚫 Block This Site";
        toggleCurrentBtn.disabled = false;
      } else {
        statusBadge.className = "status-badge blocked";
        statusBadge.textContent = "🚫 Auto-Blocked";
        toggleCurrentBtn.className = "btn btn-success";
        toggleCurrentBtn.textContent = "✅ Allow Copy-Paste on This Site";
        toggleCurrentBtn.disabled = false;
      }
    } else {
      statusBadge.className = "status-badge allowed";
      statusBadge.textContent = "✅ Allowed (Auto-Block OFF)";
      toggleCurrentBtn.className = "btn btn-danger";
      toggleCurrentBtn.textContent = "🚫 Block This Site";
      toggleCurrentBtn.disabled = true;
    }
  } else {
    currentDomainEl.textContent = "Internal / Blank Page";
    statusBadge.className = "status-badge allowed";
    statusBadge.textContent = "N/A";
    toggleCurrentBtn.textContent = "✅ Allow Copy-Paste on This Site";
    toggleCurrentBtn.disabled = true;
  }

  // Render allowed site count
  siteCountEl.textContent = allowedSites.length;

  // Render allowed sites list
  if (allowedSites.length === 0) {
    siteListEl.innerHTML = `
      <div class="empty-state">
        <span>✅</span>
        No custom allowed sites.<br/>All sites visited are automatically copy-blocked.
      </div>
    `;
    return;
  }

  siteListEl.innerHTML = "";
  allowedSites.forEach((site) => {
    const item = document.createElement("div");
    item.className = "site-item";

    const domainSpan = document.createElement("span");
    domainSpan.textContent = site;

    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.title = "Remove site from allowed list";
    delBtn.innerHTML = "✕";
    delBtn.addEventListener("click", () => removeAllowedSite(site));

    item.appendChild(domainSpan);
    item.appendChild(delBtn);
    siteListEl.appendChild(item);
  });
}

function setupEventListeners() {
  const globalToggle = document.getElementById("globalToggle");
  const toggleCurrentBtn = document.getElementById("toggleCurrentBtn");
  const addSiteBtn = document.getElementById("addSiteBtn");
  const siteInput = document.getElementById("siteInput");

  globalToggle.addEventListener("change", async (e) => {
    globalBlockAuto = e.target.checked;
    await saveStorageData({ globalBlockAuto });
    showToast(
      globalBlockAuto
        ? "Global Auto-Block Enabled! All visited sites copy-blocked by default."
        : "Global Auto-Block Disabled.",
      "success"
    );
    renderUI();
  });

  toggleCurrentBtn.addEventListener("click", async () => {
    if (!currentDomain) return;
    const isWhitelisted = isDomainWhitelisted(currentDomain);

    if (isWhitelisted) {
      // Remove from allowed list (so it gets auto-blocked again)
      allowedSites = allowedSites.filter((site) => !isMatch(currentDomain, site));
      await saveStorageData({ allowedSites });
      showToast(`Auto-blocked copy-paste on ${currentDomain}`, "success");
    } else {
      // Add to allowed list (whitelist)
      allowedSites.unshift(currentDomain);
      await saveStorageData({ allowedSites });
      showToast(`Allowed copy-paste on ${currentDomain}`, "success");
    }

    renderUI();
  });

  addSiteBtn.addEventListener("click", () => handleAddAllowedSite());

  siteInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      handleAddAllowedSite();
    }
  });
}

async function handleAddAllowedSite() {
  const siteInput = document.getElementById("siteInput");
  const cleaned = cleanDomain(siteInput.value);

  if (!cleaned) {
    showToast("Please enter a valid domain name", "error");
    return;
  }

  if (allowedSites.includes(cleaned)) {
    showToast(`${cleaned} is already in the allowed list`, "error");
    return;
  }

  allowedSites.unshift(cleaned);
  await saveStorageData({ allowedSites });
  siteInput.value = "";
  showToast(`Allowed copy-paste on ${cleaned}`, "success");
  renderUI();
}

async function removeAllowedSite(siteToRemove) {
  allowedSites = allowedSites.filter((site) => site !== siteToRemove);
  await saveStorageData({ allowedSites });
  showToast(`Removed ${siteToRemove} from allowed list`, "success");
  renderUI();
}

function showToast(msg, type = "success") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.className = "toast";
  }, 2500);
}