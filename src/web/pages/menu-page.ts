import { expect, type Page } from '@playwright/test';

export class MenuPage {
  constructor(public readonly page: Page) {}

  get header() {
    return this.page.getByRole('heading', { name: /from the milpa to the table|de la milpa a la mesa/i });
  }

  get reserveLink() {
    return this.page.getByRole('link', { name: /reserve a table|reservar/i }).first();
  }

  async expectLoaded() {
    await expect(this.header).toBeVisible();
    const menuArticles = this.page.locator('article').filter({
      has: this.page.getByRole('heading', { level: 3 }),
    });
    await expect(menuArticles.first()).toBeVisible();
    await expect(this.reserveLink).toHaveAttribute('href', /\/reservas/);
  }
}
