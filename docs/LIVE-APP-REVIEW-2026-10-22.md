# Live application review — 22 October 2026

## Scope and release

Tested https://dcp5jtiiw3gji.cloudfront.net using a desktop browser, live API probes with isolated test households, and local repository checks. The live frontend version marker and API health both report **9ef944a274d0**. The staged release **crave-20261022-1** is not live. Local source reviewed: **de248b4973c32d2b96e690e25ae9d59c4185bae9**.

This is broad functional coverage, not exhaustive certification. No physical Fire TV remote, real two-phone session, payment, actual takeout order, complete recipe-catalog audit, load test, or penetration test was performed. API synchronization checks are not a substitute for simultaneous device testing.

## Confirmed findings

| Priority | Finding | Evidence and impact | Recommended action |
| --- | --- | --- | --- |
| High | Live release is behind tested source | Both public version markers show the old release. Local passing tests cannot establish the deployed experience. | Finish the repaired release process, verify frontend and backend markers, then repeat live regressions. |
| High | Primary browser action leads to unavailable AI | On `/app/`, entering “An easy dinner and a short comedy for two” and choosing “Make a night of it” opens a concierge page saying live AI is off. The home page still promotes an evening concierge and Gemini. The catalog recovery link works. | Route the primary action according to capabilities; offer working catalog planning and remove unavailable-service promises. |
| High | Delay produces contradictory visible times | Saved Dexter evening: dashboard and timeline initially showed dinner 7:22 PM / watch 7:47 PM. After a 15-minute delay, timeline showed 7:37 PM / 8:02 PM but dashboard remained 7:22 PM / 7:47 PM. | Deploy the shared schedule projection already present in current source; repeat planned, cooking, ready and takeout checks on the deployed release. |
| High | Feedback and memory responses omit capabilities | Fresh household reads include capabilities; feedback and memory mutations do not. Both live API regressions failed. Replacing client household state can expose incorrect AI actions. | Deploy existing household-view fixes and repeat both mutation flows without reload. |
| Medium | Takeout ETA starts with an unverified value | DoorDash phone handoff has “Minutes shown at checkout” prefilled with 35 and enables “I placed the order · sync my TV”. No checkout estimate has been supplied. Current source also initializes this value. | Require explicit ETA entry or an explicit confirmation of an estimated value before updating the evening. |
| Medium | Cooking instructions are not sufficiently recipe-specific | Broccoli & garlic pasta instructions mention mushrooms, zucchini, eggplant and tomatoes despite those not being listed ingredients. The same pasta tip repeats on three of four preview steps. | Generate/render instructions from the actual ingredients and preparation state; remove repeated boilerplate and review beginner guidance. |
| Medium | Home can feature an image-less, unfamiliar dinner | After saving food preferences and returning home, Paddington featured “Dill lentil & beet toasted sandwiches” with “Photo unavailable”, while a shelf still offered illustrated grilled cheese. This observation does not prove the preference caused that exact selection. | Prefer complete, familiar, well-illustrated pairings in the hero; keep adventurous options available deliberately. |
| Medium | Pantry setup is a large checkbox wall | Browser Kitchen exposes roughly 218 ingredient choices before Save, including overlapping raw/prepared variants, without visible search. Current source directly renders the sorted ingredient/swap inventory. | Add search, common-item groups, selected-item summary and an early save action; normalize variants. |
| Medium | Recipe taxonomy contains visible errors | Browser catalog labels “Rustic vegetable ratatouille” as “Toast & sandwiches”. | Validate category mappings and review the featured subset manually. |
| Medium | Movie-night pairings feel repetitive | The 100-pairing gallery repeats dish families across titles; examples include quesadillas under “A Taste of Paris”. Disclosures appropriately call these independent inspired pairings. | Prioritize a smaller set with credible title-specific explanations, varied dishes and practical alternatives. |
| Medium | Dependency audit remains unresolved | Fresh TV dependency audit reports 14 high-severity findings, including transitive braces/node-forge paths; no critical findings. | Assess dependency paths and update compatible tooling. Audit counts alone do not establish production exploitability. |

## Usability observations needing further validation

- Cooking phone handoff presented a QR code and instructions, but no visible copy/open-link alternative in the inspected modal. The takeout handoff does provide an open-link option. Add a consistent fallback.
- Focus sometimes returned to the document after navigation. This is a physical-remote verification risk, not proof of a broken D-pad flow.
- The tested TV home at 1280×720 has a strong meal/show hero, readable headings and clear navigation. The fixed scrolling dock still consumes substantial bottom space. Couch-distance readability was not retested on hardware.
- A nonexistent document path returned 403 rather than a friendly not-found page; security headers remained present.
- Intro entry and skip worked; the complete 90-second introduction was not watched end to end.

## Successful checks

- TMDB search for Dexter, season selection, episode selection, runtime and provider presentation worked.
- Dinner selection, ingredient preview, confirmation gating, saving, starting cooking and reopening through My evenings worked.
- Cooking QR generation, help, dismissal and focus restoration to the handoff action worked.
- Food settings, streaming settings and playback settings loaded; beginner preference saved.
- Takeout search, private handoff and DoorDash/Uber Eats selection loaded, with clear external checkout boundaries. No order was placed.
- Browser catalog recovery and movie-night gallery loaded. Loaded `<img>` elements inspected on the catalog had no broken-image results; this does not cover every asset or CSS background.
- Separate live API clients received distinct household credentials; cross-household evening access was rejected.
- Phone progress and delay changes persisted and were visible through the other client's API reads; revoked phone links were rejected.
- Two guests joined a private voting room; votes stayed hidden before reveal, early reveal was rejected, and the final reveal counted both votes.
- CSP, HSTS, frame denial, nosniff and referrer policy were present on sampled documents, static CSS, API success, API error and document-error responses.

## Automated results

| Suite | Result |
| --- | --- |
| Local web tests | 185 passed |
| Local TV tests | 44 passed |
| Local AWS tests | 10 passed |
| Remote-scrolling regression checks | Passed |
| Secret-pattern scan | Passed across 391 text files; not a comprehensive security audit |
| Live API probes | 17 passed, 2 failed: feedback capabilities and memory capabilities |
| TV dependency audit | 14 high, 0 critical |

No new build was performed during this review because product source was unchanged. Previous build results should not be represented as a fresh deployed-build verification.

## Test data and boundaries

Live probes used isolated test households. The API test evening was deleted and its phone share revoked; two temporary households and a voting room with a 24-hour expiry remain. The separate browser test household retains a Dexter cooking evening and temporary handoff links. No real purchase, provider sign-in, outbound personal message or payment occurred.

## Release recommendation

Do not add more features before resolving deployment parity and the three primary experience defects: unavailable primary planning, contradictory schedule times, and capability-state loss. Then address unconfirmed takeout ETA and recipe-specific instruction quality. Re-run the affected live flows after deployment and perform a physical Fire TV plus phone walkthrough before recording the submission demo.

## Follow-up source fixes

Implemented locally after this review; these are not claims about the AWS deployment:

- Catalog-mode concierge links now offer watch-first and meal-first planning, without unavailable AI controls or provider marketing. The current home already uses the decision-first planner.
- Preserved shared schedule projection and full household capability responses already in the candidate source. Their regression tests pass.
- Removed the 35-minute takeout default. Confirmation requires an explicitly entered integer estimate in the supported 15–120 minute range, and changing providers clears the previous estimate. Unrelated actions do not accidentally re-enable confirmation.
- Recipe preparation now names the actual items for pasta, tacos, curries, soups, bowls, salads, skillets and flatbreads. Technique tips are deduplicated within each recipe. This does not constitute kitchen testing of recipes.
- Explicit recipe categories are preserved, including ratatouille's Vegetable suppers category.
- Familiar meals and available dish images receive a modest ranking preference without bypassing dietary or timing constraints. Unsupported dishes still use an honest missing-image state; no new images were generated.
- Movie-night discovery now presents 20 individually explained dinners, all with dish images. Existing 100 theme IDs remain resolvable for saved plans.
- Pantry setup starts with common and selected ingredients, offers search and full browsing, displays a selected count, and places Save above the list. Hidden selections and previously saved custom ingredients remain available when saving. Raw and prepared ingredients remain distinct intentionally.

Validation: 189 web tests, 44 TV tests and 10 AWS tests passed; scrolling regressions, TypeScript checks, secret-pattern scan and final browser/TV build passed. Four new regressions cover catalog entry, recipe specificity/tip repetition, editorial compatibility and explicit takeout ETA handling. The local browser preview was blocked with ERR_BLOCKED_BY_CLIENT, so no fresh visual validation of these local changes is claimed. AWS deployment and physical-device verification remain outstanding. The dependency audit findings were outside these six requested fixes and remain unresolved.
