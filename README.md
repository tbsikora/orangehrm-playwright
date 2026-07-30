# OrangeHRM Playwright Tests

This repo contains end-to-end tests for [OrangeHRM](https://www.orangehrm.com/) 5.9, an open-source HR application. The tests are written with [Playwright](https://playwright.dev/).

The application runs in Docker. Tests run against this local Docker instance, not against any external environment.

## Quick start

```bash
npm install
npx playwright install --with-deps chromium
docker/up.sh
npx playwright test
```

`docker/up.sh` builds and starts the application and the database. The database seeds itself automatically on first boot (details below). `npx playwright test` then runs the full suite of 32 tests.

## The main problem: no test ids

The OrangeHRM application does not expose any `data-testid` attributes. This is a common situation in real-world testing, since developer teams do not always add test ids for the test team.

There were two standard options:
1. Locate elements by CSS class or visible text. This is fragile and breaks when styling or copy changes.
2. Accept unstable selectors and write brittle tests.

Instead, this project **patches the application itself** to add `data-testid` attributes, as a Docker build step. The upstream OrangeHRM source is never modified. Only the local image used for testing is patched.

### How the patching works

Two categories of code needed patching:

**1. Application source code** (`docker/patches/client-testid.patch`)
A standard git-style diff that adds `data-testid="..."` to Vue template files, for example the login form or the "Add Employee" button. Readable and reviewable like any other code change.

**2. A third-party UI library** (`docker/patch-oxd-testids.js`)
OrangeHRM depends on `@ohrm/oxd`, a UI component library distributed as pre-built, minified JavaScript with no accessible source. This script matches exact strings inside the minified bundle and inserts `data-testid` at those points. Because string-matching against minified code is inherently more fragile than a source diff, the script is strict by design: if OrangeHRM ever updates this library and the bundle output changes shape, the Docker build **fails loudly** instead of silently shipping an image with missing test ids.

Both patches are applied inside `docker/Dockerfile` during the image build.

### Lesson learned: verify in the browser, not in the bundle

During development, a patch appeared correct when checked with `grep` against the built JavaScript file, but the `data-testid` was not present on the rendered page. The cause: Docker was serving a stale, cached copy of the application from a leftover volume instead of the newly built image.

The fix has two parts. First, `docker/up.sh` always rebuilds the image and forces a fresh volume (`--renew-anon-volumes`). Second, and more importantly: every new test id is verified live in a real browser before any test is written against it. A correct-looking bundle is not proof of a correct DOM.

This same verification discipline caught two further application issues:
- A search field that appeared to filter results but silently ignored invalid input and returned the full, unfiltered list.
- A Vue component that did not accept text set through Playwright's standard `.fill()` call, and required a different method to set its value correctly.

## The database: one seed, zero manual steps

The database seeds itself automatically the first time the application starts. Two SQL files are applied in order:

1. `seed.sql` - the base OrangeHRM demo data set (employees, admin configuration, and so on)
2. `docker/init/02-admin-fixup.sql` - renames the seed's default user to `admin` and sets a password that satisfies the application's own strength policy, so the real security check stays enabled instead of being switched off for convenience

This relies on a standard Docker/MariaDB mechanism: any `.sql` file placed in `docker-entrypoint-initdb.d/` runs automatically, but only on a genuinely empty database. Once data exists, these files are skipped on every subsequent start. As a result:
- A fresh environment, such as a CI runner, seeds itself with no manual steps.
- An existing local database is never touched or reset unexpectedly.

This gap was found while preparing the project for CI. The database had originally been seeded by hand, once, and that step had never been captured as code, only as a note in an internal report. GitHub Actions provisions a completely empty machine on every run, so this manual step would have caused the first CI run to fail. Verifying the fix required deliberately wiping the local database (`docker compose down -v`) and confirming the full suite still passed from a clean state, twice in a row, before it was trusted.

## How the tests are organized

### Page Object Model (POM)

Every page in the application has a corresponding class in `tests/pages/`. For example, `tests/pages/LoginPage.ts` encapsulates the login page: its URL, its input fields, and a `login()` method. Test files never query elements directly; they always go through a page object.

This matters in practice: if OrangeHRM changes how the login button is implemented, exactly one file needs updating, not every test that logs in.

### One clear responsibility per test file

Each file under `tests/` covers a single concern:

| File | What it checks |
|---|---|
| `login.spec.ts` | Login succeeds, and fails correctly with wrong credentials |
| `logout.spec.ts` | Logout actually ends the session |
| `auth-guard.spec.ts` | Unauthenticated users are redirected and cannot reach protected pages |
| `navigation.spec.ts` | All 12 modules in the side menu load correctly |
| `access-control.spec.ts` | An Admin account sees everything; a standard Employee account does not |
| `pim-add-employee.spec.ts`, `recruitment.spec.ts`, `time.spec.ts`, `leave.spec.ts`, `claim.spec.ts`, `buzz.spec.ts` | A real create-then-verify flow per module |
| `admin.spec.ts`, `performance.spec.ts`, `directory.spec.ts` | Search screens behave correctly |

32 tests in total, across 14 files.

### Test data: generated, never hardcoded

Names, emails, and messages used in tests are generated with [`@faker-js/faker`](https://fakerjs.dev/), a library for realistic random data. This provides two benefits:
- Tests never collide with each other through reuse of the same fixed value.
- No repeated placeholder data, such as `"Test User 123"`, scattered across the codebase.

Login credentials are never written in test code either. They are read from environment variables (`process.env.ADMIN_USERNAME`), sourced from a local `.env` file (see `.env.example`) or from CI configuration. No credential is ever committed to the repository.

### One shared source of truth for URLs

Every page URL and API endpoint used by the tests is defined once, in `tests/const/selectors/urls.ts`. Test files import from this file instead of duplicating path strings. A route rename in OrangeHRM requires a single-line change.

### Tests clean up after themselves

Every test that creates data (an employee, a candidate, a customer, and so on) deletes it again at the end, using the application's own API. Running the suite repeatedly leaves the database in the same state as before the run.

Two modules do not support true deletion: Leave requests and Buzz posts can only be cancelled, not removed. This reflects an actual constraint of the application, not a gap in the tests, and is documented as such rather than worked around silently.

### Safe under parallel execution

Playwright runs tests in parallel by default. Early versions of some tests assumed a newly created item would be the first row in its table, which holds true in isolation but breaks the moment another test creates data concurrently. These were rewritten to locate items by their own unique content instead of by position. Every test in this suite was deliberately stress-tested under heavy parallel execution before being considered complete.

## Continuous Integration (CI)

`.github/workflows/e2e.yml` runs the full suite automatically on every push and every pull request, using GitHub Actions. The pipeline:

1. Builds the patched Docker image
2. Starts the application and database (self-seeding, as described above)
3. Waits until the application actually responds, not merely until the container has started
4. Runs all 32 tests
5. Uploads the HTML test report as a downloadable artifact, regardless of outcome

## A short list of real bugs found during this work

- **A 500 server error** on the Leave module, caused by missing setup data. Root-caused to the exact database table responsible, then fixed properly rather than worked around.
- **A broken search filter** in the company Directory that silently returned every employee instead of filtering, previously hidden by the fact that the seed database only ever contained one employee.
- **Inconsistent authorization responses**: some blocked actions return a clean `403`, one returns an empty list instead of an error, and one returns a `422` validation error that reads as a bad request rather than a permissions failure. All three are documented so future tests assert the correct behavior per endpoint.
- **An unnecessary security trade-off in the test setup itself**: an earlier version of the database fix-up disabled the application's password-strength check to make a weak admin password work. Reading the actual authentication source (`LocalAuthProvider.php`) showed this check runs at login, not at password creation, and that the password only needs to satisfy the application's own policy - including its zxcvbn-based strength score, verified directly against the application's own scoring library rather than assumed. The fix-up now uses a password that passes the real check, so the security setting stays on.

## Project structure

```
tests/
  const/selectors/urls.ts   single source of truth for every URL
  fixtures/global-setup.ts  one-time setup that runs before any test
  pages/                    one class per page (Page Object Model)
  *.spec.ts                 the tests themselves, one file per feature
docker/
  Dockerfile                builds the patched application image
  patches/                  application source code patches (readable diffs)
  patch-oxd-testids.js      patches the third-party UI library
  init/                     database seed fix-up, runs on first boot
.github/workflows/e2e.yml   CI pipeline
```
