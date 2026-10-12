import { expect, test } from '@playwright/test';
import { API } from './const/selectors/urls';
import { ApplyLeavePage } from './pages/ApplyLeavePage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';
import { MyLeaveListPage } from './pages/MyLeaveListPage';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

// Leave on a weekend is rejected with "No Working Days Selected", so pick a
// weekday: today, else the next Monday, else (if that crosses into a year with
// no entitlement) the previous Friday.
function workingDay(now = new Date()): string {
  const shift = (days: number) =>
    new Date(now.getFullYear(), now.getMonth(), now.getDate() + days);
  let date = now;
  if (now.getDay() === 6 || now.getDay() === 0) {
    const nextMonday = shift(now.getDay() === 6 ? 2 : 1);
    date = nextMonday.getFullYear() === now.getFullYear()
      ? nextMonday
      : shift(now.getDay() === 6 ? -1 : -2);
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

test('Applying for leave makes it appear in My Leave List', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);
  const applyLeavePage = new ApplyLeavePage(page);
  const myLeaveListPage = new MyLeaveListPage(page);
  const leaveDate = workingDay();

  await loginPage.goto();
  await loginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);
  await expect(page).toHaveURL(dashboardPage.url);

  const existingResponse = await page.request.get(API.leaveRequests, {
    params: { fromDate: leaveDate, toDate: leaveDate },
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
  await applyLeavePage.setDates(leaveDate, leaveDate);

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
  await expect(myLeaveListPage.rowContaining(leaveDate).first()).toBeVisible();

  await page.request.put(API.leaveRequest(leaveRequestId), {
    data: { action: 'CANCEL' },
  });
});
