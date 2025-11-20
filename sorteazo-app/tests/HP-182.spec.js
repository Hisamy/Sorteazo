import { test, expect } from '@playwright/test';

test('HP-182 - Visualización correcta de estados de boletos', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Sorteo Demo');
    await page.click('text=Boletos');

    // Boletos apartado 
    const apartados = await page.$$('div.bg-gray-400.border-gray-400');
    expect(apartados.length).toBeGreaterThan(0);

    // Boletos disponibles
    const disponibles = await page.$$('div.bg-white.border-gray-400');
    expect(disponibles.length).toBeGreaterThan(0);

    // Verificar que disponible es clickeable
    for (const disp of disponibles) {
        const cursor = await disp.evaluate(el => getComputedStyle(el).cursor);
        expect(cursor).not.toBe('not-allowed');
    }

    // Verificar que apartado NO es clickeable
    const cursorApartado = await apartados[0].evaluate(el => getComputedStyle(el).cursor);
    expect(cursorApartado).toBe('not-allowed');
});
