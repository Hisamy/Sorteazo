const { By, until } = require('selenium-webdriver');
const { BASE_URL } = require('../../utils/config');
const path = require('path');

class CrearSorteoPage {
  constructor(driver) {
    this.driver = driver;
    this.url = `${process.env.WEB_APP_URL}/crearSorteo`;
   
  
    // CAMPOS 
    this.titleField = By.name('titulo');
    this.cantidadField = By.name('cantidadBoletos');
    this.inicioNumeracionField = By.name('inicioNumeracion');
    this.precioField = By.name('precioBoleto');
    this.descripcionField = By.name('descripcion');
    this.imagenField = By.name('imagen');

    // CAMPOS DE FECHAS 
    this.ventaInicioField = By.name('ventaInicio');
    this.ventaFinField = By.name('ventaFin');
    this.fechaLimiteField = By.name('fechaLimitePago');
    this.fechaSorteoField = By.name('fechaSorteo');

    //  BOTONES 
   this.submitButton = By.css('[data-testid="btn-submit-sorteo"]');

    this.addPrizeButton = By.css('[data-testid="btn-add-prize"]');

   
    //  PREMIOS 
    this.prizeNameByIndex = (i) =>
      By.xpath(`(//input[contains(@placeholder,'Nombre')])[${i + 1}]`);

    this.prizeDescriptionByIndex = (i) =>
      By.xpath(`(//textarea[contains(@placeholder,'Descripción')])[${i + 1}]`);

    this.prizeImageByIndex = (i) =>
      By.xpath(`(//input[@type='file'])[${i + 1}]`);

    //ALERTAS 
    this.alertSelector = By.css('.toast, .alert, div[role="alert"]');
  }

 

  async open() {
    await this.driver.get(this.url);
    await this.driver.wait(until.elementLocated(this.titleField), 5000);
  }

  async waitVisible(locator, msg = 'Elemento no visible') {
    await this.driver.wait(until.elementLocated(locator), 5000, msg);
    const element = await this.driver.findElement(locator);
    await this.driver.wait(until.elementIsVisible(element), 5000, msg);
    return element;
  }

  async setInput(locator, value) {
    const el = await this.waitVisible(locator);
    await el.clear();
    await el.sendKeys(value);
  }

  async setDate(locator, value) {
    const el = await this.waitVisible(locator);
    await el.clear();
    await el.sendKeys(value);
  }

  async uploadFile(locator, fileName) {
    const absolutePath = path.resolve(__dirname, '../../fixtures', fileName);
    const input = await this.waitVisible(locator);
    await input.sendKeys(absolutePath);
  }

 

  // HP-001 / HP-002 / HP-003 lo usan
  async fillBasicInfo({ titulo, cantidadBoletos, inicioNumeracion, precioBoleto, descripcion }) {
    if (titulo !== undefined) await this.setInput(this.titleField, titulo);
    if (cantidadBoletos !== undefined) await this.setInput(this.cantidadField, cantidadBoletos);
    if (inicioNumeracion !== undefined) await this.setInput(this.inicioNumeracionField, inicioNumeracion);
    if (precioBoleto !== undefined) await this.setInput(this.precioField, precioBoleto);
    if (descripcion !== undefined) await this.setInput(this.descripcionField, descripcion);
  }

  async fillDates({ ventaInicio, ventaFin, fechaLimitePago, fechaSorteo }) {
    if (ventaInicio) await this.setDate(this.ventaInicioField, ventaInicio);
    if (ventaFin) await this.setDate(this.ventaFinField, ventaFin);
    if (fechaLimitePago) await this.setDate(this.fechaLimiteField, fechaLimitePago);
    if (fechaSorteo) await this.setDate(this.fechaSorteoField, fechaSorteo);
  }

  // HP-004 y HP-005 lo usan
  async uploadSorteoImage(fileName) {
    await this.uploadFile(this.imagenField, fileName);
  }

  async addPrizeAtIndex(index, { name, description, imageFile }) {
    // crea un premio si no existe
    try {
      await this.driver.findElement(this.prizeNameByIndex(index));
    } catch {
      await this.clickAddPrize();
    }

    if (name) {
      const el = await this.waitVisible(this.prizeNameByIndex(index));
      await el.clear();
      await el.sendKeys(name);
    }

    if (description) {
      const el = await this.waitVisible(this.prizeDescriptionByIndex(index));
      await el.clear();
      await el.sendKeys(description);
    }

    if (imageFile) {
      await this.uploadFile(this.prizeImageByIndex(index), imageFile);
    }
  }

  async clickAddPrize() {
    const btn = await this.waitVisible(this.addPrizeButton);
    await btn.click();
  }

  async submit() {
    const btn = await this.waitVisible(this.submitButton);
    await btn.click();
  }

  async waitForToast(timeout = 5000) {
    try {
      const el = await this.driver.wait(until.elementLocated(this.alertSelector), timeout);
      await this.driver.wait(until.elementIsVisible(el), timeout);
      return await el.getText();
    } catch {
      return null;
    }
  }

  async getFieldErrorText(name) {
    try {
      const node = await this.driver.wait(until.elementLocated(this.fieldErrorByName(name)), 2000);
      await this.driver.wait(until.elementIsVisible(node), 1000);
      return await node.getText();
    } catch {
      return null;
    }
  }
}

module.exports = { CrearSorteoPage };
  
     