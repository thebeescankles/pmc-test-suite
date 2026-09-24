import type { Page } from '@playwright/test';
import { HomePage } from '../pages/home-page';
import { MenuPage } from '../pages/menu-page';
import { PrivacyPage } from '../pages/privacy-page';

export function createWebsiteFixture(page: Page) {
  return {
    homePage: new HomePage(page),
    menuPage: new MenuPage(page),
    privacyPage: new PrivacyPage(page),
  };
}
