import { test, expect } from '@playwright/test';

test('HP-183 - Resumen de boletos disponibles vs ocupados', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Sorteo Demo');
    await page.click('text=Boletos');

    // 1. Contar en pantalla los disponibles y apartados
    const disponibles = await page.$$('div.bg-white.border-gray-400');
    const apartados = await page.$$('div.bg-gray-400.border-gray-400');

    const total = disponibles.length + apartados.length;

    // 2. Tomar el texto del resumen arriba
    const textoResumen = await page.textContent('p.font-afacad.text-2xl.font-bold.text-green-600');
    // Ejemplo: "30/100"
    const [disponiblesResumen, totalResumen] = textoResumen.split('/').map(n => parseInt(n.trim()));

    // 3. Comparar
    expect(disponiblesResumen).toBe(disponibles.length);
    expect(totalResumen).toBe(total);
});
