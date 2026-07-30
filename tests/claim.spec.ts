import { expect, test } from '@playwright/test';
import { API } from './const/selectors/urls';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { MyClaimsPage } from './pages/MyClaimsPage';
import { SubmitClaimPage } from './pages/SubmitClaimPage';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

test('submitting a claim makes it appear in My Claims', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage();
  const submitClaimPage = new SubmitClaimPage(page);
  const myClaimsPage = new MyClaimsPage(page);

  await loginPage.goto();
  await loginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);
  await expect(page).toHaveURL(dashboardPage.url);

  await submitClaimPage.goto();
  await submitClaimPage.selectEvent('Business Travel');
  await submitClaimPage.selectCurrency('United States Dollar');

  const responsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' && response.url().includes(API.claimRequests),
  );
  await submitClaimPage.createButton.click();
  const response = await responsePromise;
  const claim = (await response.json()).data;

  await myClaimsPage.goto();
  await expect(myClaimsPage.rowContaining(claim.referenceId)).toBeVisible();

  await page.request.put(API.claimRequestAction(claim.id), {
    data: { action: 'CANCEL' },
  });
});
