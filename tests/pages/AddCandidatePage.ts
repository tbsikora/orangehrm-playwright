import type { Locator, Page } from '@playwright/test';
import { URLS } from '../const/selectors/urls';

export class AddCandidatePage {
  readonly page: Page;
  readonly url = URLS.addCandidate;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.getByTestId('firstName-input');
    this.lastNameInput = page.getByTestId('lastName-input');
    this.emailInput = page.getByTestId('candidate-email-input');
    this.saveButton = page.getByTestId('save-button');
  }

  async goto() {
    await this.page.goto(this.url);
  }

  async addCandidate(firstName: string, lastName: string, email: string) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.emailInput.fill(email);
    await this.saveButton.click();
  }
}
