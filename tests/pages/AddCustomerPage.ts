import type { Locator, Page } from '@playwright/test';
import { URLS } from '../const/selectors/urls';

export class AddCustomerPage {
  readonly page: Page;
  readonly url = URLS.addCustomer;
  readonly nameInput: Locator;
  readonly saveButton: Locator;
  readonly toastTitle: Locator;
  readonly toastMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByTestId('customer-name-input');
    this.saveButton = page.getByTestId('save-button');
    this.toastTitle = page.getByTestId('toast-title');
    this.toastMessage = page.getByTestId('toast-message');
  }

  async goto() {
    await this.page.goto(this.url);
  }

  async addCustomer(name: string) {
    await this.nameInput.fill(name);
    await this.saveButton.click();
  }
}
