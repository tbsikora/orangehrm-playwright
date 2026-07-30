import { expect, test } from '@playwright/test';
import { API, URLS } from './const/selectors/urls';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { NavBar } from './pages/NavBar';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

const MODULES = [
  { name: 'admin', title: 'Admin' },
  { name: 'pim', title: 'PIM' },
  { name: 'leave', title: 'Leave' },
  { name: 'time', title: 'Time' },
  { name: 'recruitment', title: 'Recruitment' },
  { name: 'my-info', title: 'PIM' },
  { name: 'performance', title: 'Performance' },
  { name: 'directory', title: 'Directory' },
  { name: 'claim', title: 'Claim' },
  { name: 'buzz', title: 'Buzz' },
];

test.describe('Module navigation smoke', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage();
    await loginPage.goto();
    await loginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);
    await expect(page).toHaveURL(dashboardPage.url);
  });

  for (const { name, title } of MODULES) {
    test(`${name} module loads`, async ({ page }) => {
      const navBar = new NavBar(page);
      await navBar.goToModule(name);
      await expect(navBar.pageTitle).toHaveText(title);
    });
  }

  test('maintenance module requires re-entering admin credentials', async ({ page }) => {
    const navBar = new NavBar(page);
    await navBar.goToModule('maintenance');
    await expect(page.getByText('Administrator Access')).toBeVisible();
  });

  test('Leave list loads leave periods without error', async ({ page }) => {
    const responsePromise = page.waitForResponse((response) =>
      response.url().includes(API.leavePeriods),
    );
    await page.goto(URLS.leaveList);
    const response = await responsePromise;

    expect(response.status()).toBe(200);
  });

  test('Leave entitlements loads leave periods without error', async ({ page }) => {
    const responsePromise = page.waitForResponse((response) =>
      response.url().includes(API.leavePeriods),
    );
    await page.goto(URLS.leaveEntitlements);
    const response = await responsePromise;

    expect(response.status()).toBe(200);
  });
});
