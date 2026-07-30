import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';
import { API } from './const/selectors/urls';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { NavBar } from './pages/NavBar';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;
const EMPLOYEE_ROLE_ID = 2;
const EMPLOYEE_USERNAME = faker.internet.username();
const EMPLOYEE_PASSWORD = faker.internet.password({ length: 12 }) + 'Aa1!';

const ADMIN_ONLY_MODULES = ['admin', 'pim', 'recruitment', 'maintenance'];
const EMPLOYEE_VISIBLE_MODULES = [
  'leave',
  'time',
  'my-info',
  'performance',
  'dashboard',
  'directory',
  'claim',
  'buzz',
];

let empNumber: number;
let userId: number;

test.describe('Employee vs Admin access control', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage();

    await loginPage.goto();
    await loginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);
    await expect(page).toHaveURL(dashboardPage.url);

    const employeeResponse = await page.request.post(API.pimEmployees, {
      data: { firstName: faker.person.firstName(), lastName: faker.person.lastName() },
    });
    empNumber = (await employeeResponse.json()).data.empNumber;

    const userResponse = await page.request.post(API.adminUsers, {
      data: {
        username: EMPLOYEE_USERNAME,
        password: EMPLOYEE_PASSWORD,
        userRoleId: EMPLOYEE_ROLE_ID,
        empNumber,
        status: true,
      },
    });
    userId = (await userResponse.json()).data.id;

    await context.close();
  });

  test.afterAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage();

    await loginPage.goto();
    await loginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);
    await expect(page).toHaveURL(dashboardPage.url);

    await page.request.delete(API.adminUsers, { data: { ids: [userId] } });
    await page.request.delete(API.pimEmployees, {
      data: { ids: [empNumber] },
    });

    await context.close();
  });

  test('admin sees the admin-only modules', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage();
    const navBar = new NavBar(page);

    await loginPage.goto();
    await loginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);
    await expect(page).toHaveURL(dashboardPage.url);

    for (const name of ADMIN_ONLY_MODULES) {
      await expect(navBar.menuItem(name)).toBeVisible();
    }
  });

  test('employee does not see the admin-only modules', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage();
    const navBar = new NavBar(page);

    await loginPage.goto();
    await loginPage.login(EMPLOYEE_USERNAME, EMPLOYEE_PASSWORD);
    await expect(page).toHaveURL(dashboardPage.url);

    for (const name of EMPLOYEE_VISIBLE_MODULES) {
      await expect(navBar.menuItem(name)).toBeVisible();
    }
    for (const name of ADMIN_ONLY_MODULES) {
      await expect(navBar.menuItem(name)).toHaveCount(0);
    }
  });

  test('employee gets a 403 from an admin-only API endpoint', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage();

    await loginPage.goto();
    await loginPage.login(EMPLOYEE_USERNAME, EMPLOYEE_PASSWORD);
    await expect(page).toHaveURL(dashboardPage.url);

    const response = await page.request.get(API.adminUsers);
    expect(response.status()).toBe(403);
  });
});
