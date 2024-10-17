function listenForClicks() {
  document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("beast")) {
      return;
    }

    var chosenBeast = e.target.textContent;

    function beastify(tabs) {
      browser.tabs.executeScript(tabs[0].id, {
        file: "/content_scripts/beastify.js",
      }).then(() => {
        browser.tabs.sendMessage(tabs[0].id, { beast: chosenBeast });
      }).catch(reportError);
    }

    browser.tabs.query({ active: true, currentWindow: true })
      .then(beastify)
      .catch(reportError);
  });
}

function reportError(error) {
  console.error(`Erro ao executar o script Beastify: ${error.message}`);
}

listenForClicks();
