
const { By, until } = require('selenium-webdriver');
const { BASE_URL } = require('../../utils/config');
const fs = require("fs");
const path = require("path");
class ApartarNumeroPage {

  constructor(driver, sorteoId) {
    this.driver = driver;

    
    
    this.url = `${BASE_URL}/sorteos/cliente/${sorteoId}`;
    this.boletoButton = (numero) => By.css(`div[data-numero="${numero}"]`);
    this.accordionToggleButtons = By.css('button[data-testid="accordion-toggle"]');
    this.floatingBarButton = By.css('button[data-testid="confirmar-apartado"]');
    this.confirmModalButton = By.css('button[data-testid="confirmar-modal"]');
  }

  async open() {
    await this.driver.get(this.url);
  }

  async clickBoleto(numero) {
    const locator = this.boletoButton(numero);

    try {
      await this.driver.wait(
        until.elementLocated(locator),
        5000
      );
    } catch (err) {
      
      try {
        const toggles = await this.driver.findElements(this.accordionToggleButtons);
        for (const t of toggles) {
          try {
            await this.driver.wait(until.elementIsVisible(t), 1000);
            await t.click();
          } catch (e) {
            
          }
        }
      } catch (e) {
       
      }

      try {
        await this.driver.wait(
          until.elementLocated(locator),
          10000,
          ` No apareció el boleto ${numero}`
        );
      } catch (finalErr) {
        // Volcar HTML para diagnóstico
        try {
          const src = await this.driver.getPageSource();
          const dumpDir = path.resolve(__dirname, '../../tmp');
          fs.mkdirSync(dumpDir, { recursive: true });
          const filePath = path.join(dumpDir, `page_dump_${numero}.html`);
          fs.writeFileSync(filePath, src, 'utf8');
          console.log(`[DEBUG] Page dump saved to: ${filePath}`);
        } catch (dumpErr) {
          console.warn('[DEBUG] Failed to write page dump:', dumpErr.message || dumpErr);
        }
        throw finalErr;
      }
    }

    const el = await this.driver.findElement(locator);

    await this.driver.wait(
      until.elementIsVisible(el),
      4000,
      `Boleto ${numero} no visible`
    );

    await el.click();
  }

  
  async clickFloatingBar() {
    await this.driver.wait(
      until.elementLocated(this.floatingBarButton),
      6000,
      ' No apareció la barra flotante'
    );

    const btn = await this.driver.findElement(this.floatingBarButton);
    await this.driver.wait(until.elementIsVisible(btn), 3000);
    await btn.click();
  }

  
  async confirmarModal() {
    await this.driver.wait(
      until.elementLocated(this.confirmModalButton),
      5000,
      'No apareció el botón de confirmar en el modal'
    );

    const btn = await this.driver.findElement(this.confirmModalButton);
    await this.driver.wait(until.elementIsVisible(btn), 3000);
    await btn.click();
  }

 
  async waitForAlert(timeout = 5000) {
    try {
      await this.driver.wait(until.alertIsPresent(), timeout);

      const alert = await this.driver.switchTo().alert();
      const text = await alert.getText();
      await alert.accept();

      return text;
    } catch (err) {
      return null;
    }
  }

  
  async simulateNetworkFailure() {
    await this.driver.executeScript(() => {
      window.__originalFetch = window.fetch;

      window.fetch = () => Promise.reject(new Error('Network Down'));

      if (window.XMLHttpRequest) {
        XMLHttpRequest.prototype.send = function () {
          if (this.onerror) this.onerror(new Event('error'));
          if (this.onloadend) this.onloadend();
        };
      }
      console.log(" Modo sin conexión ACTIVADO");
    });
  }

  async restoreNetwork() {
    await this.driver.executeScript(() => {
      if (window.__originalFetch) {
        window.fetch = window.__originalFetch;
      }
      console.log("Conexión restaurada");
    });
  }

  async triggerOnlineEvent() {
    await this.driver.executeScript(() => {
      window.dispatchEvent(new Event("online"));
      console.log(" EVENTO ONLINE DISPARENADO");
    });
  }
}

module.exports = { ApartarNumeroPage };
