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
  
    let localStorageUsage = 0;
    let sessionStorageUsage = 0;
  
    try {
      localStorageUsage = Object.keys(localStorage).length;
      sessionStorageUsage = Object.keys(sessionStorage).length;
    } catch (e) {
    }
  
    browser.runtime.sendMessage({
      localStorageUsage,
      sessionStorageUsage
    });
  
    browser.runtime.onMessage.addListener((message) => {
      if (message.privacyData) {
        displayPrivacyData(message.privacyData);
      }
    });
  
    function displayPrivacyData(data) {
        const existingPopup = document.getElementById('privacy-popup');
        if (existingPopup) {
          existingPopup.parentNode.removeChild(existingPopup);
        }
    
        const div = document.createElement('div');
        div.id = 'privacy-popup';
        div.style.position = 'fixed';
        div.style.bottom = '10px';
        div.style.right = '10px';
        div.style.padding = '15px';
        div.style.backgroundColor = 'rgba(0,0,0,0.8)';
        div.style.color = '#fff';
        div.style.zIndex = '9999';
        div.style.fontSize = '14px';
        div.style.borderRadius = '5px';
        div.style.maxWidth = '300px';
        div.style.boxSizing = 'border-box';
    
        const closeButton = document.createElement('span');
        closeButton.textContent = 'x';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '5px';
        closeButton.style.right = '10px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.fontSize = '18px';
        closeButton.style.lineHeight = '18px';
    
        closeButton.addEventListener('click', () => {
          if (div.parentNode) {
            div.parentNode.removeChild(div);
          }
        });
    
        const contentDiv = document.createElement('div');
        contentDiv.style.marginTop = '25px'; 
        contentDiv.innerHTML = `
          <strong>Pontuação de Privacidade: ${data.privacyScore}</strong><br>
          Conexões de Terceiros: ${data.thirdPartyConnections.size}<br>
          Cookies de Terceiros: ${data.cookies.thirdParty}<br>
          Local Storage Items: ${data.localStorageUsage}<br>
          Canvas Fingerprinting Detectado: ${data.canvasFingerprintDetected ? 'Sim' : 'Não'}<br>
          Hijacking Detectado: ${data.hijackingDetected ? 'Sim' : 'Não'}
        `;
    
        div.appendChild(closeButton);
        div.appendChild(contentDiv);
    
        document.body.appendChild(div);
    
        /*
        setTimeout(() => {
          if (div.parentNode) {
            div.parentNode.removeChild(div);
          }
        }, 10000);
        */
      }
    })();
  