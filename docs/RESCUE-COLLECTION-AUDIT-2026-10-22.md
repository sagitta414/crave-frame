# Rescue and collection audit — 22 October 2026

Follow-up to DEEP-JOURNEY-AUDIT-2026-10-22.md. Four additional findings reproduced against the local API handler with a disposable in-memory database. No app source fixes or production changes were made. Time was controlled in the deadline probe and restored afterward.

## 11. P1 — Rescue approval can reintroduce a saved allergen exclusion

Source: `web/server/worker.js:159` and the rescue approval block at lines 146–164; TV adaptation toggle in `tv/App.tsx:310`.

Reproduction:

1. Set the household Milk exclusion.
2. Save `recipe-coconut-chickpea-and-spinach-curry` with its approved plant-yogurt adaptation and Paddington.
3. Preview Rescue with zero delay, two people, no missing ingredients and the same watch. The current adapted dinner appears as an option.
4. Undo the adaptation and confirm the unadapted ingredients. Submit the exact option's canonical show ID and current revision.
5. The API returns 200 with `adapted:false` and Plain yogurt in the ingredient list. A household read still reports `allergies:['Milk']`.

The preview evaluates a particular adaptation. Apply accepts a different adaptation and checks missing ingredients and group restrictions, but never checks the final ingredient list against household allergy/dislike exclusions. The normal create-night endpoint does perform that check.

Impact: a user-facing change path defeats a saved allergen exclusion. Acknowledging ingredients is not equivalent to explicitly removing that exclusion. This is more severe than the previously found plant-based delivery transition.

Required repair: run the same final-ingredient eligibility validator on create, rescue, delivery-to-cooking and any other recipe mutation. Check the actual submitted adaptation, not only the preview. Return a clear rejection without changing the saved evening. Add cases for Milk, other listed allergens, household avoided ingredients, and both adaptation directions.

## 12. P2 — Rescue can change a placed delivery's meal and servings while keeping its old order

Source: `web/server/worker.js:146` and `web/server/worker.js:163`; browser rescue visibility in `web/product/main.js:85`.

Reproduction: save a delivery evening for mushroom toast, two people. Request a different dinner for four people and apply the offered margherita choice. The API returns 200 with a new meal and four servings, but `fulfillment:'delivery'` and an unchanged `orderPlan`, whose query is still "Mushroom toast & crispy potatoes".

The rescue guard permits any planned evening that has not started viewing, including placed deliveries. The browser also offers Rescue for that state. Applying rescue overwrites recipe/show/people without reconciling fulfillment or the existing provider handoff.

Impact: the app presents an internally inconsistent delivery plan. It cannot change the external order, so the screen must not imply the new recipe or servings have become that order.

Required repair: explicitly separate a placed delivery from a proposed replacement evening. Either block recipe rescue for placed deliveries with provider guidance, or require a clear replacement/return-to-cooking flow that preserves the original order record and obtains new approval. Never silently rewrite meal identity around an existing order.

## 13. P2 — Rescue ignores the saved absolute finish deadline and elapsed delay

Source: `web/product/planning.js:19` and `web/server/worker.js:163`.

Reproduction: save the 40-minute curry plus 95-minute Paddington and 25-minute dinner under a 180-minute total limit. Advance the clock by 60 minutes before cooking. Preview and approve a zero-additional-delay rescue that retains the pairing. Response: 200; `finishBy` remains the original deadline; the new projected finish is 40 minutes after it. The proposed tradeoff reads "Keep your pairing; update portions and timing." and reports 160 minutes without flagging that missed deadline.

The option budget is original cooking + dinner + watch minus the requested delay. It does not use remaining time until `finishBy`. Apply then moves preparation to the current time. Thus a duration that fits the original budget can miss the actual saved target.

Required repair: compute the available time from the applicable absolute finish target and proposed effective start. Account for elapsed lateness, extra preparation allowance and any explicit delay once. If the target cannot be met, disclose the overrun and require an explicit target change rather than calling it a fitting rescue. Test immediate, late, expired-target and no-target cases.

## 14. P2 — Shared collections discard the approved recipe adaptation

Source: collection construction and public view in `web/server/social.js:66,87`; `tv/src/Extras.tsx:40`; `tv/App.tsx:153`.

Reproduction: add an evening with `adapted:true` to a collection, enable sharing and retrieve the public collection. Both saved collection and public response omit `adapted`. The shared view builds its recreate choice from meal and show only. `choosePair` therefore defaults adaptation to false.

For the reproduced curry, the approved plant-yogurt version is lost and recreation starts from the plain-yogurt version. This is a fidelity defect. Normal ingredient approval and create-time restrictions still apply, so this is not independently proof of an allergy bypass.

Required repair: save and return the approved adaptation with the collection and carry it through recreation. Preserve the recipient's current restrictions and revalidate rather than blindly applying the original household's settings. Provide a truthful fallback for existing collection records whose adaptation cannot be recovered.

## Correction to the prior photo finding

`tv/src/Extras.tsx:39` explicitly tells collection owners: "Photos can be viewed by anyone with their photo link." The earlier unauthenticated-fetch reproduction remains correct, but its P1 classification overstated the evidence by omitting this disclosure.

Reclassify finding 2 as **P2 sharing/revocation UX and policy ambiguity**, not a demonstrated undisclosed authorization bypass. "Stop sharing" revokes the collection page but not independent photo capabilities. Decide whether that is the intended product promise, and either make the button/disclosure precise or add photo-link revocation. The distinction matters; a bearer media URL is not the same as an exposed public S3 bucket.

## Assessment

The most consequential pattern is validation drift: creation validates a fully specified plan, while later transitions validate only selected fields. Shared collection snapshots lose fields, and rescue preview/apply do not consistently use the same effective ingredients or timing policy.

Recommended direction: introduce one final-plan validator and explicit transition rules, then exercise complete journeys through the API and actual clients. Do not treat more isolated happy-path tests as sufficient evidence of readiness.

This review did not deploy, inspect a current AWS release, perform a physical Fire TV walkthrough or refresh dependency advisories. It does not claim exhaustive bug discovery.
