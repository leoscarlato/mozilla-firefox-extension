function listenForClicks() {
  document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("beast")) {
      return;
    }

    var chosenBeast = e.target.textContent;

    function beastify(tabs) {
      console.log("Tentando injetar beastify.js na aba:", tabs[0].id);
      browser.tabs
        .executeScript(tabs[0].id, {
          file: "content-scripts/beastify.js",
        })
        .then(() => {
          setTimeout(() => {  // Adiciona um delay antes de enviar a mensagem
            console.log("Enviando mensagem para beastify.js.");
            browser.tabs.sendMessage(tabs[0].id, { beast: chosenBeast });
          }, 1000); // Delay de 1000 milissegundos (1 segundo)
        })
        .catch((error) => {
          console.error("Falha ao injetar beastify.js:", error);
        });
    }
    

    browser.tabs
      .query({ active: true, currentWindow: true })
      .then(beastify)
      .catch(reportError);
  });
}

function reportError(error) {
  console.error(`Erro ao executar o script Beastify: ${error.message}`);
}

listenForClicks();
