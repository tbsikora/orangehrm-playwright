import type { Locator, Page } from '@playwright/test';
import { URLS } from '../const/selectors/urls';

export class ApplyLeavePage {
  readonly page: Page;
  readonly url = URLS.applyLeave;
  readonly leaveTypeSelect: Locator;
  readonly fromDateInput: Locator;
  readonly toDateInput: Locator;
  readonly applyButton: Locator;
  readonly toastTitle: Locator;
  readonly toastMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.leaveTypeSelect = page.getByTestId('leave-type-select');
    this.fromDateInput = page.locator('input[data-testid="leave-from-date-input"]');
    this.toDateInput = page.locator('input[data-testid="leave-to-date-input"]');
    this.applyButton = page.getByTestId('save-button');
    this.toastTitle = page.getByTestId('toast-title');
    this.toastMessage = page.getByTestId('toast-message');
  }

  async goto() {
    await this.page.goto(this.url);
  }

  async selectLeaveType(name: string) {
    await this.leaveTypeSelect.click();
    await this.page.locator('.oxd-select-option').filter({ hasText: name }).click();
  }

  async setFromDateToday() {
    await this.fromDateInput.click();
    await this.page
      .locator('.oxd-date-wrapper', { has: this.fromDateInput })
      .getByText('Today', { exact: true })
      .click();
  }

  async setToDateToday() {
    await this.toDateInput.click();
    await this.page
      .locator('.oxd-date-wrapper', { has: this.toDateInput })
      .getByText('Today', { exact: true })
      .click();
  }
}
