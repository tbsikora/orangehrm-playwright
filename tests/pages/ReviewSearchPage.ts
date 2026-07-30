import type { Locator, Page } from '@playwright/test';
import { URLS } from '../const/selectors/urls';

export class ReviewSearchPage {
  readonly page: Page;
  readonly url = URLS.reviewSearch;
  readonly employeeNameFilter: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.employeeNameFilter = page.getByTestId('review-employee-name-filter');
    this.searchButton = page.getByTestId('review-search-button');
  }

  async goto() {
    await this.page.goto(this.url);
  }
}
