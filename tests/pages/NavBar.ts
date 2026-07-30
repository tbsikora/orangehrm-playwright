import type { Locator, Page } from '@playwright/test';

export class NavBar {
  readonly page: Page;
  readonly userDropdownToggle: Locator;
  readonly logoutLink: Locator;
  readonly pageTitle: Locator;
  readonly pageSubtitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userDropdownToggle = page.getByTestId('user-dropdown-toggle');
    this.logoutLink = page.getByTestId('user-dropdown-logout');
    this.pageTitle = page.getByTestId('page-title');
    this.pageSubtitle = page.getByTestId('page-subtitle');
  }

  menuItem(name: string) {
    return this.page.getByTestId(`menu-item-${name}`);
  }

  async goToModule(name: string) {
    await this.menuItem(name).click();
  }

  async logout() {
    await this.userDropdownToggle.click();
    await this.logoutLink.click();
  }
}
