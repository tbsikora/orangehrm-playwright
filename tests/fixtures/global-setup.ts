import { chromium } from '@playwright/test';
import { API } from '../const/selectors/urls';
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;
const CLAIM_EVENT_NAME = 'Business Travel';

export default async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL: 'http://localhost:8080' });
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);

  await loginPage.goto();
  await loginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);
  await page.waitForURL('**' + dashboardPage.url);

  const leavePeriodResponse = await page.request.get(API.leavePeriod);
  const leavePeriodBody = await leavePeriodResponse.json();
  if (!leavePeriodBody.meta.leavePeriodDefined) {
    await page.request.put(API.leavePeriod, {
      data: { startMonth: 1, startDay: 1 },
    });
  }

  const entitlementsResponse = await page.request.get(API.leaveEntitlements);
  const entitlementsBody = await entitlementsResponse.json();
  if (entitlementsBody.meta.total === 0) {
    const leaveTypesResponse = await page.request.get(API.leaveTypes, {
      params: { limit: 1 },
    });
    const leaveTypesBody = await leaveTypesResponse.json();
    let leaveTypeId = leaveTypesBody.data[0]?.id;
    if (!leaveTypeId) {
      const leaveTypeResponse = await page.request.post(API.leaveTypes, {
        data: { name: 'Annual Leave', situational: false },
      });
      leaveTypeId = (await leaveTypeResponse.json()).data.id;
    }

    const userResponse = await page.request.get(API.adminUsers, {
      params: { username: ADMIN_USERNAME },
    });
    const userBody = await userResponse.json();
    const empNumber = userBody.data[0].employee.empNumber;

    const currentYear = new Date().getFullYear();
    await page.request.post(API.leaveEntitlements, {
      data: {
        empNumber,
        leaveTypeId,
        fromDate: currentYear + '-01-01',
        toDate: currentYear + '-12-31',
        entitlement: 20,
        bulkAssign: false,
      },
    });
  }

  const claimEventsResponse = await page.request.get(API.claimEvents, {
    params: { name: CLAIM_EVENT_NAME },
  });
  const claimEventsBody = await claimEventsResponse.json();
  if (claimEventsBody.data.length === 0) {
    await page.request.post(API.claimEvents, {
      data: { name: CLAIM_EVENT_NAME, status: true },
    });
  }

  await page.request.put(API.timeSheetPeriod, { data: { startDay: '1' } });

  await browser.close();
}
