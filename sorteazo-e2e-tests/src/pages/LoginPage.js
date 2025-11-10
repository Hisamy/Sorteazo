const { By, until } = require('selenium-webdriver');
const { BASE_URL } = require('../utils/config');

class LoginPage {

  constructor(driver) {
    this.driver = driver;
    this.url = `${BASE_URL}`;
    
    // 💡 AÑADIDO: Definición de todos los selectores.
    this.emailField = By.name('email');
    this.passwordField = By.name('password');
    this.loginButton = By.css('button[type="submit"]');
  }

  async open() {
    await this.driver.get(this.url);
  }

  async login(email, password) {
    // 1. Espera a que el campo de email aparezca y sea visible/interactuable
    await this.driver.wait(until.elementLocated(this.emailField), 5000, 'El campo de email no apareció en 5 segundos');
    // Nota: findElement(this.emailField) ya te da el elemento, no necesitas pasarlo como parámetro a findElement
    await this.driver.wait(until.elementIsVisible(this.driver.findElement(this.emailField)), 5000, 'El campo de email no es visible en 5 segundos');

    // 2. Interacción: usa los campos definidos
    await this.driver.findElement(this.emailField).sendKeys(email);
    await this.driver.findElement(this.passwordField).sendKeys(password);
    await this.driver.findElement(this.loginButton).click();
  }

  async waitForAlert(timeout = 5000) {
    // ... (rest of the code is fine)
    try {
      // Espera hasta que aparezca un alert
      await this.driver.wait(until.alertIsPresent(), timeout);

      // Cambia el foco al alert
      const alert = await this.driver.switchTo().alert();

      // Lee el texto del alert (puede variar)
      const text = await alert.getText();
      console.log('🟡 Alert detectado:', text);

      // Cierra el alert (aceptar)
      await alert.accept();

      // Devuelve el texto por si lo necesitas en el test
      return text;
    } catch (err) {
      console.error('⚠️ No apareció ningún alert dentro del tiempo esperado');
      return null;
    }
  }
}

module.exports = { LoginPage };