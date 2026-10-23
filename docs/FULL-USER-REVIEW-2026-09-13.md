# Live user review — 13 September 2026

Historical review of the initial ChatGPT-hosted prototype (v103), before the AWS deployment, using the browser UI at 1280 × 720. This was a hands-on user review, not a source-code audit or physical Fire TV certification. No app code was changed.

## Assessment

The central journey is usable: find an episode, choose dinner limits, compare meals, substitute a supported protein, review ingredients, save an evening and follow cooking steps. Secondary journeys and the credibility of recommendations and recipe instructions still need work. The animated opening is ahead of the consistency of the rest of the experience.

## Findings in priority order

### 1. High — Home AI recommendations repeatedly fall back

Tonight displayed “AI is unavailable. Browse these recipe matches from the catalog.” on multiple visits, with catalog pairings instead. This was also present after restoring the original household preferences. The fallback is useful and clearly labelled, but the headline recommendation capability was not operating normally during this review.

The cooking coach successfully answered a question about when peppers are ready. This establishes a problem with the recommendation experience, not that every AI feature or the entire provider is offline. Root cause was not established by UI testing.

Recommended correction: investigate recommendation generation and validation failures separately from provider availability; show accurate failure reasons and a useful retry action.

### 2. High — Cooking instructions include ingredients and actions unrelated to the meal

Reproduction: search The Bear (2022) → Season 1 → E1 System → 30 minutes, four people, Meat & poultry → catalog matches → Chicken & pepper tacos → swap to turkey → review all steps.

Turkey taco instructions say to drain canned ingredients and check fish for bones, although the ingredient list contains neither. The first step's colander/steam tip is similarly unrelated. Later instructions refer generically to warm “breads” instead of tortillas.

The ready-cooked turkey requirement is disclosed correctly, and the ingredient quantities change for the swap. Nevertheless, irrelevant directions undermine confidence in the recipe and increase reading effort while cooking. Actual cooking was not performed.

Recommended correction: generate or curate directions and tips from the actual ingredient list, preparation state and chosen protein; kitchen-test the recipes before claiming tested timing.

### 3. Medium — Movie nights introduce an unexplained title and lead to an unhelpful failure

Reproduction: Tonight → More ways to plan → Movie nights. The screen says it will ground the evening in The Avengers, although I had not selected that movie during this review. It offers no title picker on that screen. Premiere Night opens the concierge with “STARTING WITH YOUR SELECTED WATCH,” but does not name the watch in the request or heading.

Submitting the supplied premiere request returned “No AI pairing meets your current connection and subscription filters. Adjust these settings or use the catalog pairing controls.” Kitchen showed no subscription filter applied. Other limits might explain the failure; the message does not identify which constraint caused it or provide a direct catalog action there.

Recommended correction: make the selected movie explicit and editable before generating; identify the actual blocking limit and link directly to the relevant control or fallback.

### 4. Medium — Taste profile makes claims with zero rated evenings

Reproduction: Kitchen → Taste. The screen says no taste preferences are saved, shows zero rated evenings, and says the profile is built only from saved preferences and rated evenings. It nevertheless displays “Cozy,” “Americas,” and “About 28 minutes.”

These statements read as learned preferences without visible supporting ratings. Recommended correction: show a neutral empty state until evidence exists, or label defaults and explain their source. Do not imply unrated test plans represent learned taste.

### 5. Medium — Dinner-first flow retains meal-first wording and redundant controls

Reproduction: Tonight → More ways to plan → Start with dinner → search pizza → Pepperoni pizza.

The next screen says “BEFORE WE SUGGEST DINNER” and “find meals that fit,” although dinner has already been chosen. “Browse recipe matches without AI” correctly produces watch choices, but its label describes a different action. Every watch card repeats the same unavailable protein-swap notice and Choose another meal control.

Recommended correction: use watch-focused copy and actions for this direction of planning; place shared meal controls once above the watch choices.

### 6. Low — Saved protein substitution has no dish image

The new Turkey & pepper tacos evening displays “Dish photo unavailable” in My evenings. This is an honest fallback, but loses the visual continuity of the meal-selection experience.

Recommended correction: provide a suitable labelled illustration or intentional designed placeholder for supported variants; do not mislabel a chicken photo as turkey.

## Journeys exercised

| Area | Actions and observed outcome |
| --- | --- |
| Opening | Started music, paused story, verified music control returned to Play, skipped to home. No physical audio-quality assessment. |
| Search | Found The Bear (2022), selected season and exact episode; episode title and 28-minute runtime carried into the plan. |
| Dinner preferences | Options appeared before meal suggestions. Selected 30 minutes and Meat & poultry. |
| Matching | Explicit non-AI path returned compatible catalog meals; retained chosen episode. |
| Protein swap | Chicken taco swap offered turkey and beef; turkey ingredients and preparation disclosure updated. Unsupported meals explicitly explained swap availability. |
| Takeout | Opened similar-dish, broader tacos and sharing searches, then returned to cooking. No provider checkout or order. |
| Save and resume | Saved the test evening, opened its plan, entered cooking and reached step 3. |
| Cooking tools | Started and stopped the vegetable timer; cooking coach answered the pepper-doneness question. |
| Phone cooking handoff | Opened QR display and checked visible recipe/episode context and expiry messaging. Did not scan on a phone. |
| Kitchen | Inspected Food, Pantry, Streaming, Playback and Taste. Regional service list loaded and searchable control was present. No synthetic allergy or subscription data saved. |
| Pantry planning | Opened the private phone handoff for camera/manual ingredient entry. Did not submit phone ingredients or test recognition. |
| Group planning | Inspected entry screen and group-creation action; did not create participants or complete voting. |
| Dinner-first | Salmon correctly yielded no matches under Meat & poultry with guidance to Kitchen; pizza produced watch choices through non-AI matching. |
| Movie nights/concierge | Opened format screen and submitted supplied premiere request; observed no-pairing outcome. |
| Library | Inspected unfinished records, loved/history counts and the test plan's saved state. |

## State and limits

- Restored household preferences to the initial four people, 45-minute cooking limit and No preference; confirmed the Tonight summary and save acknowledgement.
- Left one review-created evening: The Bear — S1 E1: System with Turkey & pepper tacos, cooking step 3. Its timer was stopped. Existing evenings were preserved. No rating was submitted.
- Opening the pantry feature created its normal temporary private handoff, which the UI says expires in one hour. No link was shared with another person.
- Not tested end to end: physical Fire TV remote/Silk behavior, physical phone QR scan, camera recognition, group voting, delivery purchase, streaming playback, voice input, actual cooking, final meal feedback, every movie-night format or every catalog recipe.
- This review does not establish that all allergy combinations, accessibility behavior, security boundaries or network failure cases are correct. Those need dedicated verification rather than being inferred from a successful happy path.
