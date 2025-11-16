const { LoginPage } = require('../../pages/auth/LoginPage');
const driver = require('../../setup/driver');
const { By, until } = require('selenium-webdriver');

require('dotenv').config();

jest.setTimeout(60000)


describe('HP-161 - Iniciar Sesión (Inicio de sesión exitoso como organizador)', () => {
  let loginPage;

  beforeAll(() => {
    loginPage = new LoginPage(driver.driver);
  });

  test('Verificar que cuando el usuario registrado como organizador inicia sesión en el sistema, este es redireccionado correctamente a la pantalla de organización de sorteos.', 
    async () => {

    const email = "pedrolopez@example.com";
    const password = "pedrolopez12345?";

    await loginPage.open();
    await loginPage.login(email, password);
    const alertMessage = await loginPage.waitForAlert(2000); // 2 segundos
    expect(alertMessage).toContain('exitoso');

    // TODO: verificar que te lleve al DASHBOARD o pantalla principal de administrador.
  });
});


describe('HP-162 - Iniciar Sesión (Inicio de sesión exitoso como cliente)', () => {
  let loginPage;

  beforeAll(() => {
    loginPage = new LoginPage(driver.driver);
  });

  test('Verificar que cuando el usuario registrado como organizador inicia sesión en el sistema, este es redireccionado correctamente a la pantalla de organización de visualización de sorteos disponibles. ', 
    async () => {

    const email = "martincota@example.com";
    const password = "martincota12345?";

    await loginPage.open();
    await loginPage.login(email, password);
    const alertMessage = await loginPage.waitForAlert(2000); // 2 segundos
    expect(alertMessage).toContain('exitoso');
    // TODO: verificar que te lleve a la pantalla HOME (cliente).
  });
});



describe('HP-163 - Iniciar Sesión (Intento de inicio de sesión con campos vacíos)', () => {
  let loginPage;

  beforeAll(() => {
    loginPage = new LoginPage(driver.driver);
  });

  test('Verificar que el sistema no permite iniciar sesión si uno o ambos campos están vacíos, mostrando un mensaje de validación al usuario.', 
    async () => {

    const email = "";
    const password = "";

    await loginPage.open();
    await loginPage.login(email, password);
    const alertMessage = await loginPage.waitForAlert(2000); // 2 segundos
  
    expect(alertMessage).not.toBeNull();
    expect(alertMessage).toContain('email should not be empty,email must be an email,password should not be empty');
  });
});


describe('HP-164 - Iniciar Sesión (Intento de inicio de sesión con correo inválido)', () => {
  let loginPage;

  beforeAll(() => {
    loginPage = new LoginPage(driver.driver);
  });

  test('Validar que el sistema verifique el formato del correo e impida el acceso si es incorrecto.', 
    async () => {

    const email = "martincota@@.com";
    const password = "martincota12345?";

    await loginPage.open();
    await loginPage.login(email, password);

    const validationMessage = await loginPage.getNativeValidationError(loginPage.emailField);

    expect(validationMessage).not.toBeNull(); 
    expect(validationMessage).toContain('"@"');
  });
});


describe('HP-165 - Iniciar Sesión (Intento de inicio de sesión con contraseña incorrecta)', () => {
  let loginPage;

  beforeAll(() => {
    loginPage = new LoginPage(driver.driver);
  });

  test('Verificar que el sistema detecte una contraseña incorrecta e impida el acceso.', 
    async () => {

    const email = "martincota@example.com";
    const wrongPassword = "martincota8888";

    await loginPage.open();
    await loginPage.login(email, wrongPassword);
    const alertMessage = await loginPage.waitForAlert(2000); // 2 segundos

    expect(alertMessage).not.toBeNull();
    expect(alertMessage).toContain('Invalid credentials');
  });
});


describe('HP-166 - Iniciar Sesión (Visualizar/ocultar contraseña)', () => {
  let loginPage;

  beforeAll(() => {
    loginPage = new LoginPage(driver.driver);
  });

  test('Verificar que el usuario pueda visualizar u ocultar la contraseña mediante el botón correspondiente.', 
  async () => {
    
    const password = "martinlopez12?";

    await loginPage.open();
    await loginPage.driver.findElement(loginPage.passwordField).sendKeys(password);
    let inputType = await loginPage.getPasswordInputType();

    expect(inputType).toBe('password');

    await loginPage.clickPasswordToggle();

    inputType = await loginPage.getPasswordInputType();
    expect(inputType).toBe('text');

    await loginPage.clickPasswordToggle();

    inputType = await loginPage.getPasswordInputType();  
    expect(inputType).toBe('password');
  });
});


describe('HP-167 - Iniciar Sesión (Error de conexión durante el inicio de sesión)', () => {
  let loginPage;

  beforeAll(() => {
    loginPage = new LoginPage(driver.driver);
  });

  test('Asegurar que ante un fallo de conexión el usuario reciba un mensaje de error sin perder el contexto de inicio de sesión.', 
    async () => {

    const email = "martincota@example.com";
    const password = "martincota8888";

    await loginPage.open();

    await loginPage.setupConnectionRefusedMock();

    await loginPage.login(email, password);
    const alertMessage = await loginPage.waitForAlert(2000); // 2 segundos

    expect(alertMessage).not.toBeNull();
    expect(alertMessage).toBe('No se pudo conectar con el servidor');
  });
});