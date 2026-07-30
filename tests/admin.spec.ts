import { expect, test } from '@playwright/test';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { SystemUserListPage } from './pages/SystemUserListPage';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

test('Searching the system user list by username finds the admin account', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage();
  const systemUserListPage = new SystemUserListPage(page);

  await loginPage.goto();
  await loginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);
  await expect(page).toHaveURL(dashboardPage.url);

  await systemUserListPage.goto();
  await systemUserListPage.searchByUsername(ADMIN_USERNAME);

  await expect(systemUserListPage.rowContaining(ADMIN_USERNAME)).toBeVisible();
});
