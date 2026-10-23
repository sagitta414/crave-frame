# Deep journey audit — 22 October 2026

## Scope

Reviewed the current local working tree on `feat/evening-experience-review`, including uncommitted stabilization changes. This is an audit, not a repair or deployment. Seven additional findings and the three previously reproduced timing findings remain open: ten confirmed findings total.

Read the browser/TV entry points, shared schedule model, matching service, household mutations, cooking updates, phone companion, parent controls, collections/media and associated tests. Reproductions used the real API handler with isolated in-memory SQLite storage; media used a local in-memory adapter. No production household or AWS resource was changed. Schedule probes used explicit timestamps.

## Findings

### 1. P1 — Switching delivery to cooking bypasses dietary adaptation and ingredient approval

Locations: `web/server/worker.js:175`, `web/server/worker.js:179`, `tv/App.tsx:170`.

Reproduction: create mushroom toast as a delivery evening with Plant-based preferences and `adapted:false`, which delivery creation permits. PATCH `fulfillment:'cook'`, then PATCH `step:0`. Both return 200. The resulting cooking session still has `diet:'Plant-based'`, `adapted:false`, `confirmed:[]`, and Butter in its ingredients.

Impact: the visible Return to cooking action can start a recipe that violates the saved dietary preference and skips the required ingredient review. This reproduction proves a plant-based preference violation, not an allergy injury.

Repair: treat delivery-to-cooking as a newly approved cooking plan. Revalidate actual ingredients, current household restrictions and adaptation; require ingredient confirmation before entering cooking. Preserve the delivery plan until approval succeeds. Cover both originally-cooked and originally-delivery evenings.

### 2. P2 — Turning collection sharing off does not revoke its previously shared photo

Correction after further UI review: `tv/src/Extras.tsx:39` discloses that anyone with a photo link can view it. The original P1 classification overstated this as an undisclosed privacy defect. The confirmed behavior is now classified as a sharing/revocation UX and policy issue; see RESCUE-COLLECTION-AUDIT-2026-10-22.md.

Locations: `web/server/social.js:67`, `web/server/social.js:90`.

Reproduction: create a collection and upload a photo, enable sharing, read its photo identifier from the public collection response, then disable sharing. An unauthenticated collection GET returns 404, but an unauthenticated GET of the same `/api/photo/<identifier>` returns 200.

Impact: a former recipient can continue fetching the private photo from the application after sharing is disabled. The endpoint checks that a collection references the photo, but not whether that collection is shared or the caller owns it. This does not expose the S3 bucket or permit guessing another photo's random identifier.

Repair: distinguish owner/editor access from public photo access; revoke public access with the collection, including any independently issued media capability. Test owner viewing after unshare as well as former-recipient denial. Already downloaded copies cannot be revoked.

### 3. P2 — Dinner-first matching collapses to one alternative

Location: `web/server/social.js:38`.

Reproduction: call catalog-mode `/api/recommendations` with `mode:'meal'`, cooking limit 60 and watch limit 180 for mushroom-toast, pepper-pasta and flatbread. Each underlying `curate` call supplies eight eligible candidates, but each API response contains one pick.

Cause: selection allows distinct shows in meal mode, then the unconditional seen-meal check rejects the remaining candidates because they intentionally share the selected dinner.

Impact: Start with dinner and related keep-dinner/change-show flows lose valid alternatives. Existing engine tests check three results but do not cover this final server selection loop.

Repair: enforce distinct shows in meal mode and distinct meals in watch mode. Add API-level tests for both anchored modes and unanchored suggestions.

### 4. P2 — Delivery dinner-duration edits leave contradictory watch timestamps

Locations: `web/server/worker.js:175`, `web/product/evening.js:29`, `tv/src/Experience.tsx:47`.

Previously reproduced and still open. Change an ordered evening's dinner duration from 25 to 60 minutes through the browser timeline. The main projection moves watching by 35 minutes, but `orderPlan.watchAt`, used by the delivery panel, stays unchanged. The same update deletes `scheduleChange`, which also held the original cooking-plan start for Return to cooking.

Repair: use one authoritative projection in every view and keep rollback/original-plan metadata separate from user-facing change notices.

### 5. P2 — Feedback makes completed delivery schedules move with the clock

Locations: `web/server/worker.js:170`, `web/product/evening.js:37` (mirrored in TV).

Previously reproduced and still open. Submit feedback on a delivery evening without starting the viewing timer, then reopen it. Feedback sets `status:'complete'`, but delivery has no `readyAt`. Projection substitutes `now`, replacing the saved delivery dinner time. Two reads one minute apart move dinner another minute.

Repair: retain delivery timing for delivery plans and a stable event/estimate for completed evenings. Never infer a historical completion timestamp from render time.

### 6. P2 — Starting the viewing timer discards an active cooking delay

Location: `web/product/evening.js:31` (mirrored in TV).

Previously reproduced and still open. During cooking, apply a 15-minute delay, then start the browser viewing timer before completing cooking. The `watchStarted` early return bypasses cooking progress and `servingNotBefore`. In the deterministic probe, dinner jumped 35 minutes earlier.

Repair: project dinner independently from actual viewing start. Starting a viewing timer must not erase the cooking projection; alternatively disallow that transition consistently if the product requires dinner first.

### 7. P2 — Set-dinner-time scheduling ignores extra preparation allowance

Locations: `web/product/curation.js:45`, `web/server/social.js:84`.

Reproduction: save a cooking evening, add 30 minutes of preparation allowance, then use `/api/schedule` to set dinner two hours ahead. The request returns 200, but the shared projection places dinner 30 minutes after the requested target. The scheduler subtracts only `meal.minutes`; the timeline adds the allowance afterward.

Repair: use the same effective cooking duration for deadline validation and schedule generation. Verify zero and nonzero allowances and insufficient-time rejection. Delivery plans also need a separate scheduling policy rather than cooking-time arithmetic.

### 8. P2 — Browser timeline can rewrite an already finished cooking plan

Locations: `web/product/main.js:73`, `web/product/main.js:122`, `web/server/worker.js:175`.

Reproduction: start and complete cooking, then PATCH a plan start one day later and dinner duration 60. The request returns 200 with status still ready and yesterday's `readyAt`. The browser continues to offer its timeline-edit controls after completion; unlike `/api/schedule`, this mutation path lacks the planned-state guard.

Impact: contradictory historical/planned timestamps and erased schedule-change metadata. An edit can appear saved even where actual cooking timestamps make its requested start ineffective.

Repair: define allowed edits for planned, cooking, ready, complete and viewing states. Lock historical starts after cooking begins; allow only explicitly supported future adjustments. Apply the same policy across both scheduling endpoints and the UI.

### 9. P3 — Kids Kitchen drops serving-count cooking guidance

Location: `web/server/parental.js:52`.

Reproduction: set household size to eight, enable Kids Kitchen, and approve a recipe. The API returns `people:8` and scaled ingredient quantities, but calls `recipeSteps` without the people argument, so it defaults to two. The first adult instruction lacks the eight-person batch/pan guidance supplied by the regular recipe flow.

Repair: pass the approved serving count through the kids recipe generator and compare adult directions with the regular recipe at one, two and eight servings. This finding concerns missing scaling guidance, not proof that ingredient quantities are wrong.

### 10. P3 — Shopping aisle classification puts eggplant under dairy

Location: `web/server/companion.js:14`.

Reproduction: save story-ratatouille and open its shopping companion. The Eggplant item is returned with `section:'Dairy & eggs'`. The substring `egg` wins before produce classification. The same broad rules warrant checking plant milks and nut butters.

Repair: use explicit ingredient categories or carefully ordered whole-ingredient matches. Cover known ambiguous ingredient names rather than adding isolated substring exceptions.

## Verification and what the green suite means

After the audit probes, `npm test` passed 203 web and 44 TV tests, TV TypeScript checks and remote-scroll regressions. `npm --prefix aws test` passed 10 tests. `npm run check:secrets` passed configured pattern checks. **257 automated tests remain green despite the findings above.** These are missing journey/transition assertions, not evidence that the findings are harmless.

The API probes also confirmed basic empty-body requests to preferences, curate and nights return 400. Existing tests exercised household isolation, parent PIN controls, concurrency, private media replacement/cleanup, migration rollback and trusted rate identities. Passing those checks is limited evidence, not a complete security certification.

## Remaining unknowns and release risks

- No fresh rendered walkthrough, physical Fire TV remote session or real phone synchronization test was completed in this audit. Screen readability, focus behavior and network interruptions still need end-to-end verification.
- No AWS deployment or current production version check was performed. Findings apply to the local working tree; production can differ.
- The previous dependency report lists 14 high-severity and zero critical findings. This audit did not refresh registry advisories or resolve those dependencies.
- All 527 recipes previously passed structural checks, but that does not constitute kitchen testing or exhaustive editorial/image review.
- Global photo-upload allowance and household-capacity ceilings deserve an operational recovery policy. They were not counted as defects here because they may be deliberate abuse controls.

## Recommended repair order

1. Close cooking-approval and photo-revocation gaps.
2. Consolidate schedule projection and mutation policy; fix findings 4–8 together, with transition matrices rather than isolated action tests.
3. Correct final matching selection and test all API entry points that consume it.
4. Align kids serving guidance and shopping categories.
5. Run a deployed TV-plus-phone acceptance walkthrough before calling the release ready.

No claim is made that every defect has been found. This audit expands concrete coverage and identifies the next repair boundaries.
