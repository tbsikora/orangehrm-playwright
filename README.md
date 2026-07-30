# OrangeHRM E2E Test Suite - Playwright + TypeScript

End-to-end test suite for [OrangeHRM](https://www.orangehrm.com/) 5.9, an open-source HR platform. 32 tests in 14 spec files, covering authentication, authorization, navigation, and create then verify flow per each module.

The suite runs unattended in CI from a completely empty machine: the environment, the patched application image, and the database seed are all defined as code. Nothing is set up by hand.

**Why OrangeHRM and not a demo site.** It is a real business application with a non-trivial domain, an API, role-based permissions. 
That is much closer to production conditions than any practice site, and it forced real decisions rather than tutorial ones.

## What this repo demonstrates

| Capability | Where to see it |
|---|---|
| Playwright + TypeScript suite built from scratch | `tests/`, `playwright.config.ts` |
| Stable locators in an app that ships none | `docker/patches/`, `docker/patch-oxd-testids.js` |
| Maintainable structure (Page Object Model) | `tests/pages/` |
| Environment as code, reproducible from zero | `docker/`, `docker/init/` |
| CI on every push and PR, empty runner to green suite | `.github/workflows/e2e.yml` |
| API used inside tests for setup and teardown | cleanup in each `*.spec.ts` |
| Parallel-safe test design | `directory.spec.ts`, `pim-add-employee.spec.ts` |
| Secrets handling | `.env.example`, CI secrets — no credentials in code |

## Quick start

```bash
cp .env.example .env
npm install
npx playwright install --with-deps chromium
docker/up.sh 
npx playwright test
```

Credentials are read from the environment, never from test code.

## Test IDs: the application is patched, not the tests

OrangeHRM exposes no `data-testid` attributes, so the decission has been made that `data-testid` attributes will be injected into the application during the Docker image build. Upstream source is never modified, only the local test image is patched.

## Database: self-seeding, no manual steps

The SQL file is applied on first boot: `seed.sql` — base OrangeHRM demo data (employees, admin configuration).

## Test organization

### Page Object Model

Each page has one class in `tests/pages/`. Spec files never query the DOM directly.

### One area per spec file

| File | Coverage |
|---|---|
| `login.spec.ts` | Successful login; correct failure on bad credentials |
| `logout.spec.ts` | Session is actually terminated |
| `auth-guard.spec.ts` | Unauthenticated requests are redirected; protected pages unreachable |
| `navigation.spec.ts` | All 12 side-menu modules load |
| `access-control.spec.ts` | Admin sees all modules; standard Employee does not |
| `pim-add-employee.spec.ts`, `recruitment.spec.ts`, `time.spec.ts`, `leave.spec.ts`, `claim.spec.ts`, `buzz.spec.ts` | Create-then-verify flow per module |
| `admin.spec.ts`, `performance.spec.ts`, `directory.spec.ts` | Search screen behaviour |

### Test data and credentials

- Names, emails, and post content are generated with `@faker-js/faker`. No fixed values, so parallel tests cannot collide on the same record.
- Credentials come from environment variables (`process.env.ADMIN_USERNAME`), supplied by `.env` locally or by CI secrets. Nothing is committed.

### Single source of truth for URLs

Every page URL and API endpoint lives in `tests/const/selectors/urls.ts`. A route rename in OrangeHRM is a one-line change.

### Cleanup

Every test that creates data (employee, candidate, customer) deletes it through the application's own API at the end of the test. Repeated suite runs leave the database in its pre-run state.

### Parallel safety

Playwright runs specs in parallel. Early versions of several tests assumed a new record would be the first table row — true in isolation, false as soon as another test writes concurrently. They were rewritten to locate records by their own unique generated content. The whole suite was then run repeatedly under full parallelism before being considered done.

## CI

`.github/workflows/e2e.yml` runs on every push and pull request:

1. Build the patched Docker image.
2. Start app and database (self-seeding).
3. Poll until the application actually responds — not just until the container is up.
4. Run all tests.
5. Upload the HTML report as an artifact, pass or fail.

## Project structure

```
tests/
  const/selectors/urls.ts   all URLs and API endpoints
  fixtures/global-setup.ts  one-time setup before the suite
  pages/                    one class per page (POM)
  *.spec.ts                 specs, one file per feature
docker/
  Dockerfile                builds the patched image
  up.sh                     rebuild + fresh volumes + start
  patches/                  Vue template diffs
  patch-oxd-testids.js      patches the minified oxd bundle
  init/                     DB fix-up, first boot only
.github/workflows/e2e.yml   CI pipeline
```

## Author

Built by Tomasz Sikora — Senior QA Engineer, BEng in Computer Science, ISTQB CTFL
