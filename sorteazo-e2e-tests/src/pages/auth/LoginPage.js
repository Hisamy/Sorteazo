const { By, until } = require('selenium-webdriver');
const { BASE_URL } = require('../../utils/config');

class LoginPage {

  constructor(driver) {
    this.driver = driver;
    this.url = `${BASE_URL}`;
    
    this.emailField = By.name('email');
    this.passwordField = By.name('password');
    this.loginButton = By.css('button[type="submit"]');
    this.passwordToggleButton = By.css('div.relative button[type="button"]');
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
      //console.log('Alert detectado:', text);

      // Cierra el alert (aceptar)
      await alert.accept();

      // Devuelve el texto por si lo necesitas en el test
      return text;
    } catch (err) {
      //console.error('[!] No apareció ningún alert dentro del tiempo esperado');
      return null;
    }
  }

  async getEmailValidationErrorText(timeout = 5000) {
    try {
      const errorElement = await this.driver.wait(
        until.elementLocated(this.emailErrorField),
        timeout,
        'El mensaje de error de email no apareció.'
      );
      
      // Espera a que sea visible
      await this.driver.wait(until.elementIsVisible(errorElement), timeout / 2);

      // Devuelve el texto del error
      return await errorElement.getText();
      
    } catch (err) {
      return null;
    }
  }

  async clickPasswordToggle() {
    await this.driver.wait(until.elementLocated(this.passwordToggleButton), 5000, 'El botón de toggle de contraseña no apareció.');
    await this.driver.findElement(this.passwordToggleButton).click();
  }

  async getPasswordInputType() {
    const passwordInput = await this.driver.findElement(this.passwordField);
    return await passwordInput.getAttribute('type');
  }

  /**
   * Obtiene el mensaje de validación HTML5 de un campo.
   * Esto funciona para inputs con required, type="email", etc.
   */
  async getNativeValidationError(locator) {
    const element = await this.driver.findElement(locator);
    const validationMessage = await this.driver.executeScript(
      // El script usa el API de validación nativa del elemento DOM
      'return arguments[0].validationMessage;',
      element // Pasa el elemento de Selenium como argumento[0]
    );
    
    return validationMessage;
  }

  /**
   * Intercepta la funcion nativa de XMLHttpRequest del navegador para hacer que las peticiones
   * se pierdan y cause un error con el servidor (500). Simulando un fallo de conexion.
   */
  async setupConnectionRefusedMock() {
    await this.driver.executeScript(`
      if (window.XMLHttpRequest) {
          // Guardamos la función original (no crítico para este caso, pero buena práctica)
          const originalXHRSend = XMLHttpRequest.prototype.send;
          
          XMLHttpRequest.prototype.send = function() {
              // 1. Opcional: Ejecuta el handler de error si existe
              if (this.onerror) {
                  const fakeErrorEvent = new Event('error');
                  this.onerror(fakeErrorEvent);
              }

              // 2. Simular un estado de conexión fallida para el frontend.
              // El error de red puro a menudo ocurre antes de que la petición se envíe realmente.
              // Ponemos el readyState en 4 (DONE) y status 0 para simular "No se pudo conectar".
              Object.defineProperty(this, 'readyState', { value: 4 });
              Object.defineProperty(this, 'status', { value: 0 });

              // 3. Simular que la petición terminó con error (llamando a onLoadEnd o onError)
              if (this.onloadend) {
                  this.onloadend(); 
              }
              
              console.log('Interceptado XHR. Forzando fallo de conexión.');
              // No llamamos a originalXHRSend.apply(this, arguments);
              // para evitar que la petición real salga.
          };
          
          console.log('✅ Función XMLHttpRequest.send SOBRESCRITA para fallar.');
      } else {
          console.warn('XMLHttpRequest no disponible globalmente, el mock falló.');
      }
    `);
  }
}

module.exports = { LoginPage };