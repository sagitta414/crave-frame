# Post-fix finding check — 22 October 2026

## Remediation status

Subsequently fixed locally: both household and shared cooking mutations check current ingredient exclusions before starting or advancing cooking. Conflicting active sessions preserve their step and timer, allow stopping the timer, and require review before further progress. Reads return the conflicting ingredient names; browser and TV cooking screens present a review message. Browser readiness identity includes those conflicts, invalidating prior checkmarks. Polling compares/applies the full view, so conflicts propagate to already-open screens.

A regression covers both routes, new exclusions after link creation, blocked starts/timers/completion, active-session conflicts, unchanged saved progress, timer cancellation, unrelated exclusions and restored access after removal. Follow-up inspection found no additional confirmed defect in these paths.

Final verification: 211 web + 44 TV + 10 AWS tests passed (265 total), TV type checking and remote-scroll regressions passed, production build passed, and the configured secret-pattern scan passed. No production deployment or physical-device test was performed. The original finding and reproduction below are retained as pre-fix evidence.

Reviewed the current local repairs, concentrating on plan validation, shared cooking and recipe/schedule transitions. No application code or production resources were changed in this review.

## P1 — Saved cooking sessions do not recheck subsequently added household exclusions

Locations: `web/server/worker.js`, shared PATCH branch and authenticated night PATCH branch, both calling `applyCooking(night,b)`; the `applyCooking` function has no household-memory input. `web/product/cooking-readiness.js` renders the saved ingredients and generic readiness acknowledgments without current exclusion information.

Reproduction using the real API handler and a disposable in-memory database:

1. Save unadapted coconut chickpea and spinach curry, including plain yogurt, while no Milk exclusion is configured. Confirm all ingredients.
2. Create its phone cooking share link.
3. Save household preferences with `memory.allergies:['Milk']`; response 200.
4. PATCH the shared cooking link with step 0 and the current meal ID; response 200 and status cooking. Its returned ingredient list still contains Plain yogurt.
5. Try creating the same unadapted recipe as a new evening; response 400: the recipe contains an excluded ingredient.

This shows inconsistent enforcement after a preference change: new plans are blocked, but an existing plan and its issued phone link bypass the current exclusion. The earlier fixes validate creation, rescue and delivery-to-cooking, but omit the normal planned-to-cooking transition. This is not evidence of an actual allergic incident.

Recommended repair:

- Revalidate current household ingredient exclusions before a saved planned evening starts cooking through either authenticated or shared endpoints.
- Return a clear conflict requiring recipe review; do not silently alter a saved recipe or pretend that an exclusion was removed.
- Define explicit behavior when exclusions change during an already active session, including visible warning/review state rather than silently discarding progress.
- Include relevant restriction state in readiness invalidation so an earlier checklist is not treated as approval of newly conflicting ingredients.
- Test browser, TV and phone transitions with restrictions added after save and after the link was created, plus nonconflicting changes and removal of exclusions.

## Scope and limits

One new defect was confirmed in this pass. Other inspected paths were not assigned findings without a concrete failure. No claim is made that the app is otherwise bug-free. The previous 264-test result remains the last full-suite result; this turn used targeted reproduction, not another unchanged full-suite run. AWS and physical devices were not checked.
