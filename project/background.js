let privacyData = {};
let currentTabId = null;

function ensurePrivacyData(tabId) {
  if (!privacyData[tabId]) {
    privacyData[tabId] = {
      thirdPartyConnections: new Set(),
      hijackingDetected: false,
      canvasFingerprintDetected: false,
      localStorageUsage: [],
      cookies: {
        firstParty: 0,
        thirdParty: 0,
        sessionCookies: { firstParty: 0, thirdParty: 0 },
        persistentCookies: { firstParty: 0, thirdParty: 0 },
      },
      privacyScore: 10,
    };
  }
}

browser.webRequest.onBeforeRequest.addListener(
  (details) => {
    let tabId = details.tabId;
    if (tabId === -1) return;

    let initiator = new URL(details.originUrl || details.initiator || "")
      .hostname;
    let requestHost = new URL(details.url).hostname;

    if (initiator && initiator !== requestHost) {
      ensurePrivacyData(tabId);
      privacyData[tabId].thirdPartyConnections.add(requestHost);
      savePrivacyData(tabId);
    }
  },
  { urls: ["<all_urls>"] },
  []
);

browser.runtime.onMessage.addListener((message, sender) => {
  let tabId = sender.tab.id;
  console.log("Mensagem recebida do content script:", message);

  ensurePrivacyData(tabId);

  if (message.hijackingDetected) {
    privacyData[tabId].hijackingDetected = true;
    updatePrivacyScore(tabId, 2);
  }

  if (message.canvasFingerprintDetected) {
    privacyData[tabId].canvasFingerprintDetected = true;
    updatePrivacyScore(tabId, 1.5);
  }

  if (message.localStorageUsage !== undefined) {
    privacyData[tabId].localStorageUsage = message.localStorageUsage;
    updatePrivacyScore(tabId, message.localStorageUsage.length * 0.1);
  }

  savePrivacyData(tabId);
});

function updatePrivacyScore(tabId, deduction) {
  if (!privacyData[tabId]) return;
  privacyData[tabId].privacyScore -= deduction;
  if (privacyData[tabId].privacyScore < 0) {
    privacyData[tabId].privacyScore = 0;
  }
  privacyData[tabId].privacyScore = parseFloat(
    privacyData[tabId].privacyScore.toFixed(1)
  );
  savePrivacyData(tabId);
}

function savePrivacyData(tabId) {
  browser.storage.local.set({ [tabId]: privacyData[tabId] });
}

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    ensurePrivacyData(tabId);

    browser.cookies.getAll({ url: tab.url }).then((cookies) => {
      let firstParty = 0;
      let thirdParty = 0;
      let sessionCookies = { firstParty: 0, thirdParty: 0 };
      let persistentCookies = { firstParty: 0, thirdParty: 0 };

      let tabUrl = new URL(tab.url);
      let tabDomain = tabUrl.hostname;

      cookies.forEach((cookie) => {
        if (cookie.domain.includes(tabDomain)) {
          firstParty++;
          if (!cookie.expirationDate) {
            sessionCookies.firstParty++;
          } else {
            persistentCookies.firstParty++;
          }
        } else {
          thirdParty++;
          if (!cookie.expirationDate) {
            sessionCookies.thirdParty++;
          } else {
            persistentCookies.thirdParty++;
          }
        }
      });

      privacyData[tabId].cookies = {
        firstParty,
        thirdParty,
        sessionCookies,
        persistentCookies,
      };

      updatePrivacyScore(tabId, 0.1);
      savePrivacyData(tabId);
    });
  }
});

browser.tabs.onRemoved.addListener((tabId) => {
  delete privacyData[tabId];
  browser.storage.local.remove(tabId.toString());
});
