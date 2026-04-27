# About E2E test framework

This document explains how to grow and maintain end-to-end tests in this project.

## Scripts reference

The project already defines scripts in the `package.json` file that cover the common E2E workflows:

- `npm run test:e2e`
  - Runs the full Playwright suite in default (headless) mode.
  - Use this for CI-like local validation and regular regression checks.
- `npm run test:e2e:ui`
  - Opens Playwright UI mode for interactive debugging and selective reruns.
  - Use this while developing tests or investigating unstable behavior.
- `npm run test:e2e:headed`
  - Runs tests with a visible browser window (`--headed`).
  - Use this when you need to visually inspect UI timing, animations, or interaction issues.
- `npm run test:e2e:with-environment-startup`
  - Starts local hot-reload environment (`bash ./local-hotreload.sh`) and then runs Playwright tests.
  - Use this when tests depend on a freshly started local app stack and you want one command to run both steps.

## Interpreting test outcomes

Typical statuses and what they mean:
- **Passed**: all assertions succeeded in the configured attempts;
- **Failed**: assertions did not pass; usually deterministic and reproducible until fixed;
- **Timed out**: test or hook exceeded allowed time; commonly indicates missing sync points, slow environment, or deadlock;
- **Skipped**: intentionally not executed (tag, condition, or temporary disablement);
- **Flaky**: a test failed in one attempt but passed on retry.

## Expanding test coverage and basic patterns

The fastest way to expand coverage is to map tests to user-critical flows first, then fill in edge cases.

Use these basic test patterns:
- **Happy path tests**: verify the most common successful user journey end-to-end;
- **Negative tests**: validate expected behavior when inputs are invalid, data is missing, or APIs fail;
- **State transition tests**: assert behavior across navigation, refresh, back/forward, and reload flows;
- **Data-driven tests**: iterate through small sets of meaningful input variations using parameterized cases.

Practical advices:
- Keep each test focused on one behavior;
- Add at least one E2E regression for every critical bug fix;
- Prefer maintainable test intent over raw script length;
- Prefer stable selectors (`data-testid`) over brittle CSS/text selectors;
- Reuse setup through utils/helpers, but keep assertions explicit in each test. The `e2e/` folder is presented in the `utils/` folder for such purposes;
- Add retries/waits only when tied to a known async signal (visualisation creation, for example), not fixed sleeps.

## Maintaining the framework locally

Treat local E2E tooling as part of the development environment.

Recommendations:
1. Install project dependencies after pulling changes:
   - `npm install`
2. Update Playwright/browser binaries when needed:
   - `npx playwright install`
3. Run a fast smoke check locally:
   - `npx playwright test e2e/example.spec.ts`

How to update Playwright and browser versions:
- Update the Playwright package version in the project dependency set (`package.json`);
- Reinstall browser engines with `npx playwright install` command;
- Run a representative cross-browser subset (for example: Chromium + Firefox + WebKit smoke tests);
- Check for new issues or rendering differences;
- If behavior changed, fix tests.

Maintenance tips:
- Keep Node.js and package manager versions aligned with project expectations;
- Clean stale artifacts if local runs become inconsistent (`test-results`, report folders, cached state files);
- Use deterministic test data and avoid dependencies on mutable shared environments.

## Recording interactions and transforming them into test cases

The framework supports recording real browser interactions and turning them into draft tests.

Typical workflow:
1. Start recording mode (for Playwright this is commonly done with code generation tooling, e.g. `npx playwright codegen <url>` or "Playwright Test for VSCode" extension).
2. Perform the user journey in the browser.
3. Save generated steps as a draft test.
4. Refactor the generated script into project style:
   - replace fragile selectors with stable locators (`data-testid` where possible);
   - extract repeated setup into utils/helpers;
   - add clear assertions for business outcomes (not only clicks/navigation);
   - remove redundant steps and timing noise.

Recording gives fast initial coverage, but generated scripts should always be cleaned.
