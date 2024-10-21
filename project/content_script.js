(function() {
  const originalAlert = window.alert;
  Object.defineProperty(window, 'alert', {
    get() {
      if (originalAlert !== window.alert) {
        browser.runtime.sendMessage({ hijackingDetected: true });
      }
      return originalAlert.bind(window);
    },
    configurable: true
  });

  const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL = function(...args) {
    browser.runtime.sendMessage({ canvasFingerprintDetected: true });
    return originalToDataURL.apply(this, args);
  };

  const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
  CanvasRenderingContext2D.prototype.getImageData = function(...args) {
    browser.runtime.sendMessage({ canvasFingerprintDetected: true });
    return originalGetImageData.apply(this, args);
  };

  let localStorageUsage = [];

  try {
    localStorageUsage = Object.keys(localStorage);
  } catch (e) {
  }

  browser.runtime.sendMessage({
    localStorageUsage
  });
})();