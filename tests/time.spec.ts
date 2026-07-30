import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';
import { API } from './const/selectors/urls';
import { AddCustomerPage } from './pages/AddCustomerPage';
import { CustomerListPage } from './pages/CustomerListPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

test('adding a customer makes them appear in the customer list', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage();
  const addCustomerPage = new AddCustomerPage(page);
  const customerListPage = new CustomerListPage(page);
  const name = faker.company.name() + ' ' + faker.string.alphanumeric(6);

  await loginPage.goto();
  await loginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);
  await expect(page).toHaveURL(dashboardPage.url);

  await addCustomerPage.goto();
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes(API.timeCustomers) && response.request().method() === 'POST',
  );
  await addCustomerPage.addCustomer(name);
  const response = await responsePromise;
  const customerId = (await response.json()).data.id;

  await expect(addCustomerPage.toastTitle).toHaveText('Success');
  await expect(addCustomerPage.toastMessage).toHaveText('Successfully Saved');

  await customerListPage.goto();
  await expect(customerListPage.rowContaining(name)).toBeVisible();

  await page.request.delete(API.timeCustomers, {
    data: { ids: [customerId] },
  });
});
