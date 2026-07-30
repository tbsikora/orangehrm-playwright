import type { Locator, Page } from '@playwright/test';
import { URLS } from '../const/selectors/urls';

export class EmployeeListPage {
  readonly page: Page;
  readonly url = URLS.employeeList;
  readonly nameFilter: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  readonly addButton: Locator;
  readonly tableContainer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameFilter = page.getByTestId('employee-name-filter');
    this.searchButton = page.getByTestId('employee-search-button');
    this.resetButton = page.getByTestId('employee-reset-button');
    this.addButton = page.getByTestId('add-employee-button');
    this.tableContainer = page.getByTestId('employee-table-container');
  }

  async goto() {
    await this.page.goto(this.url);
  }

  async searchByName(name: string) {
    await this.nameFilter.fill(name);
    await this.searchButton.click();
  }

  row(index: number) {
    return this.page.getByTestId(`table-row-${index}`);
  }
}
