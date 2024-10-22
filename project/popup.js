document.addEventListener("DOMContentLoaded", () => {
  browser.runtime
    .getBackgroundPage()
    .then((backgroundPage) => {
      if (!backgroundPage.privacyData) {
        console.error("privacyData is not defined in the background page.");
        return;
      }

      const currentTabId = backgroundPage.currentTabId;

      browser.storage.local
        .get(currentTabId.toString())
        .then((result) => {
          const privacyData = result[currentTabId];
          console.log("Privacy Data:", privacyData);

          if (privacyData) {
            const privacyScore = privacyData.privacyScore.toFixed(1);
            const privacyScoreBar =
              document.getElementById("privacy-score-bar");
            const privacyScoreText = document.getElementById("privacy-score");

            privacyScoreText.textContent = privacyScore;
            privacyScoreBar.style.width = `${privacyScore * 10}%`;

            privacyScoreBar.classList.remove("green", "orange", "red");
            privacyScoreText.classList.remove("green", "orange", "red");

            if (privacyScore >= 7) {
              privacyScoreBar.classList.add("green");
              privacyScoreText.classList.add("green");
            } else if (privacyScore >= 4) {
              privacyScoreBar.classList.add("orange");
              privacyScoreText.classList.add("orange");
            } else {
              privacyScoreBar.classList.add("red");
              privacyScoreText.classList.add("red");
            }

            document.getElementById("third-party-count").textContent =
              privacyData.thirdPartyConnections.size;

            document.getElementById("third-party-cookies-count").textContent =
              privacyData.cookies.thirdParty;
            document.getElementById(
              "third-party-session-cookies-count"
            ).textContent = privacyData.cookies.sessionCookies.thirdParty;
            document.getElementById(
              "third-party-persistent-cookies-count"
            ).textContent = privacyData.cookies.persistentCookies.thirdParty;

            document.getElementById("first-party-cookies-count").textContent =
              privacyData.cookies.firstParty;
            document.getElementById(
              "first-party-session-cookies-count"
            ).textContent = privacyData.cookies.sessionCookies.firstParty;
            document.getElementById(
              "first-party-persistent-cookies-count"
            ).textContent = privacyData.cookies.persistentCookies.firstParty;

            document.getElementById("local-storage-count").textContent =
              privacyData.localStorageUsage.length;
            document.getElementById(
              "canvas-fingerprinting-detected"
            ).textContent = privacyData.canvasFingerprintDetected
              ? "Sim"
              : "Não";
            document.getElementById("hijacking-detected").textContent =
              privacyData.hijackingDetected ? "Sim" : "Não";

            const thirdPartyList = document.getElementById("third-party-list");
            privacyData.thirdPartyConnections.forEach((connection) => {
              const li = document.createElement("li");
              li.textContent = connection;
              thirdPartyList.appendChild(li);
            });

            const localStorageList =
              document.getElementById("local-storage-list");
            privacyData.localStorageUsage.forEach((item) => {
              const li = document.createElement("li");
              li.textContent = item;
              localStorageList.appendChild(li);
            });

            document.querySelectorAll(".category-header").forEach((header) => {
              header.addEventListener("click", () => {
                const list = header.nextElementSibling;
                const arrow = header.querySelector(".dropdown-arrow");
                if (list) {
                  list.classList.toggle("hidden");
                  arrow.classList.toggle("expanded");
                }
              });
            });
          } else {
            console.error("No privacy data found for the current tab.");
          }
        })
        .catch((error) => {
          console.error("Error accessing storage:", error);
        });
    })
    .catch((error) => {
      console.error("Error accessing background page:", error);
    });
});
