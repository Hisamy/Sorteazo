const { By, until } = require('selenium-webdriver');
const { BASE_URL } = require('../../utils/config');

class SignUpPage {

  constructor(driver) {
    this.driver = driver;
    this.url = `${BASE_URL}/CrearCuenta`;
    
    this.nameField = By.name('name');
    this.lastNameField = By.name('lastName');
    this.emailField = By.name('email');
    this.phoneNumberField = By.name('phone');
    this.addressField = By.name('address');
    this.zipCodeField = By.name('zipCode');
    this.passwordField = By.name('password');
    this.confirmPasswordField = By.name('confirmarPassword');
    this.termsAndConditionsCheckBox = By.name('terminosCondiciones');
    this.registerButton = By.css('button[type="submit"]');
    this.passwordToggleButton = By.xpath(`//input[@name='password']/following-sibling::button[@type='button']`);
    this.confirmPasswordToggleButton = By.xpath(`//input[@name='confirmarPassword']/following-sibling::button[@type='button']`);
  }

  async open() {
    await this.driver.get(this.url);
  }

  /**
   * Llena los campos de información básica de un usuario.
   * @param {*} name Nombre(s) del usuario a registrar.
   * @param {*} lastName Apellido(s) del usuario a registrar.
   * @param {*} email Correo electrónico del usuario a registrar.
   * @param {*} phoneNumber Número de teléfono del usuario a registrar.
   * @param {*} address Dirección del domicilio del usuario a registrar.
   * @param {*} zipCode Código postal del usuario a registrar.
   */
  async fillBasicUserData(name, lastName, email, phoneNumber, address, zipCode) {

    // espera a que los elementos estén listos para acceder a ellos.
    await this.driver.wait(until.elementLocated(this.nameField), 5000, 'El campo de "nombre" no apareció en 5 segundos');
    await this.driver.wait(until.elementLocated(this.lastNameField), 5000, 'El campo de "apellido" no apareció en 5 segundos');
    await this.driver.wait(until.elementLocated(this.emailField), 5000, 'El campo de "email" no apareció en 5 segundos');
    await this.driver.wait(until.elementLocated(this.phoneNumberField), 5000, 'El campo de "teléfono" no apareció en 5 segundos');
    await this.driver.wait(until.elementLocated(this.addressField), 5000, 'El campo de "dirección" no apareció en 5 segundos');
    await this.driver.wait(until.elementLocated(this.zipCodeField), 5000, 'El campo de "código postal" no apareció en 5 segundos');

    // empieza a llenar los campos con los datos especificados.
    await this.driver.findElement(this.nameField).sendKeys(name);
    await this.driver.findElement(this.lastNameField).sendKeys(lastName);
    await this.driver.findElement(this.emailField).sendKeys(email);
    await this.driver.findElement(this.phoneNumberField).sendKeys(phoneNumber);
    await this.driver.findElement(this.addressField).sendKeys(address);
    await this.driver.findElement(this.zipCodeField).sendKeys(zipCode);
  }

  /**
   * LLena los campos del formulario relacionados con la contraseña.
   * @param {*} password Contraseña del usuario a registrar.
   * @param {*} confirmPassword Confirmación de contraseña del usuario a registrar.
   */
  async fillPasswordInputs(password, confirmPassword) {

    // espera a que los elementos estén listos para acceder a ellos.
    await this.driver.wait(until.elementLocated(this.passwordField), 5000, 'El campo de "contraseña" no apareció en 5 segundos');
    await this.driver.wait(until.elementLocated(this.confirmPasswordField), 5000, 'El campo de "confirmar contraseña" no apareció en 5 segundos');
    await this.driver.wait(until.elementLocated(this.termsAndConditionsCheckBox), 5000, 'El campo de "contraseña" no apareció en 5 segundos');

    // empieza a llenar los campos con los datos especificados.
    await this.driver.findElement(this.passwordField).sendKeys(password);
    await this.driver.findElement(this.confirmPasswordField).sendKeys(confirmPassword);
  }

  /**
   * Da el paso final para registrar el usuario en el sistema, terminando el llenado
   * del formulario.
   */
  async registerUserButtonClick() {
    await this.driver.findElement(this.termsAndConditionsCheckBox).click();
    await this.driver.findElement(this.registerButton).click();
  }

  /**
   * Espera a se muestre la alerta cuando ocurre un error del servidor, captura de datos o conexion, asi como tambien el 
   * informe de una operacion exitosa.
   * @param {integer} timeout Tiempo en milisegundos los cuales se espera la aparicion de la alerta.
   * @returns {string} Texto que mando la alerta.
   */
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

  async clickPasswordToggle() {
    await this.driver.wait(until.elementLocated(this.passwordToggleButton), 5000, 'El botón de toggle de contraseña no apareció.');
    await this.driver.findElement(this.passwordToggleButton).click();
  }

  async getPasswordInputType() {
    const passwordInput = await this.driver.findElement(this.passwordField);
    return await passwordInput.getAttribute('type');
  }

  async clickConfirmPasswordToggle() {
    await this.driver.wait(until.elementLocated(this.confirmPasswordToggleButton), 5000, 'El botón de toggle de confirmar contraseña no apareció.');
    await this.driver.findElement(this.confirmPasswordToggleButton).click();
  }

  async getConfirmPasswordInputType() {
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
   * Captura el mensaje que muestra el campo de email cuando no se cumple el formato del mismo justo
   * despues de querer completar el formulario presionando el boton 'Registrar Usuario'.
   * @param {integer} timeout Tiempo en milisegundos los cuales se espera la aparicion de la alerta.
   * @returns {string} Texto que mando la alerta.
   */
  async getEmailValidationErrorText(timeout = 5000) {
    try {
      const errorElement = await this.driver.wait(
        until.elementLocated(this.emailErrorField),
        timeout,
        'El mensaje de error de email no apareció.'
      );
      
      await this.driver.wait(until.elementIsVisible(errorElement), timeout / 2);

      return await errorElement.getText();
      
    } catch (err) {
      return null;
    }
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
          
          console.log('Función XMLHttpRequest.send SOBRESCRITA para fallar.');
      } else {
          console.warn('XMLHttpRequest no disponible globalmente, el mock falló.');
      }
    `);
  }
}

module.exports = { SignUpPage };