# Connection and cooking refinement — 19 October 2026

This pass addresses interruptions in the existing journey rather than adding home-screen controls.

## Changes

- Browser evening polling rejects responses started before a mutation or a change of the active evening object. A late GET can no longer overwrite newer local cooking progress.
- Preparation checks are retained in memory per evening, recipe, servings, adaptation, and cooking level. Refreshes preserve the checked inputs and checkbox focus. Changes to those recipe inputs require a new check; a browser reload also starts fresh.
- Browser JSON requests have bounded waits: 20 seconds normally, 45 seconds for matching and AI paths. Writes are never automatically replayed. A write timeout asks the user to inspect saved progress because the server may have completed it.
- A failed evening refresh shows a reconnecting notice alongside the last received plan. Polling continues automatically, and a successful refresh clears the notice.
- TV phone-search retries catch callback failures, prevent overlapping attempts, announce searching, and ignore state updates from an obsolete handoff. Search state resets for a new handoff.
- Browser pairing explanations use existing curated food references only when the selected recipe ingredients fit. Inspired dinners are explicitly distinguished from movie recipes. The shared TV catalog helper remains identical.

## Verification

- Full suite: 145 web tests and 42 TV tests passed; TypeScript and remote-scrolling regressions passed.
- Production build passed.
- Configured secret-pattern scan passed in 361 text files; this is not a comprehensive security audit.
- New deterministic tests cover stale polling, readiness rendering and keys, stalled reads and writes, server errors, and grounded pairing explanations.

## Boundaries

These are local feature-branch changes, not a deployment. Physical Fire TV, Silk couch-distance testing, phone handoff interaction testing, and recipe kitchen trials remain required. This pass does not resolve the previously documented upstream dependency advisories or generate the remaining optional recipe illustrations. The phone-search changes compile and pass the full suite, but have not been exercised on a physical device.

## Follow-up: completion, delivery, and artwork

- Ready and completed browser recipes retain their ingredients and guidance but remove step mutations, completion submission, and kitchen timer controls. Both states show the completion message.
- Order-out evenings opened through the cooking companion show the saved timeline and tracking disclosure rather than recipe controls.
- Out-of-range recipe step indices are clamped for rendering.
- TV dish captions occupy their own strip instead of covering the bottom of the food image.
- The browser now includes the existing TV grilled-cheese-and-soup illustration. Browser and TV image helpers resolve composed meals through their main recipe.
- Validation: 149 web tests, 42 TV tests, TypeScript, remote-scrolling checks, production build, and configured secret-pattern scan passed. New tests execute the browser cooking renderer for active, planned, completed, and delivery states. Visual changes still require device inspection.

## Server transition and retry follow-up

- Household and shared-phone API routes reject cooking mutations for delivery evenings and reject step/timer mutations after cooking is finished (409 with refresh guidance).
- Repeating completion preserves readyAt and completed feedback status. Repeating viewing-start preserves watchStarted. Repeating the active step preserves its running timer and progress timestamp.
- Browser saved-evening and collection copy distinguish delivery estimates from cooking time; phone sharing uses evening-plan wording for delivery.
- Missing recipe artwork uses a clearly labeled neutral placeholder, not an unrelated category food photo. This does not fill the outstanding illustration gaps.
- Further inspection found TV cooking-level changes did not invalidate readiness. Both checklist identity and parent readiness now include the guidance level.
- Validation: 151 web tests and 42 TV tests passed, plus TypeScript, remote-scrolling checks, production build, and configured secret-pattern scan. API regressions exercise household and shared-phone routes, including stale requests after completion and delivery. No live deployment or physical-device test was performed.
