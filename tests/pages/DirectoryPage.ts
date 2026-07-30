import type { Locator, Page } from '@playwright/test';
import { URLS } from '../const/selectors/urls';

export class DirectoryPage {
  readonly page: Page;
  readonly url = URLS.directory;
  readonly nameFilter: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameFilter = page.getByTestId('directory-name-filter');
    this.searchButton = page.getByTestId('save-button');
  }

  async goto() {
    await this.page.goto(this.url);
  }

  async searchByName(name: string) {
    await this.nameFilter.fill(name);
    await this.page.locator('.oxd-autocomplete-option').filter({ hasText: name }).click();
    await this.searchButton.click();
  }
}
