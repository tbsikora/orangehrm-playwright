import type { Locator, Page } from '@playwright/test';
import { URLS } from '../const/selectors/urls';

export class CandidateListPage {
  readonly page: Page;
  readonly url = URLS.candidateList;
  readonly nameFilter: Locator;
  readonly searchButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameFilter = page.getByTestId('candidate-name-filter');
    this.searchButton = page.getByTestId('save-button');
  }

  async goto() {
    await this.page.goto(this.url);
  }

  async searchByName(name: string) {
    await this.nameFilter.fill(name);
    await this.searchButton.click();
  }

  rowContaining(text: string) {
    return this.page.locator('[data-testid^="table-row-"]', { hasText: text });
  }
}
