import { expect, test } from '@playwright/test';
import { API } from './const/selectors/urls';
import { ApplyLeavePage } from './pages/ApplyLeavePage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { MyLeaveListPage } from './pages/MyLeaveListPage';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

test('applying for leave makes it appear in My Leave List', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage();
  const applyLeavePage = new ApplyLeavePage(page);
  const myLeaveListPage = new MyLeaveListPage(page);
  const today = new Date().toISOString().slice(0, 10);

  await loginPage.goto();
  await loginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);
  await expect(page).toHaveURL(dashboardPage.url);

  const existingResponse = await page.request.get(API.leaveRequests, {
    params: { fromDate: today, toDate: today },
  });
  const existingRequests = (await existingResponse.json()).data;
  for (const existingRequest of existingRequests) {
    if (existingRequest.allowedActions.some((a: { action: string }) => a.action === 'CANCEL')) {
      await page.request.put(API.leaveRequest(existingRequest.id), {
        data: { action: 'CANCEL' },
      });
    }
  }

  await applyLeavePage.goto();
  await applyLeavePage.selectLeaveType('Annual Leave');
  await applyLeavePage.setFromDateToday();
  await applyLeavePage.setToDateToday();

  const responsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' && response.url().includes(API.leaveRequests),
  );
  await applyLeavePage.applyButton.click();
  const response = await responsePromise;
  const leaveRequestId = (await response.json()).data.id;

  await expect(applyLeavePage.toastTitle).toHaveText('Success');
  await expect(applyLeavePage.toastMessage).toHaveText('Successfully Saved');

  await myLeaveListPage.goto();
  await expect(myLeaveListPage.rowContaining(today).first()).toBeVisible();

  await page.request.put(API.leaveRequest(leaveRequestId), {
    data: { action: 'CANCEL' },
  });
});
