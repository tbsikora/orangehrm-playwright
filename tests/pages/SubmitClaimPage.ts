import type { Locator, Page } from '@playwright/test';
import { URLS } from '../const/selectors/urls';

export class SubmitClaimPage {
  readonly page: Page;
  readonly url = URLS.submitClaim;
  readonly eventSelect: Locator;
  readonly currencySelect: Locator;
  readonly createButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.eventSelect = page.getByTestId('claim-event-select');
    this.currencySelect = page.getByTestId('claim-currency-select');
    this.createButton = page.getByTestId('save-button');
  }

  async goto() {
    await this.page.goto(this.url);
  }

  async selectEvent(name: string) {
    await this.eventSelect.click();
    await this.page.locator('.oxd-select-option').filter({ hasText: name }).click();
  }

  async selectCurrency(name: string) {
    await this.currencySelect.click();
    await this.page.locator('.oxd-select-option').filter({ hasText: name }).click();
  }
}
