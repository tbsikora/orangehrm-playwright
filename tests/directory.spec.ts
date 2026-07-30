import { expect, test } from '@playwright/test';
import { DashboardPage } from './pages/DashboardPage';
import { DirectoryPage } from './pages/DirectoryPage';
import { LoginPage } from './pages/LoginPage';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

test('searching the directory by employee name finds a match', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage();
  const directoryPage = new DirectoryPage(page);

  await loginPage.goto();
  await loginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);
  await expect(page).toHaveURL(dashboardPage.url);

  await directoryPage.goto();
  await directoryPage.searchByName('Tomasz');

  await expect(
    page.locator('.orangehrm-directory-card-header').filter({ hasText: 'Tomasz Sikora' }),
  ).toBeVisible();
});
