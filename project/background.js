let privacyData = {};

browser.webRequest.onBeforeRequest.addListener(
  (details) => {
    let tabId = details.tabId;
    if (tabId === -1) return;

    let initiator = new URL(details.originUrl || details.initiator || 'about:blank').hostname;
    let requestHost = new URL(details.url).hostname;

    if (initiator !== requestHost) {
      if (!privacyData[tabId]) {
        privacyData[tabId] = {
          thirdPartyConnections: new Set(),
          hijackingDetected: false,
          canvasFingerprintDetected: false,
          localStorageUsage: 0,
          sessionStorageUsage: 0,
          cookies: {
            firstParty: 0,
            thirdParty: 0,
            sessionCookies: 0,
            persistentCookies: 0
          },
          privacyScore: 100
        };
      }
      privacyData[tabId].thirdPartyConnections.add(requestHost);
    }
  },
  { urls: ["<all_urls>"] },
  []
);

browser.runtime.onMessage.addListener((message, sender) => {
  let tabId = sender.tab.id;

  if (!privacyData[tabId]) {
    privacyData[tabId] = {
      thirdPartyConnections: new Set(),
      hijackingDetected: false,
      canvasFingerprintDetected: false,
      localStorageUsage: 0,
      sessionStorageUsage: 0,
      cookies: {
        firstParty: 0,
        thirdParty: 0,
        sessionCookies: 0,
        persistentCookies: 0
      },
      privacyScore: 100
    };
  }

  if (message.hijackingDetected) {
    privacyData[tabId].hijackingDetected = true;
    updatePrivacyScore(tabId, 20);
  }

  if (message.canvasFingerprintDetected) {
    privacyData[tabId].canvasFingerprintDetected = true;
    updatePrivacyScore(tabId, 15);
  }

  if (message.localStorageUsage !== undefined) {
    privacyData[tabId].localStorageUsage = message.localStorageUsage;
    updatePrivacyScore(tabId, message.localStorageUsage * 1);
  }

  if (message.sessionStorageUsage !== undefined) {
    privacyData[tabId].sessionStorageUsage = message.sessionStorageUsage;
  }
});

function updatePrivacyScore(tabId, deduction) {
  if (!privacyData[tabId]) return;
  privacyData[tabId].privacyScore -= deduction;
  if (privacyData[tabId].privacyScore < 0) {
    privacyData[tabId].privacyScore = 0;
  }
}

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    if (!privacyData[tabId]) return;

    browser.cookies.getAll({ url: tab.url }).then((cookies) => {
      let firstParty = 0;
      let thirdParty = 0;
      let sessionCookies = 0;
      let persistentCookies = 0;

      let tabUrl = new URL(tab.url);
      let tabDomain = tabUrl.hostname;

      cookies.forEach((cookie) => {
        if (cookie.domain.includes(tabDomain)) {
          firstParty++;
        } else {
          thirdParty++;
        }

        if (!cookie.expirationDate) {
          sessionCookies++;
        } else {
          persistentCookies++;
        }
      });

      privacyData[tabId].cookies = {
        firstParty,
        thirdParty,
        sessionCookies,
        persistentCookies
      };

      updatePrivacyScore(tabId, thirdParty * 2);

      browser.tabs.sendMessage(tabId, {
        privacyData: privacyData[tabId]
      });
    });
  }
});

browser.tabs.onRemoved.addListener((tabId) => {
  delete privacyData[tabId];
});

browser.browserAction.onClicked.addListener((tab) => {
    let tabId = tab.id;
  
    if (privacyData[tabId]) {
      browser.tabs.sendMessage(tabId, {
        showPrivacyData: true,
        privacyData: privacyData[tabId]
      });
    } else {
      browser.tabs.sendMessage(tabId, {
        showPrivacyData: true,
        privacyData: null
      });
    }
  });
