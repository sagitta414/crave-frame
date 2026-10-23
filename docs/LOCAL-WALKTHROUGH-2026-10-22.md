# Local app walkthrough and review

## Follow-up fixes completed locally

All four findings below have now been addressed; their original evidence is retained.

- Together uses serialized polling with revision guards around local writes. Stale reads and stale read errors are ignored, and unmount/room changes stop the previous poller.
- Poll connection errors are separate from action/form errors. Successful reads clear only connection errors.
- Shared cooking Back dismisses dialogs/errors first and stays within cooking instead of opening household discovery. Ordinary household Back is unchanged.
- Parent setup and photo editor use the shared cancellable resource loader with explicit loading/error states and Retry. Failed reads do not require a page reload; stale initial reads cannot update an unmounted screen.

Validation: 211 web + 55 TV + 10 AWS tests passed (276 total), plus TV type checking, remote/paging regressions, production build and configured secret-pattern scan. Added actual Back-handler regressions and group polling race/error-recovery checks. Existing resource-loader regressions cover retry, failed versus empty state, stale results and cancellation.

The repairs are included in the 22 October source update for main. No deployment or physical-device/visual verification was performed.

## Scope and conclusion

Reviewed the current local copy after the remote/reconnect/hero fixes. This is a route/component and automated-flow walkthrough, not a complete hands-on visual walkthrough. The existing browser policy block on localhost was respected; the older public deployment was not used as evidence for current local behavior. No physical Fire TV, camera QR scan, second-phone session or live checkout was performed.

The principal planning/cooking journey is substantially stronger. Fresh checks pass: 211 web + 51 TV + 10 AWS tests (272 total), TV type checking, paging/modal isolation and wrapped-navigation regressions. Passing tests do not cover every UI branch: focused probes below confirm three remaining flow/recovery findings, plus an initial-load recovery gap affecting two secondary screens.

No application code, production resources or saved user data changed during this review.

## Findings, prioritized

### 1. P2 — Group voting can regress to an older room phase

Location: `tv/src/Extras.tsx:32`, Together polling effect.

It starts a room read every four seconds with setInterval, even if the last read is still pending, and every completed read calls setRoom. A slow older response can therefore replace a newer result. The write helper also has no read-revision guard, so a pending poll can overwrite the just-returned view from a vote/reveal action.

Confirmed with the actual extracted loader and controlled promises: resolve request 2 as `revealed`, then request 1 as `voting`; final displayed room state becomes `voting`. This is a client-view regression; the probe does not establish server data loss.

Repair: serialized polling, generation/version protection around local writes, and stale-response rejection on room changes. Test out-of-order polls and a poll overlapping reveal/vote/reopen.

### 2. P2 — Group connection error remains after recovery

Location: same Together polling effect.

Failure sets error, but successful polling only sets room. Confirmed with the actual loader: reject a read as offline, then resolve the next read successfully; error remains `offline`. A recovered group can still look broken.

Repair: separate connection errors from mutation/validation errors, clear connection errors on successful reads, and retain saved votes. Do not indiscriminately erase useful form validation on every poll.

### 3. P2 — Shared cooking Back leaves the intended companion flow

Locations: `tv/App.tsx:119` Back handler and `tv/App.tsx:122` shared boot branch.

Shared cooking initializes a minimal household view and stack `['cook']`, without opening authenticated household state. Back with no dialog/error and a one-element cook stack falls through to `setStack(['home'])`. A probe executing the actual Back callback with a shared-cooking context confirmed destination `['home']`. This exposes the full discovery flow backed by a partial shared household object. It is not evidence that shared-link holders gain server authorization.

Repair: define a companion-specific Back policy. Close local overlays first; at the companion root either let the host/browser handle Back or show a bounded evening summary with a direct return to recipe. Do not enter full household discovery from a shared cooking context.

### 4. P2 recovery — Parent setup and photo editor have no initial-load retry

Locations: `tv/src/KidsKitchen.tsx:12` ParentControls initial effect; `tv/src/Extras.tsx:53` PhotoEditor initial effect.

Both fetch once on mount. If that read fails, the main controls depend on absent data and no retry control is rendered. A transient network error requires leaving/reopening or reloading. PhotoEditor also lacks a cancellation guard for its initial read. This is established by component branches, not a physical network test.

Repair: use explicit loading/error/ready states and Retry, as availability/collections now do. Preserve PIN/photo-edit form state where appropriate, do not log secrets, and reject outdated loads after leaving the screen.

## Journey coverage

| Stage | Current assessment | Verification boundary |
|---|---|---|
| Startup → Tonight | Planning CTA now routes home; optional story controls remain | Code/build, not timed visual playback |
| Tonight hero → planning | Eligible image-backed meals are preferred; no photo substitution | Spotlight tests; image composition/couch reading still manual |
| Search → movie/series → episode | Selection and runtime handling covered | Local API/test coverage; no current local visual interaction |
| Dinner-first → three watch options | Distinct titles preserve dinner | API regression passed |
| Preferences → pairings | Food/time constraints and no-match paths present | Tests/code; exhaustive combinations not claimed |
| Pairing → ingredients/adaptation → save | Actual ingredients validated, readiness required | API regressions passed |
| Saved plan → current cooking step | Shared schedule projection and next-action priority present | Schedule/cooking tests passed |
| Cooking preview → start | Preview separated from saved progress | Cooking journey tests passed |
| Delay → updated dinner/watch times | Explicit delay and progress projection aligned | Deterministic local schedule regressions passed |
| Food exclusions change during cooking | Conflict guard preserves progress, permits stopping timer | Household/shared API regression passed |
| Recipe step/timer → dinner ready | Ready explicitly completes progress | Tests passed; actual timer/device display not observed |
| Viewing → feedback → loved evenings | Capabilities retained; library instructions corrected | Tests/code; complete rating UI not exercised here |
| TV QR → shared phone recipe | Link and scope disclosed; reconnect protected | Shared API/sync tests passed; Back defect above remains |
| Disconnect → reconnect | Saved state refreshes, obsolete reads discarded; no write replay added | Controlled async tests, not physical airplane-mode test |
| Similar takeout → checkout handoff → entered ETA | Explicit provider estimate; updates separated from cooking | Delivery/order confirmation tests passed; no order placed |
| Return from takeout → cooking | Reapproval/revalidation paths guarded | API regressions passed |
| Pantry → shopping list → recipe matching | Improved search and grouped ingredients | Existing local tests; QR cross-device route not manually exercised |
| Kitchen food/taste/streaming | Mutation capabilities and availability retries repaired | Tests and code |
| Our night / shared vote → reveal | Functional intent and privacy checks present | Group API tests pass; client polling defects remain |
| Collections → share → recreation | Adaptation retained, retry/empty states separated | Local regressions/code; no uploads or revocations performed |
| Photo editing | Upload path exists | Initial-load recovery gap remains |
| Parent setup → kids → parent exit | Server restrictions/session tests pass | Parent initial-load gap; PIN/device journey not exercised |
| Remote navigation / scrolling | Wrapped row directions and paging isolation pass | Automated handler tests; native Fire OS focus still manual |
| Small screens | Nav wraps, search stacks, cards bounded | Compiles; no screenshot-based overlap claim |
| Browser planner catalog fallback | Local capability-aware fallback repaired | Local tests; older deployed failure excluded from this verdict |

## Visual and product review

The current direction is coherent: featured dinner/show first, one main planning action, optional extras later, and saved-evening actions above the large artwork. The image-backed hero ranking improves first impressions without inventing food imagery. Readability and focus animation remain device acceptance questions, not proven defects or proven passes.

Avoid another feature expansion. Fix the four findings above, then validate one complete cooked evening, one takeout evening, a two-person reveal and one kids session on the actual build. Capture the release identifier and device/browser used so that observations are traceable to the local fixes.

## Logs

- `walkthrough-tests.log`: 211 web / 51 TV tests, type checks and remote regressions.
- `walkthrough-aws-tests.log`: 10 AWS adapter/migration/media tests.
- Prior production build remains the successful `four-area-build.log`; no code changed in this review requiring another build.
