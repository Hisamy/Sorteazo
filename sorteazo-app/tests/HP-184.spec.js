import { test, expect } from '@playwright/test';

test('HP-184 - Error de conexión muestra mensaje', async ({ page }) => {
    // Simular que la API falla
    await page.route('**/obtenerSorteoPorId**', route => route.abort());
    await page.route('**/obtenerBoletosPorSorteoCliente**', route => route.abort());

    await page.goto('/');
    await page.click('text=Sorteo Demo');

    // Mensaje mostrado por tu código actual
    await expect(page.locator('text=No se pudo cargar la información del sorteo.')).toBeVisible();
});
