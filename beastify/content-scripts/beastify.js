// Assign beastify() as a listener for messages from the extension.
console.log("beastify.js foi injetado e está pronto para receber mensagens.");

browser.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log("Mensagem recebida:", request);
  removeEverything();
  insertBeast(beastNameToURL(request.beast));
});


function removeEverything() {
  while (document.body.firstChild) {
    document.body.firstChild.remove();
  }
}

function insertBeast(beastURL) {
  var beastImage = document.createElement("img");
  beastImage.setAttribute("src", beastURL);
  beastImage.setAttribute("style", "width: 100vw");
  beastImage.setAttribute("style", "height: 100vh");
  document.body.appendChild(beastImage);
}

function beastNameToURL(beastName) {
  switch (beastName) {
    case "Frog":
      return browser.runtime.getURL("beasts/frog.jpg");
    case "Snake":
      return browser.runtime.getURL("beasts/snake.jpg");
    case "Turtle":
      return browser.runtime.getURL("beasts/turtle.jpg");
  }
}
