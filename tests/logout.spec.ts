import { expect, test } from '@playwright/test';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { NavBar } from './pages/NavBar';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

test('logout returns to the login page and ends the session', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage();
  const navBar = new NavBar(page);

  await loginPage.goto();
  await loginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);
  await expect(page).toHaveURL(dashboardPage.url);

  await navBar.logout();

  await expect(page).toHaveURL(loginPage.url);

  await page.goto(dashboardPage.url);
  await expect(page).toHaveURL(loginPage.url);
});
