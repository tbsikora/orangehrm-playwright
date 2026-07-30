import { expect, type Locator, type Page } from '@playwright/test';
import { URLS } from '../const/selectors/urls';

export class LoginPage {
  readonly page: Page;
  readonly url = URLS.login;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByTestId('login-username-input');
    this.passwordInput = page.getByTestId('login-password-input');
    this.submitButton = page.getByTestId('login-submit-button');
    this.errorAlert = page.getByTestId('login-error-alert');
  }

  async goto() {
    await this.page.goto(this.url);
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  requiredError(field: 'username' | 'password') {
    const input = field === 'username' ? this.usernameInput : this.passwordInput;
    return this.page
      .locator('.oxd-input-group', { has: input })
      .getByText('Required');
  }

  async expectInvalidCredentials() {
    await expect(this.errorAlert).toBeVisible();
    await expect(this.errorAlert).toHaveText('Invalid credentials');
  }
}
