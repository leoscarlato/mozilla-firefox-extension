// content_script.js

(function () {
  function pageScript() {
    (function () {
      const originalAlert = window.alert;

      Object.defineProperty(window, "alert", {
        configurable: true,
        enumerable: true,
        get() {
          return originalAlert;
        },
        set(newValue) {
          if (newValue !== originalAlert) {
            window.postMessage({ type: "hijackingDetected" }, "*");
          }
          Object.defineProperty(window, "alert", {
            value: newValue,
            writable: true,
            configurable: true,
            enumerable: true,
          });
        },
      });
    })();
  }

  const script = document.createElement("script");
  script.textContent = "(" + pageScript.toString() + ")();";
  document.documentElement.appendChild(script);
  script.parentNode.removeChild(script);

  window.addEventListener("message", function (event) {
    if (event.source !== window) return;
    if (event.data && event.data.type === "hijackingDetected") {
      console.log("Hijacking detectado no window.alert");
      browser.runtime.sendMessage({ hijackingDetected: true });
    }
  });

  function canvasScript() {
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function (...args) {
      window.postMessage({ type: "canvasFingerprintDetected" }, "*");
      return originalToDataURL.apply(this, args);
    };

    const originalGetImageData =
      CanvasRenderingContext2D.prototype.getImageData;
    CanvasRenderingContext2D.prototype.getImageData = function (...args) {
      window.postMessage({ type: "canvasFingerprintDetected" }, "*");
      return originalGetImageData.apply(this, args);
    };
  }

  const canvasScriptElement = document.createElement("script");
  canvasScriptElement.textContent = "(" + canvasScript.toString() + ")();";
  document.documentElement.appendChild(canvasScriptElement);
  canvasScriptElement.parentNode.removeChild(canvasScriptElement);

  window.addEventListener("message", function (event) {
    if (event.source !== window) return;
    if (event.data && event.data.type === "canvasFingerprintDetected") {
      console.log("Canvas fingerprinting detectado");
      browser.runtime.sendMessage({ canvasFingerprintDetected: true });
    }
  });

  let localStorageUsage = [];

  try {
    function localStorageScript() {
      window.postMessage(
        {
          type: "localStorageKeys",
          keys: Object.keys(localStorage),
        },
        "*"
      );
    }

    const localStorageScriptElement = document.createElement("script");
    localStorageScriptElement.textContent =
      "(" + localStorageScript.toString() + ")();";
    document.documentElement.appendChild(localStorageScriptElement);
    localStorageScriptElement.parentNode.removeChild(localStorageScriptElement);

    window.addEventListener("message", function (event) {
      if (event.source !== window) return;
      if (event.data && event.data.type === "localStorageKeys") {
        localStorageUsage = event.data.keys;
        console.log("Chaves do Local Storage:", localStorageUsage);
        browser.runtime.sendMessage({ localStorageUsage });
      }
    });
  } catch (e) {
    console.error("Erro ao acessar o localStorage:", e);
  }
})();
