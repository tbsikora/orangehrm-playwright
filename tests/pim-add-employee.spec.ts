import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';
import { API } from './const/selectors/urls';
import { AddEmployeePage } from './pages/AddEmployeePage';
import { DashboardPage } from './pages/DashboardPage';
import { EmployeeListPage } from './pages/EmployeeListPage';
import { LoginPage } from './pages/LoginPage';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

test('adding an employee makes them searchable in the employee list', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage();
  const addEmployeePage = new AddEmployeePage(page);
  const employeeListPage = new EmployeeListPage(page);
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  await loginPage.goto();
  await loginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);
  await expect(page).toHaveURL(dashboardPage.url);

  await addEmployeePage.goto();
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes(API.pimEmployees) &&
      response.request().method() === 'POST',
  );
  await addEmployeePage.addEmployee(firstName, lastName);
  const response = await responsePromise;
  const empNumber = (await response.json()).data.empNumber;

  await expect(addEmployeePage.toastTitle).toHaveText('Success');
  await expect(addEmployeePage.toastMessage).toHaveText('Successfully Saved');

  await employeeListPage.goto();
  await employeeListPage.searchByName(firstName + ' ' + lastName);
  await expect(employeeListPage.row(0)).toContainText(lastName);

  await page.request.delete(API.pimEmployees, {
    data: { ids: [empNumber] },
  });
});
