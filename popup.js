// Yuvi Master - Extension Popup Script

const storageArea = (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync)
  ? chrome.storage.sync
  : (typeof chrome !== "undefined" && chrome.storage ? chrome.storage.local : null);

let currentDomain = "";
let blockedSites = [];

document.addEventListener("DOMContentLoaded", async () => {
  await initPopup();
});

async function initPopup() {
  blockedSites = await getBlockedSites();
  await detectCurrentTabDomain();
  renderUI();
  setupEventListeners();
}

function getBlockedSites() {
  return new Promise((resolve) => {
    if (!storageArea) {
      resolve([]);
      return;
    }
    storageArea.get({ blockedSites: [] }, (items) => {
      resolve(items.blockedSites || []);
    });
  });
}

function saveBlockedSites(sites) {
  return new Promise((resolve) => {
    if (!storageArea) {
      resolve();
      return;
    }
    storageArea.set({ blockedSites: sites }, () => {
      resolve();
    });
  });
}

function cleanDomain(urlOrDomain) {
  if (!urlOrDomain) return "";
  let domain = urlOrDomain.trim().toLowerCase();
  
  // Remove protocol
  domain = domain.replace(/^(https?:\/\/)?(www\.)?/, "");
  // Remove path, query string, hash, and port
  domain = domain.split("/")[0].split("?")[0].split("#")[0].split(":")[0];
  
  return domain;
}

function isMatch(host, blockedDomain) {
  if (!host || !blockedDomain) return false;
  const cleanHost = cleanDomain(host);
  const cleanBlocked = cleanDomain(blockedDomain);

  return (
    cleanHost === cleanBlocked ||
    cleanHost.endsWith("." + cleanBlocked) ||
    cleanBlocked.endsWith("." + cleanHost)
  );
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
  const currentDomainEl = document.getElementById("currentDomain");
  const statusBadge = document.getElementById("statusBadge");
  const toggleCurrentBtn = document.getElementById("toggleCurrentBtn");
  const siteListEl = document.getElementById("siteList");
  const siteCountEl = document.getElementById("siteCount");

  // Render current tab status
  if (currentDomain) {
    currentDomainEl.textContent = currentDomain;
    const isCurrentBlocked = blockedSites.some((site) => isMatch(currentDomain, site));

    if (isCurrentBlocked) {
      statusBadge.className = "status-badge blocked";
      statusBadge.textContent = "🚫 Blocked";
      toggleCurrentBtn.className = "btn btn-secondary";
      toggleCurrentBtn.textContent = "✅ Unblock Current Site";
      toggleCurrentBtn.disabled = false;
    } else {
      statusBadge.className = "status-badge allowed";
      statusBadge.textContent = "✅ Allowed";
      toggleCurrentBtn.className = "btn btn-danger";
      toggleCurrentBtn.textContent = "🚫 Block Current Site";
      toggleCurrentBtn.disabled = false;
    }
  } else {
    currentDomainEl.textContent = "Internal / Blank Page";
    statusBadge.className = "status-badge allowed";
    statusBadge.textContent = "N/A";
    toggleCurrentBtn.textContent = "🚫 Block Current Site";
    toggleCurrentBtn.disabled = true;
  }

  // Render site count
  siteCountEl.textContent = blockedSites.length;

  // Render site list
  if (blockedSites.length === 0) {
    siteListEl.innerHTML = `
      <div class="empty-state">
        <span>🛡️</span>
        No sites blocked yet.<br/>Add a site above to block copy-paste on it.
      </div>
    `;
    return;
  }

  siteListEl.innerHTML = "";
  blockedSites.forEach((site) => {
    const item = document.createElement("div");
    item.className = "site-item";

    const domainSpan = document.createElement("span");
    domainSpan.textContent = site;

    const delBtn = document.createElement("button");
    delBtn.className = "delete-btn";
    delBtn.title = "Remove site";
    delBtn.innerHTML = "✕";
    delBtn.addEventListener("click", () => removeSite(site));

    item.appendChild(domainSpan);
    item.appendChild(delBtn);
    siteListEl.appendChild(item);
  });
}

function setupEventListeners() {
  const toggleCurrentBtn = document.getElementById("toggleCurrentBtn");
  const addSiteBtn = document.getElementById("addSiteBtn");
  const siteInput = document.getElementById("siteInput");

  toggleCurrentBtn.addEventListener("click", async () => {
    if (!currentDomain) return;
    const existingIndex = blockedSites.findIndex((site) => isMatch(currentDomain, site));

    if (existingIndex !== -1) {
      // Remove
      const removedSite = blockedSites[existingIndex];
      blockedSites.splice(existingIndex, 1);
      await saveBlockedSites(blockedSites);
      showToast(`Removed ${removedSite} from blocklist`, "success");
    } else {
      // Add
      blockedSites.unshift(currentDomain);
      await saveBlockedSites(blockedSites);
      showToast(`Blocked copy-paste on ${currentDomain}`, "success");
    }

    renderUI();
  });

  addSiteBtn.addEventListener("click", () => handleAddCustomSite());

  siteInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      handleAddCustomSite();
    }
  });
}

async function handleAddCustomSite() {
  const siteInput = document.getElementById("siteInput");
  const cleaned = cleanDomain(siteInput.value);

  if (!cleaned) {
    showToast("Please enter a valid domain name", "error");
    return;
  }

  if (blockedSites.includes(cleaned)) {
    showToast(`${cleaned} is already in the blocklist`, "error");
    return;
  }

  blockedSites.unshift(cleaned);
  await saveBlockedSites(blockedSites);
  siteInput.value = "";
  showToast(`Added ${cleaned} to blocklist`, "success");
  renderUI();
}

async function removeSite(siteToRemove) {
  blockedSites = blockedSites.filter((site) => site !== siteToRemove);
  await saveBlockedSites(blockedSites);
  showToast(`Removed ${siteToRemove}`, "success");
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