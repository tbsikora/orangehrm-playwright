import type { Locator, Page } from '@playwright/test';
import { URLS } from '../const/selectors/urls';

export class AddEmployeePage {
  readonly page: Page;
  readonly url = URLS.addEmployee;
  readonly firstNameInput: Locator;
  readonly middleNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly saveButton: Locator;
  readonly toastTitle: Locator;
  readonly toastMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.getByTestId('firstName-input');
    this.middleNameInput = page.getByTestId('middleName-input');
    this.lastNameInput = page.getByTestId('lastName-input');
    this.saveButton = page.getByTestId('save-button');
    this.toastTitle = page.getByTestId('toast-title');
    this.toastMessage = page.getByTestId('toast-message');
  }

  async goto() {
    await this.page.goto(this.url);
  }

  async addEmployee(firstName: string, lastName: string) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.saveButton.click();
  }
}
