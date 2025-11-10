const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

let driver;

beforeAll(async () => {
  console.log('[*] Abriendo Chrome en headless...');

  const options = new chrome.Options();
  options.addArguments('--headless=new');      // headless moderno
  options.addArguments('--disable-gpu');       // deshabilita GPU
  options.addArguments('--no-sandbox');        // evita problemas en Windows
  options.addArguments('--window-size=1920,1080'); // tamaño de ventana

  driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  await driver.manage().setTimeouts({ implicit: 5000, pageLoad: 10000 });

  module.exports.driver = driver;
}, 20_000); // timeout extendido para inicializar Chrome

afterAll(async () => {
  if (driver) {
    console.log('[*] Cerrando Chrome...');
    await driver.quit();
  }
}, 20_000);
