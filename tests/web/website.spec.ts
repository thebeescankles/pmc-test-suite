import { test, expect } from '@playwright/test';
import { createWebsiteFixture } from '../../src/web/fixtures/web-fixture';
import { MenuPage } from '../../src/web/pages/menu-page';

test.describe('Casa Maíz website smoke suite', () => {
  test('loads the home page and exposes the primary CMS-driven navigation', async ({ page }) => {
    const { homePage } = createWebsiteFixture(page);

    await homePage.open();
    await homePage.expectLoaded();
    await expect(homePage.nav).toBeVisible();
    await expect(homePage.menuLink).toHaveAttribute('href', /\/menu/);
  });

  test('dismisses the notice and reaches privacy through the user-facing journey', async ({ page }) => {
    const { homePage } = createWebsiteFixture(page);

    await homePage.open();
    await homePage.dismissNotice();

    const privacyPage = await homePage.openPrivacy();
    await privacyPage.expectLoaded();
  });

  test('menu page renders stable CMS content and accessible card structure', async ({ page }) => {
    const { menuPage } = createWebsiteFixture(page);

    await page.goto('/menu');
    const menuPageObject = new MenuPage(page);
    await menuPageObject.expectLoaded();
    await menuPage.expectLoaded();
  });

  test('degraded network state still leaves the page shell usable', async ({ page }) => {
    const { homePage } = createWebsiteFixture(page);

    await page.route('**/*', async (route) => {
      const url = route.request().url();
      if (url.includes('/_next/data') || url.includes('/menu') || url.includes('/legal') || url.includes('/reservas')) {
        await route.abort();
        return;
      }
      await route.continue();
    });

    await homePage.open();
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('navigation', { name: /navegación principal|main navigation/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /inicio|home/i }).first()).toHaveAttribute('href', '/');
  });
});
