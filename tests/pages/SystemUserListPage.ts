import type { Locator, Page } from '@playwright/test';
import { URLS } from '../const/selectors/urls';

export class SystemUserListPage {
  readonly page: Page;
  readonly url = URLS.systemUserList;
  readonly usernameFilter: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameFilter = page.getByTestId('user-list-username-filter');
    this.searchButton = page.getByTestId('user-list-search-button');
  }

  async goto() {
    await this.page.goto(this.url);
  }

  async searchByUsername(username: string) {
    await this.usernameFilter.fill(username);
    await this.searchButton.click();
  }

  rowContaining(text: string) {
    return this.page.locator('[data-testid^="table-row-"]', { hasText: text });
  }
}
