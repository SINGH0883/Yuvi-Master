// Yuvi Master - Extension Popup Script

const storageArea = (typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync)
  ? chrome.storage.sync
  : (typeof chrome !== "undefined" && chrome.storage ? chrome.storage.local : null);

let currentDomain = "";
let blockedSites = [];
let blockerEngineMode = "auto"; // 'primary' | 'secondary' | 'auto'

document.addEventListener("DOMContentLoaded", async () => {
  await initPopup();
});

async function initPopup() {
  blockedSites = await getBlockedSites();
  blockerEngineMode = await getBlockerEngineMode();
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

function getBlockerEngineMode() {
  return new Promise((resolve) => {
    if (!storageArea) {
      resolve("auto");
      return;
    }
    storageArea.get({ blockerEngineMode: "auto" }, (items) => {
      resolve(items.blockerEngineMode || "auto");
    });
  });
}

function saveBlockerEngineMode(mode) {
  return new Promise((resolve) => {
    if (!storageArea) {
      resolve();
      return;
    }
    storageArea.set({ blockerEngineMode: mode }, () => {
      resolve();
    });
  });
}

function cleanDomain(urlOrDomain) {
  if (!urlOrDomain) return "";
  let domain = urlOrDomain.trim().toLowerCase();
  
  domain = domain.replace(/^(https?:\/\/)?(www\.)?/, "");
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
  const engineBadge = document.getElementById("engineBadge");

  const enginePrimaryBtn = document.getElementById("enginePrimaryBtn");
  const engineSecondaryBtn = document.getElementById("engineSecondaryBtn");
  const engineAutoBtn = document.getElementById("engineAutoBtn");

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

  // Render engine mode controls
  enginePrimaryBtn.classList.remove("active");
  engineSecondaryBtn.classList.remove("active");
  engineAutoBtn.classList.remove("active");

  if (blockerEngineMode === "primary") {
    enginePrimaryBtn.classList.add("active");
    engineBadge.textContent = "Primary";
    engineBadge.style.cssText = "background:#fef3c7;color:#92400e;border:1px solid #fde68a;";
  } else if (blockerEngineMode === "secondary") {
    engineSecondaryBtn.classList.add("active");
    engineBadge.textContent = "Secondary (Backup)";
    engineBadge.style.cssText = "background:#fee2e2;color:#991b1b;border:1px solid #fecaca;";
  } else {
    engineAutoBtn.classList.add("active");
    engineBadge.textContent = "Auto Dual";
    engineBadge.style.cssText = "background:#e0f2fe;color:#0369a1;border:1px solid #bae6fd;";
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

  const enginePrimaryBtn = document.getElementById("enginePrimaryBtn");
  const engineSecondaryBtn = document.getElementById("engineSecondaryBtn");
  const engineAutoBtn = document.getElementById("engineAutoBtn");

  toggleCurrentBtn.addEventListener("click", async () => {
    if (!currentDomain) return;
    const existingIndex = blockedSites.findIndex((site) => isMatch(currentDomain, site));

    if (existingIndex !== -1) {
      const removedSite = blockedSites[existingIndex];
      blockedSites.splice(existingIndex, 1);
      await saveBlockedSites(blockedSites);
      showToast(`Removed ${removedSite} from blocklist`, "success");
    } else {
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

  enginePrimaryBtn.addEventListener("click", async () => {
    blockerEngineMode = "primary";
    await saveBlockerEngineMode("primary");
    showToast("Engine: Primary Mode (Event Interception)", "success");
    renderUI();
  });

  engineSecondaryBtn.addEventListener("click", async () => {
    blockerEngineMode = "secondary";
    await saveBlockerEngineMode("secondary");
    showToast("Engine: Secondary Mode (Aggressive Backup)", "success");
    renderUI();
  });

  engineAutoBtn.addEventListener("click", async () => {
    blockerEngineMode = "auto";
    await saveBlockerEngineMode("auto");
    showToast("Engine: Auto Dual Mode (Primary + Fallback)", "success");
    renderUI();
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