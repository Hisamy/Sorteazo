import { test, expect } from '@playwright/test';

test('HP-181 - Visualización correcta de boletos del sorteo', async ({ page }) => {
    await page.goto('/');

    // 1. Seleccionar sorteo
    await page.click('text=Sorteo Demo');

    // 2. Abrir sección de boletos 
    await page.click('text=Boletos');

    // 3. Verificar que se muestran boletos
    const boletos = await page.$$('.w-10.h-10');
    expect(boletos.length).toBeGreaterThan(0);

    // 4. Verificar que el título del sorteo coincide
    const titulo = await page.textContent('h1');
    expect(titulo).toContain('Sorteo Demo');
});
