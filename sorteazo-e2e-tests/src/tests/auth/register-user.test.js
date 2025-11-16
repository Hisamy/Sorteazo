const driver = require('../../setup/driver');
const { By, until } = require('selenium-webdriver');

const { SignUpPage } = require('../../pages/auth/SignUpPage');

require('dotenv').config();

jest.setTimeout(60000)


describe('HP-171 - Registro de Usuario (Registro exitoso)', () => {
  let signUpPage;

  beforeAll(() => {
    signUpPage = new SignUpPage(driver.driver);
  });

  test('Verificar que cuando el usuario ingrese todos sus datos, el sistema lo agregue a la base de datos correctamente.', 
    async () => {

    const name = "Carlos";
    const lastName = "Gomez";
    const email = "carlostester@example.com";
    const phoneNumber = "6400000000";
    const address = "Av. Juarez #31";
    const zipCode = "11111";

    const password = "carlostester12345?";
    const confirmPassword = "carlostester12345?";

    await signUpPage.open();
    
    await signUpPage.fillBasicUserData(
        name, 
        lastName, 
        email, 
        phoneNumber, 
        address, 
        zipCode
    );

    await signUpPage.fillPasswordInputs(password, confirmPassword);

    await signUpPage.registerUserButtonClick();

    const alertMessage = await signUpPage.waitForAlert(10000);
    
    expect(alertMessage).not.toBeNull();
    expect(alertMessage).toContain('Cuenta creada con éxito');
  });
});


describe('HP-172 - Registro de Usuario (Campos vacíos)', () => {
  let signUpPage;

  beforeAll(() => {
    signUpPage = new SignUpPage(driver.driver);
  });

  test('Verificar que el sistema no permite registrar un usuario si no se llenan los datos solicitados.', 
    async () => {

    const name = "";
    const lastName = "";
    const email = "";
    const phoneNumber = "";
    const address = "";
    const zipCode = "";

    const password = "";
    const confirmPassword = "";

    await signUpPage.open();
    
    await signUpPage.fillBasicUserData(
        name, 
        lastName, 
        email, 
        phoneNumber, 
        address, 
        zipCode
    );

    await signUpPage.fillPasswordInputs(password, confirmPassword);

    await signUpPage.registerUserButtonClick();

    const alertMessage = await signUpPage.waitForAlert(10000);
    
    expect(alertMessage).not.toBeNull();
    expect(alertMessage).toContain('El nombre y el correo son obligatorios');
  });
});



describe('HP-173 - Registro de Usuario (Formato de correo inválido)', () => {
  let signUpPage;

  beforeAll(() => {
    signUpPage = new SignUpPage(driver.driver);
  });

  test('Verificar que cuando se ingresa un correo electrónico no válido en formato en el formulario, el sistema no permite el registro del usuario e informa sobre la presencia del error.', 
    async () => {

    const name = "Pedro";
    const lastName = "Lopez";
    const email = "pedrolopez@@ex";
    const phoneNumber = "6400000001'";
    const address = "11111";
    const zipCode = "Av. Juarez #31";

    const password = "pedrolopez12345?";
    const confirmPassword = "pedrolopez12345?";

    await signUpPage.open();
    
    await signUpPage.fillBasicUserData(
        name, 
        lastName, 
        email, 
        phoneNumber, 
        address, 
        zipCode
    );

    await signUpPage.fillPasswordInputs(password, confirmPassword);

    await signUpPage.registerUserButtonClick();

    const validationMessage = await signUpPage.getNativeValidationError(signUpPage.emailField);

    expect(validationMessage).not.toBeNull(); 
    expect(validationMessage).toContain('"@"');
  });
});


describe('HP-174 - Registro de Usuario (Teléfono ya registrado)', () => {
  let signUpPage;

  beforeAll(() => {
    signUpPage = new SignUpPage(driver.driver);
  });

  test('Verificar que cuando el usuario ingrese un teléfono ya registrado, el sistema muestre un mensaje indicando el error al usuario y no permita el registro del mismo en la base de datos.', 
    async () => {

    const name = "Pedro";
    const lastName = "Lopez";
    const email = "nopedrolopez@example.com";
    const phoneNumber = "6400000000'";
    const address = "11111";
    const zipCode = "Av. Juarez #31";

    const password = "pedrolopez12345?";
    const confirmPassword = "pedrolopez12345?";

    await signUpPage.open();
    
    await signUpPage.fillBasicUserData(
        name, 
        lastName, 
        email, 
        phoneNumber, 
        address, 
        zipCode
    );

    await signUpPage.fillPasswordInputs(password, confirmPassword);

    await signUpPage.registerUserButtonClick();

    const alertMessage = await signUpPage.waitForAlert(10000);
    
    expect(alertMessage).not.toBeNull();
    expect(alertMessage).toContain('This phone number is already in use');
  });
});



describe('HP-175 - Registro de Usuario (Correo ya registrado)', () => {
  let signUpPage;

  beforeAll(() => {
    signUpPage = new SignUpPage(driver.driver);
  });

  test('Verificar que cuando el usuario ingrese un correo electrónico ya registrado, el sistema muestre un mensaje indicando el error al usuario y no permita el registro del mismo en la base de datos.', 
    async () => {

    const name = "Pedro";
    const lastName = "Lopez";
    const email = "pedrolopez@example.com";
    const phoneNumber = "6400000001'";
    const address = "11111";
    const zipCode = "Av. Juarez #31";

    const password = "pedrolopez12345?";
    const confirmPassword = "pedrolopez12345?";

    await signUpPage.open();
    
    await signUpPage.fillBasicUserData(
        name, 
        lastName, 
        email, 
        phoneNumber, 
        address, 
        zipCode
    );

    await signUpPage.fillPasswordInputs(password, confirmPassword);

    await signUpPage.registerUserButtonClick();

    const alertMessage = await signUpPage.waitForAlert(10000);
    
    expect(alertMessage).not.toBeNull();
    expect(alertMessage).toContain('This email is already in use');
  });
});



describe('HP-176 - Registro de Usuario (Contraseña no cumple requisitos)', () => {
  let signUpPage;

  beforeAll(() => {
    signUpPage = new SignUpPage(driver.driver);
  });

  test('Verificar que la contraseña ingresada por el usuario cumple los requisitos para el registro.', 
    async () => {

    const name = "Angel";
    const lastName = "Lopez";
    const email = "otrocorreo@example.com";
    const phoneNumber = "6400000002'";
    const address = "11111";
    const zipCode = "Av. Juarez #31";

    const password = "angel";
    const confirmPassword = "angel";

    await signUpPage.open();
    
    await signUpPage.fillBasicUserData(
        name, 
        lastName, 
        email, 
        phoneNumber, 
        address, 
        zipCode
    );

    await signUpPage.fillPasswordInputs(password, confirmPassword);

    await signUpPage.registerUserButtonClick();

    const alertMessage = await signUpPage.waitForAlert(10000);
    
    expect(alertMessage).not.toBeNull();
    expect(alertMessage).toContain('Password must contain at least 8 chars');
  });
});


describe('HP-177 - Registro de Usuario (Confirmación de contraseña incorrecta)', () => {
  let signUpPage;

  beforeAll(() => {
    signUpPage = new SignUpPage(driver.driver);
  });

  test('Verificar que la confirmación de contraseña ingresada por el usuario está funcionando correctamente, para prevenir registros con contraseñas no deseadas.', 
    async () => {

    const name = "Angel";
    const lastName = "Lopez";
    const email = "otrocorreo@example.com";
    const phoneNumber = "6400000002'";
    const address = "11111";
    const zipCode = "Av. Juarez #31";

    const password = "angel12345?";
    const confirmPassword = "pedro6502?";

    await signUpPage.open();
    
    await signUpPage.fillBasicUserData(
        name, 
        lastName, 
        email, 
        phoneNumber, 
        address, 
        zipCode
    );

    await signUpPage.fillPasswordInputs(password, confirmPassword);

    await signUpPage.registerUserButtonClick();

    const alertMessage = await signUpPage.waitForAlert(10000);
    
    expect(alertMessage).not.toBeNull();
    expect(alertMessage).toContain('Las contraseñas no coinciden');
  });
});


describe('HP-178 - Registro de Usuario (Mostrar/Ocultar contraseña)', () => {
  let signUpPage;

  beforeAll(() => {
    signUpPage = new SignUpPage(driver.driver);
  });

  test('Verificar que la opción para visualizar la contraseña en texto plano está funcionando correctamente, con el objetivo de prevenir contraseñas no deseadas por el usuario..', 
    async () => {

    const name = "Angel";
    const lastName = "Lopez";
    const email = "otrocorreo@example.com";
    const phoneNumber = "6400000002'";
    const address = "11111";
    const zipCode = "Av. Juarez #31";

    const password = "angel12345?";
    const confirmPassword = "pedro6502?";

    await signUpPage.open();
    
    await signUpPage.fillBasicUserData(
        name, 
        lastName, 
        email, 
        phoneNumber, 
        address, 
        zipCode
    );

    await signUpPage.fillPasswordInputs(password, confirmPassword);

    await signUpPage.clickPasswordToggle();

    let inputType = await signUpPage.getPasswordInputType();
    expect(inputType).toBe('text');

    await signUpPage.clickConfirmPasswordToggle();

    inputType = await signUpPage.getConfirmPasswordInputType();
    expect(inputType).toBe('text');
  });
});



describe('HP-179 - Registro de Usuario (Error de Conexión)', () => {
  let signUpPage;

  beforeAll(() => {
    signUpPage = new SignUpPage(driver.driver);
  });

  test('Verificar que cuando el usuario ingrese todos sus datos y quiera registrarse al haber un problema de conexión con el servidor, el sistema muestre un error indicando el problema.', 
    async () => {
    
        const name = "Carlos";
    const lastName = "Gomez";
    const email = "carlostester@example.com";
    const phoneNumber = "6400000000";
    const address = "Av. Juarez #31";
    const zipCode = "11111";

    const password = "carlostester12345?";
    const confirmPassword = "carlostester12345?";

    await signUpPage.open();
    
    await signUpPage.fillBasicUserData(
        name, 
        lastName, 
        email, 
        phoneNumber, 
        address, 
        zipCode
    );

    await signUpPage.fillPasswordInputs(password, confirmPassword);

    await signUpPage.setupConnectionRefusedMock();
    
    await signUpPage.registerUserButtonClick();

    const alertMessage = await signUpPage.waitForAlert(10000);
    
    expect(alertMessage).not.toBeNull();
    expect(alertMessage).toContain('No se pudo conectar con el servidor');
  });
});