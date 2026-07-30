import { expect, test } from '@playwright/test';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { NavBar } from './pages/NavBar';
import { ReviewSearchPage } from './pages/ReviewSearchPage';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

test('Searching manage reviews by employee name does not error', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage();
  const navBar = new NavBar(page);
  const reviewSearchPage = new ReviewSearchPage(page);

  await loginPage.goto();
  await loginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);
  await expect(page).toHaveURL(dashboardPage.url);

  await reviewSearchPage.goto();
  await reviewSearchPage.employeeNameFilter.fill('Tomasz');
  await reviewSearchPage.searchButton.click();

  await expect(navBar.pageSubtitle).toHaveText('Manage Reviews');
});
