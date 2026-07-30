import type { Page } from '@playwright/test';
import { URLS } from '../const/selectors/urls';

export class MyClaimsPage {
  readonly page: Page;
  readonly url = URLS.myClaims;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(this.url);
  }

  rowContaining(text: string) {
    return this.page.locator('[data-testid^="table-row-"]', { hasText: text });
  }
}
