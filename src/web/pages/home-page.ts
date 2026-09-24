import { expect, type Page } from '@playwright/test';

export class HomePage {
  constructor(public readonly page: Page) {}

  get notice() {
    return this.page.getByRole('region', { name: /aviso de cierre|closure notice/i });
  }

  get closeNoticeButton() {
    return this.page.getByRole('button', { name: /cerrar aviso|close notice/i });
  }

  get nav() {
    return this.page.getByRole('navigation', { name: /navegación principal|main navigation/i });
  }

  get menuLink() {
    return this.page.getByRole('link', { name: /menú|menu/i }).first();
  }

  get privacyLink() {
    return this.page.getByRole('link', { name: /privacidad|privacy/i }).first();
  }

  async open() {
    await this.page.goto('/');
    return this;
  }

  async expectLoaded() {
    await expect(this.page).toHaveTitle(/Casa Maíz|Cocina mexicana/i);
    await expect(this.page.getByRole('heading', { level: 1 })).toContainText(/El maíz tiene memoria|version website v1/i);
    await expect(this.nav).toBeVisible();
    await expect(this.menuLink).toBeVisible();
  }

  async dismissNotice() {
    await expect(this.notice).toBeVisible();
    await this.closeNoticeButton.click();
    await expect(this.notice).not.toBeVisible();
  }

  async openMenu() {
    await this.menuLink.click();
    const { MenuPage } = await import('./menu-page');
    return new MenuPage(this.page);
  }

  async openPrivacy() {
    await this.privacyLink.click();
    const { PrivacyPage } = await import('./privacy-page');
    return new PrivacyPage(this.page);
  }
}
