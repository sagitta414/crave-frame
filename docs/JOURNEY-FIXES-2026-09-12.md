# User-journey findings resolved

Published as Sites version 92 on September 12, 2026. Source commit in the Sites release repository: `52b2595aa1c76c018d86a1b27a7fc716e029cdf9`.

## Changes

- Recipe review now expands all cooking steps before saving. Opening a planned evening's current step is a read-only preview; cooking begins only with an explicit Start cooking action. Shared cooking links also preserve planned status on arrival.
- Back cancels pending suggestions but preserves timer and saved-plan writes. Cooking polling ignores responses made stale by a newer mutation and pauses during writes.
- Delays remain available during cooking. They extend the current serving estimate and viewing schedule while preserving the actual start time, recipe step and timer.
- Takeout search uses the meal's format and protein. Tuna rice bowls no longer become curry. Similar dish, broader and sharing searches replace unsupported speed and ranking claims. The web handoff button navigates to the phone page in the current tab.
- Dinner-first comparison shows title artwork, viewing runtime, synopsis and regional availability. The fixed dinner is identified once, with a Review this evening action for each show.
- Home alternatives remain title-only when AI recommendations fail, consistent with the main fallback action.
- Practical explanations describe recipe equipment, preparation and ready ingredients. The Bear season-one sandwich-shop premise can supply a clearly labeled interpretation, distinct from an episode-verified dish. The premise is sourced to [Disney+](https://www.disneyplus.com/browse/entity-05eb6a8e-90ed-4947-8c0b-e6536cbddd5f).
- Matching uses a compact contextual loading panel. The mobile comparison header stacks cleanly and title images take less vertical space.

## Verification

- All 82 backend tests and 14 TV tests passed, plus TypeScript and scrolling regressions. Production TV export and Sites build passed. Release-repository backend tests also passed.
- In an isolated real-app/Worker preview with in-memory persistence and mocked providers: expanded every recipe step before saving; saved Ratatouille; previewed step two and returned to an unchanged planned evening; explicitly started cooking; started a timer, stopped it and immediately pressed Back; reopened and confirmed the timer stayed stopped.
- Selected chicken quesadillas first and received three different shows with artwork, runtime, synopsis and availability. Inspected the 390×844 layout visually.
- Followed Similar dish search and Open phone handoff here; the ordering page loaded with the correct quesadilla search, serving count, budget guide and provider choices. No order was placed.
- Regression tests cover protected request cancellation, takeout query semantics, adding a short delay beyond an already-future serving estimate, and the sourced first-season interpretation.
- Deployment reported succeeded. Existing public access was preserved.

Physical Fire TV navigation, a separate phone scanning the QR code, real food preparation and subjective recommendation quality still require device/user testing.

Post-publication browser check: the saved evening loaded correctly. The 30-minute cooking-delay preview moved dinner from 6:29 to 6:59 and viewing from 6:54 to 7:24. Kept the current schedule; no production plan was changed during this verification.
