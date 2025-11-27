const { By, until } = require('selenium-webdriver');
const { BASE_URL } = require('../../utils/config');

class GestionarSorteoPage {

  constructor(driver) {
    this.driver = driver;

    // Selectores
    this.misSorteosLink = By.xpath("//a[contains(text(),'Mis sorteos')]");
    this.eliminarBtn = By.xpath("//button[contains(text(),'Eliminar sorteo')]");
    this.editarBtn = By.xpath("//button[contains(text(),'Editar sorteo')]");

    this.alertModal = By.css('.swal2-popup'); 
    this.alertTitle = By.css('.swal2-title');
    this.alertConfirmBtn = By.css('.swal2-confirm');

    this.tituloInput = By.name("title");
    this.cantidadInput = By.name("numbersQuantity");
    this.inicioInput = By.name("startNumber");
    this.premiosInput = By.css(".premio-item input");
    this.guardarBtn = By.xpath("//button[contains(text(),'Guardar')]");
  }

  async loginAsOrganizer(email, password) {
    await this.driver.get(`${BASE_URL}/login`);
    await this.driver.findElement(By.name("email")).sendKeys(email);
    await this.driver.findElement(By.name("password")).sendKeys(password);
    await this.driver.findElement(By.css("button[type='submit']")).click();
    await this.driver.wait(until.alertIsPresent(), 4000);
    const alert = await this.driver.switchTo().alert();
    await alert.accept();
  }

  async goToMisSorteos() {
    await this.driver.wait(until.elementLocated(this.misSorteosLink), 5000);
    await this.driver.findElement(this.misSorteosLink).click();
  }

  async selectSorteoByName(nombre) {
    const selector = By.xpath(`//h3[contains(text(),'${nombre}')]`);
    await this.driver.wait(until.elementLocated(selector), 7000);
    await this.driver.findElement(selector).click();
  }

  async clickEliminar() {
    await this.driver.findElement(this.eliminarBtn).click();
  }

  async clickEditar() {
    await this.driver.findElement(this.editarBtn).click();
  }

  async waitForAlert() {
    await this.driver.wait(until.elementLocated(this.alertModal), 5000);
    const title = await this.driver.findElement(this.alertTitle).getText();
    return title;
  }

  async confirmAlert() {
    await this.driver.findElement(this.alertConfirmBtn).click();
  }

  async modifyField(locator, text) {
    const el = await this.driver.findElement(locator);
    await el.clear();
    await el.sendKeys(text);
  }
}

module.exports = { GestionarSorteoPage };
