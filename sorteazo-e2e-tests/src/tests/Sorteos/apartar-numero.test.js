const driver = require("../../setup/driver");
const { ApartarNumeroPage } = require("../../pages/Sorteos/ApartarNumeroPage");
const { By, until, Builder } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const { BASE_URL } = require('../../utils/config');


jest.setTimeout(90000);


describe("HP-195 - Selección exitosa de un número disponible", () => {
    let page;

    beforeAll(async () => {
        page = new ApartarNumeroPage(driver.driver, 1);
        await page.open();
    });

    test("Verificar que un cliente puede seleccionar y confirmar el apartado de un número disponible en un sorteo activo", async () => {
        await page.clickBoleto(5);

        await page.clickFloatingBar();
        await page.confirmarModal();

        const alertMessage = await page.waitForAlert();
        expect(alertMessage).toContain("apartado");
    });
});

describe("HP-196 - Seleccionar varios boletos", () => {
    let page;

    beforeAll(async () => {
        page = new ApartarNumeroPage(driver.driver, 1);
        await page.open();
    });

    test("Verificar que un cliente puede seleccionar múltiples números disponibles, visualizar el total a pagar y confirmar el apartado de todos simultáneamente.", async () => {
        await page.clickBoleto(10);
        await page.clickBoleto(11);
        await page.clickBoleto(12);

        await page.clickFloatingBar();
        await page.confirmarModal();

        const msg = await page.waitForAlert();
        expect(msg).toContain("apartado");
    });
});
describe("HP-197 - No permitir seleccionar boletos apartados", () => {
    let page;

    beforeAll(async () => {
        page = new ApartarNumeroPage(driver.driver, 1);
        await page.open();
    });

    test("Verificar que el sistema previene la selección de un número que ya ha sido apartado por otro cliente.", async () => {
        const locator = page.boletoButton(3);

        const clase = await driver.driver.findElement(locator).getAttribute("class");
        expect(clase).toContain("apartado");

        await page.clickBoleto(3);

        const nuevaClase = await driver.driver.findElement(locator).getAttribute("class");
        expect(nuevaClase).toContain("apartado");
    });
});
describe("HP-198 - Actualización en tiempo real", () => {
    let driverA, driverB;
    let pageA, pageB;

    beforeAll(async () => {
        driverA = await new Builder().forBrowser("chrome").setChromeOptions(new chrome.Options().addArguments("--headless=new")).build();
        driverB = await new Builder().forBrowser("chrome").setChromeOptions(new chrome.Options().addArguments("--headless=new")).build();

        pageA = new ApartarNumeroPage(driverA, 1);
        pageB = new ApartarNumeroPage(driverB, 1);

        await pageA.open();
        await pageB.open();
    });

    test("Verificar que el sistema actualiza en tiempo real la disponibilidad de números cuando múltiples clientes están interactuando simultáneamente con el mismo sorteo.", async () => {
        await pageA.clickBoleto(20);
        await pageA.clickFloatingBar();
        await pageA.confirmarModal();
        await pageA.waitForAlert();

        await driverB.navigate().refresh();

        const clase = await driverB.findElement(pageB.boletoButton(20)).getAttribute("class");
        expect(clase).toContain("apartado");
    });

    afterAll(async () => {
        await driverA.quit();
        await driverB.quit();
    });
});
describe("HP-199 - Confirmar apartado", () => {
    let page;

    beforeAll(async () => {
        page = new ApartarNumeroPage(driver.driver, 1);
        await page.open();
    });

    test("Verificar que el sistema bloquea temporalmente los números seleccionados y muestra un mensaje de confirmación exitosa al cliente.", async () => {
        await page.clickBoleto(30);
        await page.clickBoleto(31);

        await page.clickFloatingBar();
        await page.confirmarModal();

        const msg = await page.waitForAlert();
        expect(msg).toContain("apartado");
    });
});
describe("HP-200 - Error al confirmar apartado", () => {
    let page;

    beforeAll(async () => {
        page = new ApartarNumeroPage(driver.driver, 1);
        await page.open();

        await driver.driver.executeScript(`
            window.XMLHttpRequest.prototype.send = function() {
                this.onerror && this.onerror(new Error("fail"));
            };
        `);
    });

    test("Verificar el comportamiento del sistema cuando ocurre un error de conexión o servidor durante el proceso de apartado", async () => {
        await page.clickBoleto(40);

        await page.clickFloatingBar();
        await page.confirmarModal();

        const msg = await page.waitForAlert();
        expect(msg).toContain("error");
    });
});
describe("HP-201 - Cancelación voluntaria", () => {
    test("Verificar que el cliente puede cancelar voluntariamente un apartado existente y que el sistema libera correctamente los números.", async () => {
        await driver.driver.get(BASE_URL + "/mis-apartados");

        const lista = By.css("[data-testid='mis-apartados-list']");
        await driver.driver.wait(until.elementLocated(lista), 6000);

        const cancelar = By.css("[data-testid='cancelar-apartado']");
        await driver.driver.findElement(cancelar).click();

        const msg = await driver.driver.switchTo().alert().getText();
        expect(msg).toContain("cancelado");
    });
});
describe("HP-202 - Intento de apartar sin estar logueado", () => {
    let page;

    beforeAll(async () => {
     
        await driver.driver.manage().deleteAllCookies();
        await driver.driver.executeScript(`
            window.localStorage.clear();
            window.sessionStorage.clear();
        `);

        page = new ApartarNumeroPage(driver.driver, 1);
        await page.open();
    });

    test("Verificar que el sistema detecta cuando un usuario no autenticado intenta apartar un número y lo redirige al inicio de sesión.", async () => {
     
        await driver.driver.wait(
            until.urlContains("/login"),
            6000,
            "No redirigió a login"
        );

        const url = await driver.driver.getCurrentUrl();
        expect(url).toContain("/login");
    });
});
describe("HP-203 - Intentar apartar en sorteo finalizado", () => {
    let page;

    beforeAll(async () => {
       
        page = new ApartarNumeroPage(driver.driver, 99);
        await page.open();
    });

    test("Verificar que el sistema previene el apartado de números en sorteos que ya han finalizado o cerrado.", async () => {
        const mensajeLocator = By.css('[data-testid="sorteo-finalizado-msg"]');

        const elemento = await driver.driver.wait(
            until.elementLocated(mensajeLocator),
            6000,
            "No apareció mensaje de sorteo finalizado"
        );

        const txt = await elemento.getText();

        expect(txt.toLowerCase()).toContain("finalizado");
    });
});
describe("HP-204 - Reintento automático tras reconexión", () => {
    let page;

    beforeAll(async () => {
        page = new ApartarNumeroPage(driver.driver, 1);
        await page.open();
    });

    test("Verificar que el sistema intenta automáticamente completar el apartado cuando la conexión se restablece tras una falla temporal.", async () => {
       
        await page.clickBoleto(55);
        await page.clickFloatingBar();
        await driver.driver.executeScript(`
            window.XMLHttpRequest.prototype.send = function() {
                this.onerror && this.onerror(new Error("network fail"));
            };
        `);

        
        await page.confirmarModal();
        const msg1 = await page.waitForAlert();
        expect(msg1.toLowerCase()).toContain("error");

        
        await driver.driver.executeScript(`
            delete window.XMLHttpRequest.prototype.send;
        `);

        await page.clickFloatingBar();
        await page.confirmarModal();

        const msg2 = await page.waitForAlert();
        expect(msg2.toLowerCase()).toContain("apartado");
    });
});
describe("HP-205 - Condición de carrera entre dos clientes", () => {
    let driverA, driverB;
    let pageA, pageB;

    beforeAll(async () => {
        driverA = await new Builder().forBrowser("chrome")
            .setChromeOptions(new chrome.Options().addArguments("--headless=new"))
            .build();

        driverB = await new Builder().forBrowser("chrome")
            .setChromeOptions(new chrome.Options().addArguments("--headless=new"))
            .build();

        pageA = new ApartarNumeroPage(driverA, 1);
        pageB = new ApartarNumeroPage(driverB, 1);

        await pageA.open();
        await pageB.open();
    });

    test("Verificar que el sistema maneja correctamente el caso donde un cliente intenta confirmar el apartado de números que fueron apartados por otro usuario milisegundos antes (condición de carrera).", async () => {
        const numero = 77;

        
        await Promise.all([
            pageA.clickBoleto(numero),
            pageB.clickBoleto(numero)
        ]);

        
        await pageA.clickFloatingBar();
        await pageA.confirmarModal();
        const msgA = await pageA.waitForAlert();

        await pageB.clickFloatingBar();
        await pageB.confirmarModal();
        const msgB = await pageB.waitForAlert();

   
        expect(msgA.toLowerCase()).toContain("apartado");
        expect(msgB.toLowerCase()).toContain("no disponible");
    });

    afterAll(async () => {
        await driverA.quit();
        await driverB.quit();
    });
});
