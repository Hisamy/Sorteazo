const { CrearSorteoPage } = require('../../pages/Sorteos/CrearSorteoPage');
const driver = require('../../setup/driver'); 
const { By, until } = require('selenium-webdriver');

require('dotenv').config();

jest.setTimeout(120000); 
const MOCK_JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImRpYW5hYmFzdGlkYXMxLjJAb3V0bG9vay5jb20iLCJzdWIiOiIwZTRiZjI4NS0xNDNhLTQ3NjUtYTAwYi1jMzMyNTE0OTFmNmIiLCJyb2xlIjoiY2xpZW50IiwiaWF0IjoxNzYzNDQwNTA5LCJleHAiOjE3NjM0NDQxMDl9.a_GRFNNXN_sRCnI2zyjrUStbqR0uxsnnmUr3HMaGnxM'; 
const JWT_STORAGE_KEY = 'access_token';

//  TEST HP-001
describe('HP-001 - Crear sorteo exitoso con todos los campos válidos)', () => {
 let crearSorteoPage;

  beforeAll(async () => {
   crearSorteoPage = new CrearSorteoPage(driver.driver);
   await driver.driver.get(process.env.WEB_APP_URL || 'http://localhost:3000'); 

    // Ejecuta el script para inyectar el token en localStorage
    await driver.executeScript(
      `window.localStorage.setItem('${JWT_STORAGE_KEY}', '${MOCK_JWT_TOKEN}');`
    );
  });

  test('Verificar que el sistema permite crear un sorteo exitosamente cuando todos los campos obligatorios son ingresados correctamente y cumplen con las reglas de validación establecidas.', 
    async () => {

    await crearSorteoPage.open();

    await crearSorteoPage.fillBasicInfo({
      titulo: 'Sorteo Test E2E',
      cantidadBoletos: 100,
      inicioNumeracion: 1,
      precioBoleto: 50.00,
      descripcion: 'Descripción de prueba'
    });

    const hoy = new Date();
    const dd = d => d.toISOString().slice(0, 10);

    await crearSorteoPage.fillDates({
      ventaInicio: dd(hoy),
      ventaFin: dd(new Date(hoy.getTime() + 7 * 86400000)),
      fechaLimitePago: dd(new Date(hoy.getTime() + 10 * 86400000)),
      fechaSorteo: dd(new Date(hoy.getTime() + 14 * 86400000))
    });

    await crearSorteoPage.addPrizeAtIndex(0, {
      name: 'Premio Principal',
      description: 'Gran premio',
      imageFile: 'small_ok.jpg'
    });

    await crearSorteoPage.uploadFile(crearSorteoPage.imagenField, 'small_ok.jpg');

    await crearSorteoPage.submit();

    const toast = await crearSorteoPage.waitForToast(5000);
    expect(toast).not.toBeNull();
    expect(toast.toLowerCase()).toMatch(/sorteo creado|exitoso|creado exitosamente/);
  });
});



  //  TEST HP-002
describe('HP-002 - No permite crear sorteo con valores inválidos', () => {
  let crearSorteoPage;

  beforeAll(async () => {
    crearSorteoPage = new CrearSorteoPage(driver.driver);
  });

  test('Verificar que el sistema no permite crear el sorteo agregando valores inválidos.',
    async () => {

      await crearSorteoPage.open();

      await crearSorteoPage.fillBasicInfo({
        titulo: 'Sorteo inválido',
        cantidadBoletos: 0,
        inicioNumeracion: -1,
        precioBoleto: -10
      });

      await crearSorteoPage.fillDates({
        ventaInicio: '2020-01-01',
        ventaFin: '2020-01-02',
        fechaLimitePago: '2020-01-02',
        fechaSorteo: '2020-01-03'
      });

      await crearSorteoPage.submit();

      const errCantidad = await crearSorteoPage.getFieldErrorText('cantidadBoletos');
      expect(errCantidad).toMatch(/mayor que 0|greater/);

      const errInicio = await crearSorteoPage.getFieldErrorText('inicioNumeracion');
      expect(errInicio).toMatch(/no puede ser negativo|negativo|greater/);

      const errPrecio = await crearSorteoPage.getFieldErrorText('precioBoleto');
      expect(errPrecio).toMatch(/mayor que 0|válido|invalid/);

      const errPremios = await crearSorteoPage.getFieldErrorText('prizeName[]');
      expect((errPremios || '')).toMatch(/debe agregar|agregar al menos/);
    });
});

//  TEST HP-003
describe('HP-003 - No permite crear sorteo con campos obligatorios vacíos', () => {
  let crearSorteoPage;

  beforeAll(async () => {
    crearSorteoPage = new CrearSorteoPage(driver.driver);
  });

  test('Verificar que el sistema no permite crear el sorteo con los campos obligatorios vacíos.',
    async () => {

      await crearSorteoPage.open();
      await crearSorteoPage.submit();

      expect(await crearSorteoPage.getFieldErrorText('titulo'))
        .toMatch(/obligatorio|required/);

      expect(await crearSorteoPage.getFieldErrorText('cantidadBoletos'))
        .toMatch(/required|obligatorio/);

      expect(await crearSorteoPage.getFieldErrorText('fechaSorteo'))
        .toMatch(/required|obligatorio/);

      expect(await crearSorteoPage.getFieldErrorText('precioBoleto'))
        .toMatch(/required|obligatorio/);

      const errPremio = await crearSorteoPage.getFieldErrorText('prizeName[]');
      expect((errPremio || '')).toMatch(/agregar al menos|debe agregar/);
    });
});

//  TEST HP-004
describe('HP-004 - Validar imagen inválida no JPG/PNG', () => {
  let crearSorteoPage;

  beforeAll(async () => {
    crearSorteoPage = new CrearSorteoPage(driver.driver);
  });

  test('Validar que el sistema no permite subir una imagen inválida para el sorteo o premio.',
    async () => {

      await crearSorteoPage.open();

      await crearSorteoPage.fillBasicInfo({
        titulo: 'Sorteo imagen inválida',
        cantidadBoletos: 60,
        inicioNumeracion: 1,
        precioBoleto: 400,
        descripcion: 'Prueba imagen inválida'
      });

      await crearSorteoPage.addPrizeAtIndex(0, {
        name: 'Consola PlayStation 6',
        description: 'Consola de prueba',
        imageFile: 'premio_gamer.gif'
      });

      await crearSorteoPage.uploadFile(crearSorteoPage.imagenField, 'sorteo_gamer.bmp');

      await crearSorteoPage.submit();

      const toast = await crearSorteoPage.waitForToast(4000);
      expect((toast || '').toLowerCase()).toMatch(/jpg|png|formato/);

      const errPrizeImage = await crearSorteoPage.getFieldErrorText('prizeImage[]');
      expect((errPrizeImage || '').toLowerCase()).toMatch(/jpg|png|formato/);
    });
});

//  TEST HP-005
describe('HP-005 - Validar imagen > 5MB', () => {
  let crearSorteoPage;

  beforeAll(async () => {
    crearSorteoPage = new CrearSorteoPage(driver.driver);
  });

  test('Validar que el sistema no permite subir una imagen que excede 5MB.',
    async () => {

      await crearSorteoPage.open();

      await crearSorteoPage.fillBasicInfo({
        titulo: 'Sorteo imagen grande',
        cantidadBoletos: 100,
        inicioNumeracion: 1,
        precioBoleto: 300,
        descripcion: 'Prueba tamaño imagen'
      });

      await crearSorteoPage.addPrizeAtIndex(0, {
        name: 'Viaje a Cancún',
        description: 'Paquete de prueba',
        imageFile: 'viaje_cancun_7mb.jpg'
      });

      await crearSorteoPage.uploadFile(crearSorteoPage.imagenField, 'sorteo_aniversario_8mb.jpg');

      await crearSorteoPage.submit();

      const toast = await crearSorteoPage.waitForToast(4000);
      expect((toast || '').toLowerCase()).toMatch(/5mb|tamaño|exced/);

      const errImg = await crearSorteoPage.getFieldErrorText('imagen');
      expect((errImg || '').toLowerCase()).toMatch(/5mb|tamaño|exced/);
    });
});
