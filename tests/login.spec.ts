import { expect, test } from '@playwright/test';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { NavBar } from './pages/NavBar';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

test.describe('Login', () => {
  test('Valid credentials redirect to the dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const navBar = new NavBar(page);

    await loginPage.goto();
    await loginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);

    await expect(page).toHaveURL(dashboardPage.url);
    await expect(navBar.pageTitle).toHaveText('Dashboard');
  });

  test('Wrong password shows "Invalid credentials" and stays on the login page', async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login(ADMIN_USERNAME, 'wrong-password');

    await loginPage.expectInvalidCredentials();
    await expect(page).toHaveURL(loginPage.url);
  });

  test('Unknown username shows "Invalid credentials"', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('no-such-user', 'whatever123');

    await loginPage.expectInvalidCredentials();
  });

  test('Empty submission is blocked client-side with Required errors', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.submitButton.click();

    await expect(loginPage.requiredError('username')).toBeVisible();
    await expect(loginPage.requiredError('password')).toBeVisible();
    await expect(page).toHaveURL(loginPage.url);
  });

  test('Session persists across a reload after login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);
    const navBar = new NavBar(page);

    await loginPage.goto();
    await loginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);
    await expect(page).toHaveURL(dashboardPage.url);

    await page.reload();

    await expect(navBar.pageTitle).toHaveText('Dashboard');
  });
});
