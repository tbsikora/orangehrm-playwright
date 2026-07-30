import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';
import { API } from './const/selectors/urls';
import { AddCandidatePage } from './pages/AddCandidatePage';
import { CandidateListPage } from './pages/CandidateListPage';
import { DashboardPage } from './pages/DashboardPage';
import { LoginPage } from './pages/LoginPage';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

test('adding a candidate makes them searchable in the candidate list', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage();
  const addCandidatePage = new AddCandidatePage(page);
  const candidateListPage = new CandidateListPage(page);
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName() + faker.string.alphanumeric(6);
  const email = faker.internet.email({ firstName, lastName });

  await loginPage.goto();
  await loginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);
  await expect(page).toHaveURL(dashboardPage.url);

  await addCandidatePage.goto();
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes(API.recruitmentCandidates) &&
      response.request().method() === 'POST',
  );
  await addCandidatePage.addCandidate(firstName, lastName, email);
  const response = await responsePromise;
  const candidateId = (await response.json()).data.id;

  await candidateListPage.goto();
  await candidateListPage.searchByName(firstName + ' ' + lastName);
  await expect(candidateListPage.rowContaining(lastName)).toBeVisible();

  await page.request.delete(API.recruitmentCandidates, {
    data: { ids: [candidateId] },
  });
});
