const { GestionarSorteoPage } = require('../../pages/Sorteos/GestionarSorteoPage');
const driver = require('../../setup/driver');
const { By, until } = require('selenium-webdriver');

jest.setTimeout(60000);

describe("HP-006 - No eliminar sorteo con boletos vendidos", () => {

  let page;

  beforeAll(async () => {
    page = new GestionarSorteoPage(driver.driver);
    await page.loginAsOrganizer("organizador@example.com", "password123");
    await page.goToMisSorteos();
    await page.selectSorteoByName("Sorteo con ventas");
  });

  test("El sistema NO debe permitir eliminar un sorteo con boletos vendidos", async () => {
    await page.clickEliminar();

    const title = await page.waitForAlert();
    expect(title).toContain("No es posible eliminar un sorteo con boletos vendidos");

    await page.confirmAlert();

    // Verificar que sigue en la página del sorteo
    const stillOnPage = await driver.driver.findElement(page.eliminarBtn).isDisplayed();
    expect(stillOnPage).toBe(true);
  });
});
describe("HP-007 - Restringir modificación de sorteo con boletos vendidos", () => {

  let page;

  beforeAll(async () => {
    page = new GestionarSorteoPage(driver.driver);
    await page.loginAsOrganizer("organizador@example.com", "password123");
    await page.goToMisSorteos();
    await page.selectSorteoByName("Sorteo con ventas");
  });

  test("El sistema debe impedir cambiar boletos o premios", async () => {
    await page.clickEditar();

    // Intentar modificar cantidad de boletos
    await page.modifyField(page.cantidadInput, "999");

    // Guardar cambios
    await driver.driver.findElement(page.guardarBtn).click();

    const alertMessage = await page.waitForAlert();
    expect(alertMessage).toContain("No es posible modificar premios o boletos de un sorteo con ventas realizadas");

    await page.confirmAlert();
  });
});
describe("HP-008 - Eliminar sorteo sin ventas", () => {

  let page;

  beforeAll(async () => {
    page = new GestionarSorteoPage(driver.driver);
    await page.loginAsOrganizer("organizador@example.com", "password123");
    await page.goToMisSorteos();
    await page.selectSorteoByName("Sorteo sin ventas");
  });

  test("El sorteo debe eliminarse exitosamente", async () => {
    await page.clickEliminar();

    let message = await page.waitForAlert();
    expect(message).toContain("¿Desea eliminar este sorteo?");
    await page.confirmAlert();

    message = await page.waitForAlert();
    expect(message).toContain("Sorteo eliminado exitosamente.");
    await page.confirmAlert();
  });
});

describe("HP-009 - Modificar sorteo sin ventas", () => {

  let page;

  beforeAll(async () => {
    page = new GestionarSorteoPage(driver.driver);
    await page.loginAsOrganizer("organizador@example.com", "password123");
    await page.goToMisSorteos();
    await page.selectSorteoByName("Sorteo editable");
  });

  test("Debe permitir modificar todos los campos de un sorteo sin ventas", async () => {
    await page.clickEditar();

    await page.modifyField(page.tituloInput, "Nuevo Título");
    await page.modifyField(page.cantidadInput, "500");
    await page.modifyField(page.inicioInput, "1000");

    await driver.driver.findElement(page.guardarBtn).click();

    const message = await page.waitForAlert();
    expect(message).toContain("Sorteo modificado correctamente");
    await page.confirmAlert();
  });
});
