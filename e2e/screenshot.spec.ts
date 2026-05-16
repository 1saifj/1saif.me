import { test } from '@playwright/test';
test('take a screenshot', async ({ page }) => {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'test-results/home-screenshot.png', fullPage: true });
});
