const { Builder, logging } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');

let driver;

beforeAll(async () => {
  console.log('[*] Abriendo Chrome en headless...');

  const options = new chrome.Options();
  options.addArguments('--headless=new');      // headless moderno
  options.addArguments('--disable-gpu');       // deshabilita GPU
  options.addArguments('--no-sandbox');        // evita problemas en Windows
  options.addArguments('--window-size=1920,1080'); // tamaño de ventana

  // habilitar logging de navegador
  const prefs = new logging.Preferences();
  prefs.setLevel(logging.Type.BROWSER, logging.Level.ALL);

  driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .setLoggingPrefs(prefs)
    .build();

  await driver.manage().setTimeouts({ implicit: 5000, pageLoad: 10000 });

  module.exports.driver = driver;
}, 60_000); // timeout extendido para inicializar Chrome

// Después de cada test guardamos logs y screenshot para diagnóstico rápido
afterEach(async () => {
  if (!driver) return;

  try {
    const dumpDir = path.resolve(__dirname, '../../tmp');
    fs.mkdirSync(dumpDir, { recursive: true });

    // guardar logs de consola del navegador
    try {
      const entries = await driver.manage().logs().get('browser');
      if (entries && entries.length) {
        const ts = Date.now();
        const file = path.join(dumpDir, `browser_logs_${ts}.log`);
        const text = entries.map(e => `[${new Date(e.timestamp).toISOString()}] ${e.level.name}: ${e.message}`).join('\n');
        fs.writeFileSync(file, text, 'utf8');
        console.log(`[DEBUG] Browser logs saved to: ${file}`);
      }
    } catch (logErr) {
      console.warn('[DEBUG] Could not retrieve browser logs:', logErr.message || logErr);
    }

    // guardar screenshot
    try {
      const img = await driver.takeScreenshot();
      const ts2 = Date.now();
      const fileImg = path.join(dumpDir, `screenshot_${ts2}.png`);
      fs.writeFileSync(fileImg, img, 'base64');
      console.log(`[DEBUG] Screenshot saved to: ${fileImg}`);
    } catch (imgErr) {
      console.warn('[DEBUG] Could not take screenshot:', imgErr.message || imgErr);
    }
  } catch (err) {
    console.warn('[DEBUG] afterEach diagnostics failed:', err.message || err);
  }
}, 60_000);

afterAll(async () => {
  if (driver) {
    console.log('[*] Cerrando Chrome...');
    await driver.quit();
  }
}, 60_000);
