# Crave Frame stabilization passes — 22 October 2026

## Scope and outcome

Repeated local review, repair and regression verification on `feat/evening-experience-review`. This builds on the fixes documented in SECOND-REVIEW-2026-10-22.md. Changes remain local; this report does not certify the currently deployed AWS release.

## Pass 1: eligibility and state retention

- Fixed plant-based eligibility that accepted incomplete dairy substitutions. Eligibility now considers known ingredients after the actual adaptation, and the save API rejects those unsuitable combinations. Vegetarian eligibility remains intact. Packaged ingredients still require label checking.
- Preserved unsaved pantry selections when preferences are saved and the Kitchen screen rerenders, including an intentionally empty selection and custom items.
- Added retry recovery when the initial phone handoff request fails.

## Pass 2: recovery and cooking sequence

- Added an accessible retry state for current route-load failures, retaining stale-response guards and access to saved evenings.
- Updated navigation test extraction to support the expanded route loader; all seven navigation regressions pass, including stale failures and cooking-save races.
- Corrected protein-pasta and split-dinner instructions so pasta cooks while the topping warms instead of sitting through preparation and reheating.
- Exercised 527 catalog recipes at all three cooking levels, both adaptation states, and one/eight serving boundaries. Verified unique recipe IDs, complete instructions and finite nonnegative step durations. This checks structural consistency, not culinary validation of every dish.

## Pass 3: shared behavior and full verification

- Removed the implicit 35-minute ETA from both shared order-out models. Missing estimates now fail validation; explicit estimates retain their exact arrival calculations.
- Added parity checks for the changed shared web and TV catalog/scheduling modules.
- Re-ran the full checks after the final source change:
  - `npm test`: 200 web tests and 44 TV tests passed, TV TypeScript checking passed, remote scrolling regression checks passed.
  - `npm --prefix aws test`: 10 tests passed, covering persistence/concurrency, isolation, private media, rate identities and migrations.
  - `npm run check:secrets`: passed its configured credential-pattern checks; not a comprehensive security audit.
  - `npm run build`: production TV web export and browser build passed.
  - `git diff --check`: passed; existing Windows line-ending warnings remain informational.

Total: **254 automated tests passed**, plus type checking and remote-scroll checks. Build logs are local and ignored.

## Remaining release checks and limitations

- These local repairs have not been packaged or deployed to AWS. The previous public-site check reported version `9ef944a274d0`; that is not evidence that this work is live.
- A fresh rendered local browser walkthrough was blocked by browser access to localhost. DOM/VM regressions and builds are useful but do not replace visual QA.
- Physical Fire TV navigation, couch-distance readability, and synchronized phone behavior need a walkthrough against the deployed candidate.
- The prior dependency audit reported 14 high-severity findings and no critical findings. No forced Expo downgrade or unverified major dependency migration was attempted in this stabilization pass. These remain a release risk requiring separate compatibility work.
- Automated catalog checks cannot guarantee appealing images, sensible pairings or good cooking results for every recipe. The earlier curated discovery and content fixes reduce those problems without claiming exhaustive editorial validation.

The local regression gates are green. Deployment and device verification remain before calling the public experience verified.

## Follow-up review loop

The next review inspected delivery schedule transitions, phone shopping/pantry recovery and cooking completion. It found two additional defects:

1. Updating a delivery ETA changed arrival but left the timeline waiting duration calculated from the original ETA. Both web and TV now calculate that interval from the saved order and arrival timestamps.
2. The delay API accepted an already placed delivery, recording a schedule change without moving its delivery timestamps. The shared model now rejects this request with guidance to update the provider estimate. The API regression verifies that rejection preserves the saved order and plan start.

Added three regressions (web schedule, TV schedule, API persistence). Schedule regressions reproduced the timestamp mismatch before the fix; all three pass after repair. A further review of the phone shopping, pantry and cooking-completion code did not confirm another defect.

Final repeat verification: **203 web + 44 TV + 10 AWS = 257 passing tests**, TV type checking, remote-scroll checks, secret-pattern scan, production build and diff whitespace check passed. No AWS deployment or physical device verification was performed. The release limitations above remain open.
