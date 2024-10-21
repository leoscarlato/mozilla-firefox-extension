document.addEventListener('DOMContentLoaded', () => {
  browser.runtime.getBackgroundPage().then((backgroundPage) => {
    if (!backgroundPage.privacyData) {
      console.error('privacyData is not defined in the background page.');
      return;
    }

    const privacyData = backgroundPage.privacyData[backgroundPage.currentTabId];
    console.log('Privacy Data:', privacyData);

    if (privacyData) {
      document.getElementById('privacy-score').textContent = privacyData.privacyScore.toFixed(1);
      document.getElementById('third-party-count').textContent = privacyData.thirdPartyConnections.size;
      document.getElementById('third-party-cookies-count').textContent = privacyData.cookies.thirdParty;
      document.getElementById('local-storage-count').textContent = privacyData.localStorageUsage.length;
      document.getElementById('canvas-fingerprinting-detected').textContent = privacyData.canvasFingerprintDetected ? 'Sim' : 'Não';
      document.getElementById('hijacking-detected').textContent = privacyData.hijackingDetected ? 'Sim' : 'Não';

      const thirdPartyList = document.getElementById('third-party-list');
      privacyData.thirdPartyConnections.forEach(connection => {
        const li = document.createElement('li');
        li.textContent = connection;
        thirdPartyList.appendChild(li);
      });

      const localStorageList = document.getElementById('local-storage-list');
      privacyData.localStorageUsage.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        localStorageList.appendChild(li);
      });

      document.querySelectorAll('.category-header').forEach(header => {
        header.addEventListener('click', () => {
          const list = header.nextElementSibling;
          const arrow = header.querySelector('.dropdown-arrow');
          if (list) {
            list.classList.toggle('hidden');
            arrow.classList.toggle('expanded');
          }
        });
      });
    } else {
      console.error('No privacy data found for the current tab.');
    }
  }).catch(error => {
    console.error('Error accessing background page:', error);
  });
});