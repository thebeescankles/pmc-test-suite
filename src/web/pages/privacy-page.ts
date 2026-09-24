import { expect, type Page } from '@playwright/test';

export class PrivacyPage {
  constructor(public readonly page: Page) {}

  get title() {
    return this.page.getByRole('heading', { name: /aviso de privacidad|privacy policy/i });
  }

  get homeLink() {
    return this.page.getByRole('link', { name: /casa maíz|home/i }).first();
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(/\/legal\/privacy_policy$/);
    await expect(this.title).toBeVisible();
  }
}
