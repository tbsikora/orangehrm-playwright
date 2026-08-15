import type { Page } from '@playwright/test';
import { URLS } from '../const/selectors/urls';

export class DashboardPage {
  readonly page: Page;
  readonly url = URLS.dashboard;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(this.url);
  }
}
