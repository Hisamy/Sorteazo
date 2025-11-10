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