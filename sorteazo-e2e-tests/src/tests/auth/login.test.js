const { LoginPage } = require('../../pages/LoginPage');
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
  
    expect(alertMessage).toContain('email should not be empty,email must be an email,password should not be empty');
  });
});

/*
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
    const alertMessage = await loginPage.waitForAlert(2000); // 2 segundos
  
    expect(alertMessage).toContain('email should not be empty,email must be an email,password should not be empty');
  });
});*/