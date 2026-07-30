import { expect, test } from '@playwright/test';
import { EmployeeListPage } from './pages/EmployeeListPage';
import { LoginPage } from './pages/LoginPage';

test('visiting a protected page while unauthenticated redirects to login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const employeeListPage = new EmployeeListPage(page);

  await page.goto(employeeListPage.url);

  await expect(page).toHaveURL(loginPage.url);
});
