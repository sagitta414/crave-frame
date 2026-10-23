# Screen-by-screen and flow review — 22 October 2026

## Subsequent local remediation

The findings below are retained as review evidence. The follow-up fix pass addressed N1–N6 locally:

- Story completion now opens Tonight, matching its planning CTA.
- Availability and collection reads use a shared latest-request-wins loader with loading/error/ready states, explicit retries and cancellation on route change/unmount. Old failures cannot mask later success. Shared-link errors no longer render the personal-library empty message.
- Collections include a direct My evenings action. The library now has one disclosure layer, not two.
- Loved-evenings instructions explicitly require completion and the exact positive feedback choice, which records both dinner and pairing approval.
- Navigation wraps instead of hiding destinations in a horizontal strip. Narrow search stacks its input and submit action, and saved cards are bounded by their container width.
- Saved-evening next actions appear before the large dashboard. Short-screen pairing cards use less image/header spacing while retaining body text size.

Verification: 211 web + 48 TV tests passed, including four new asynchronous recovery regressions; TV type checking, remote-scroll checks, production build, configured secret-pattern scan and diff whitespace check passed. No deployment or commit was performed. Local browser access remained blocked by browser policy, so responsive visual results and physical TV/phone synchronization are not claimed as verified.

## Verdict and scope

The central TV journey is usable, but the deployed site is not ready for a clean demonstration: its prominent schedule disagrees with its live timeline, and the browser planner still leads with unavailable AI. These are previously identified issues with local repairs, not newly discovered regressions in those repairs. Deploying and checking the repaired build is the largest remaining release task.

Reviewed the public AWS `/tv/` and `/app/` interfaces through real browser interactions, including a 1280×720 viewport and the initial narrow panel. Inspected current local route/components separately. The browser policy blocked localhost access; no alternate local browser path was used. Thus local visual behavior is NOT verified by the public screenshots. No physical Fire TV remote, second phone, provider checkout, photo upload, destructive collection action or parental PIN change was exercised. Existing saved cooking progress and household preferences were left unchanged.

Fresh verification: `npm test` passed 211 web tests, 44 TV tests, TV type checking and remote-scroll regressions. Output: `screen-flow-tests.log`. The earlier AWS/build/secret-scan results were not rerun for this documentation-only review.

## Screen coverage

“Observed” means opened and inspected in the public browser; it does not imply all mutations or every state passed.

| Screen/state | Evidence | Assessment / next action |
|---|---|---|
| Boot loading | Observed loader then loaded app | Recovers to content; elapsed time and pause-motion control present. Cold-start timing not measured. |
| Story introduction | Observed replay, controls, next scene, exit | Manual scene navigation works. Exit label promises planning but replay returns to Kitchen; see N1. Local intro now has a short opening before optional full story, unlike the deployed version. |
| Main navigation | Observed at narrow width and 720p | Clear selected state at TV size. Narrow nav hides later destinations inside horizontal scrolling without an obvious overflow cue. |
| Tonight discovery | Observed loaded hero and shelves | One primary planning CTA is clear. Featured dish was a long unfamiliar sandwich name with “Photo unavailable”; other shelf dishes had images. Visually weak first impression. |
| Active-evening resume | Observed Continue and persistent Tonight strip | Returns to the existing Dexter plan; preserves its current step. |
| Title search | Observed query Dexter | Returns original series and related titles. TMDB connection works in this session. |
| Series / season / episodes | Observed original Dexter → Season 1 → E1 | Season and episode results load; selecting E1 reaches dinner options. |
| Meal search / catalog | Observed browser catalog; local TV route inspected | Browser has search and filters, but deployed catalog exposes 527 recipes and inconsistent categories. Local curation/category repairs await visual deployment check. |
| Planning preferences | Local route inspected; not exercised independently live | Extensive preferences can increase decision effort. Keep essential time/people/diet choices first, advanced limits collapsed. |
| Pairing results | Observed three dinner choices for Dexter | Distinct meals, clear review actions and honest practical-match explanations. At 720p, large header/images put review actions below the fold. |
| Pairing explanation | Result explanation text observed | Correctly avoids inventing a story-food connection. Practical fallback still feels less distinctive than a themed match; product quality issue, not a factual bug. |
| Ingredient approval | Observed selected tacos | Ingredient list and ready-cooked chicken requirement are explicit. Save disabled before acknowledgement. Did not save a new production evening. |
| Recipe preview | Entry control observed; local CookingScreen inspected | Preview has separate navigation/readiness checks. Full preview-to-start sequence not exercised live. |
| Similar takeout | Observed tab and strategy choices | Clearly explains provider checkout and phone handoff. No restaurant order or placement acknowledgement performed. ETA validation is covered locally, not physically verified here. |
| Saved evenings | Observed unfinished plan and tools | Continue works. Empty/loved/history logic inspected; loved-empty instructions omit required conditions (N4). |
| Saved-evening dashboard | Observed | FAIL on deployed version: headline dinner/watch 7:22/7:47 PM while live timeline showed 9:17/9:42 PM, later advancing. Local shared projection repair already exists. |
| Delay preview/application | Local code and automated regressions | Latest local tests cover delay/progress agreement. Did not modify the user's existing live plan to reproduce it again. |
| Active cooking | Observed current step and Show me how | Step guidance and contextual pasta help work. Did not advance cooking, start a timer or mark dinner ready. |
| Food-exclusion conflict screen | Local code and automated regressions | Both TV/browser warning paths and server mutation guards present. Live conflict transition not tested against old deployment. |
| Dinner ready / watching / completion | Automated coverage and component inspection | Needs final device journey; opening a streaming app is distinct from the app’s viewing timer. |
| Phone QR / cooking companion | Local PhoneHandoff and cooking routes inspected | Explicit private-link expiry, connected/idle/error status. Camera scan and two-device synchronization remain unverified this pass. |
| Feedback | Local route and tests | Mutation/capability repairs covered in local suite; no live rating was submitted. |
| Kitchen: Food | Observed | Exclusions, cooking level, save and discard controls are explicit. No preferences changed. |
| Kitchen: Pantry | Observed | Deployed version still presents a fixed ingredient checklist. Local searchable pantry is awaiting deployed verification. |
| Kitchen: Streaming | Observed loaded names and search field | Services load. “Subscriptions” also lists store/free-provider options; clarify which selections actually qualify subscription matches. Initial unnamed AX nodes resolved after load; not recorded as a persistent accessibility defect. |
| Kitchen: Playback | Observed | Story replay and motion/sound controls discoverable. Existing settings preserved. |
| Kitchen: Taste / memory | Observed empty state and My saved preferences | Opens the memory page correctly in catalog mode. No removal mutation performed. |
| Shared collections | Observed empty state; local load/share code inspected | Reached through two disclosure buttons then collection link. Empty state only tells users to go elsewhere; add direct saved-evenings CTA. Error recovery needs improvement (N3). |
| Shared photo editor / revocation | Local prior regression evidence only | Upload, cross-client revocation and existing download behavior not rechecked in UI. |
| Couples night / together voting | Route and OurNight component inspected | No multi-participant live test. Do not call this feature end-to-end verified. |
| Kids mode / parental controls | Route inventory only this pass | No PIN or mode changes; requires separate adult/kids transition and restrictions check. |
| Browser home | Observed | Attractive but visually a different product from TV: green/gold editorial layout versus dark blue/peach TV. More importantly, unavailable concierge dominates the first screen. |
| Browser concierge | Observed prompt and submit | FAIL on deployed version: “Live AI is off.” Catalog recovery link works, so this is a wasted primary journey rather than an absolute dead end. Local capability-aware fallback already repaired. |
| Browser catalog recovery | Observed link from AI error | Successfully opens recipe catalog. Deployed ratatouille incorrectly categorized Toast & sandwiches; local category repair exists. |
| Browser recipe/saved/phone routes beyond catalog | Local code/tests only | Full current-build visual verification still outstanding. |

## New actionable findings and friction

### N1 — Story exit promises the wrong destination (P2 UX)

Reproduction: Kitchen → Playback → Replay the evening story → Plan my evening. Actual destination is the same Kitchen Playback screen. Current local `tv/App.tsx:93` finishIntro only hides the intro and records it as seen; `tv/src/Startup.tsx:37` labels that action “Plan my evening”.

Use a context-aware “Back to settings” for replay, or route the planning CTA to Tonight/planner. Test both first run and replay so Back behavior remains intentional.

### N2 — Availability errors can survive a successful subsequent load (P2, code finding)

`tv/src/Extras.tsx`, WatchAvailability: effect clears data but not error when show/region changes. Render prioritizes error over successful data. If a mounted instance first fails and a later dependency change succeeds, the old error still wins. No network failure was induced live, so this is code-established behavior, not a reproduced production outage.

Clear error at the start of each request and after success; test fail → changed show/region → success. Provide retry for the same title.

### N3 — Collection failures resemble empty results and have no retry (P2 recovery)

`tv/src/Extras.tsx`, Collections: load catches an error, but the view still renders the empty-collection guidance when items are empty. There is no loading state or Retry action, and a later successful load does not clear error. An expired/unavailable shared collection can likewise fall into the owner-oriented empty guidance.

Use separate loading, failed, genuinely empty and loaded states. Offer Retry and a direct return action; distinguish a missing shared link from an empty personal library. Code finding; no production failure injected.

### N4 — Loved-evenings instructions do not match inclusion rules (P3 content)

`tv/src/EveningLibrary.tsx:7`: empty state says rating dinner “Absolutely” keeps it here. The filter additionally requires completed status and pairing === great, alongside meal === again. A user following the instruction alone may not see the evening appear.

Explain both required ratings/completion or simplify the rule. Test meal-positive/pairing-neutral and meal-positive/pairing-positive separately.

### N5 — Extras take unnecessary navigation steps (P3 UX)

Observed: My evenings → Shared collections & taste tools → Explore evening extras → Shared collections. This nested disclosure also exists in local EveningLibrary plus Saved(). Remove one disclosure layer. Empty collections should link directly to saved evenings rather than requiring users to remember instructions.

### N6 — Narrow-layout discoverability and TV action placement (P2/P3 UX)

At the initial narrow viewport, the later navigation destinations and part of Search's submit button were clipped. Navigation is intentionally horizontally scrollable in CinemaNavigation; the absence of an overflow cue makes hidden destinations easy to miss. TV App Search uses a fixed horizontal input/button row and 54px content padding. This observation does not establish that the dedicated phone cooking page has the same defect.

At 1280×720, the nav was legible, but pairing result actions were below the first screen and the saved dashboard's main next action sat below the large hero. Compact secondary headings and preserve a visible next action without shrinking body type. Keep the working Down/Up controls and test real D-pad focus before changing scroll behavior.

## Flow checklist and release gates

| Flow | Result this pass |
|---|---|
| TV search → series → season → episode → results → ingredient review | Reached approval successfully; save not executed |
| Ingredient review → similar takeout choices | Passed navigation; provider/ETA/placement not executed |
| My evenings → continue → current cooking step → guidance | Passed without mutating progress |
| Kitchen → playback → story → next scene → exit | Controls work; exit label/destination mismatch |
| Kitchen → streaming/taste/memory | Loaded successfully; saves not executed |
| Saved tools → collections | Reached empty state; excessive disclosure depth |
| Browser home → concierge → prompt → result | Unavailable-AI error; recovery to catalog passed |
| Delays / exclusion changes / feedback / delivery transitions | Local automated coverage passes; latest UI not verified live |
| TV QR → real phone → step/timer → TV refresh → reconnect | Outstanding physical/multi-device gate |
| Two-person voting → reveal → saved plan | Outstanding multi-client gate |
| Parent → kids → blocked content/actions → parent exit | Outstanding device/UI gate |

Recommended order: address N1–N4 with focused regressions; deploy the already-repaired build through the reviewed deployment procedure; rerun core TV/browser journeys on that exact release; then complete the real Fire TV/phone and voting/kids gates. Refine spacing/disclosure depth after correctness. Do not add more features before this verification.

No app fixes, commit, push or deployment were performed in this review. This is a scoped review, not a claim that every screen/state is bug-free.
