import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';
import { API } from './const/selectors/urls';
import { BuzzPage } from './pages/BuzzPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

test('Posting to buzz makes it appear in the feed', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage();
  const buzzPage = new BuzzPage(page);
  const message = faker.lorem.sentence();

  await loginPage.goto();
  await loginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);
  await expect(page).toHaveURL(dashboardPage.url);

  await buzzPage.goto();
  await buzzPage.writePost(message);

  const responsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' && response.url().includes(API.buzzPosts),
  );
  await buzzPage.postButton.click();
  const response = await responsePromise;
  expect(response.status()).toBe(200);

  await expect(page.getByText(message)).toBeVisible();
});
