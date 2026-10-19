# TV planning and household capability review fixes

Based on `feature/aws-production-migration` at `e30235f`, on separate branch `fix/tv-schedule-capabilities`. The original checkout was relocated to `D:/AI Projects/play/crave-frame`; this isolated checkout preserves that branch. The deployment worktree commits described in the review (`61c737a`) are not included or overwritten.

## Changes

- TV dashboard, Tonight strip, live timeline, advisor, shared-ready view, moment cards and delay preview all call `projectEvening`. It passes the cooking recipe, adaptation, skill level and servings into `readyTogetherPlan`, so explicit cooking delays and late progress are reflected without modifying the saved plan. Before/after delay previews use one timestamp.
- Full adult household responses from feedback, taste-memory changes, preferences, pantry updates and evening deletion use the same capability-enriched view as GET household. Capabilities are calculated from the current runtime, not stored as household preferences.
- Reviewed replacement state callbacks: feedback, TasteMemory, Food settings, pantry handoff and household refresh. Pantry handoff already reads GET household. Restricted kids/shared-phone responses retain their existing scope.
- Existing lazy AI quota reservation and preferences capability fixes are preserved.

## Verification

- `npm test`: 124 web tests and 37 TV tests passed, with TypeScript and remote-scroll regression checks.
- New API tests cover feedback, memory, pantry and deletion in catalog and connected-AI modes against GET household capabilities.
- Deterministic projection tests cover explicit delay, late progress, planned, ready, delivery and watching states, and assert the shared source is wired into the TV displays.
- `npm run check:secrets` passed (pattern scan, not a comprehensive security audit).

## Device acceptance still required

On the branch build, open a saved evening, begin cooking, apply a 15-minute delay, and compare dashboard dinner/watch times with the live timeline and Tonight strip. Repeat with late recipe progress. Rate a saved evening and remove a taste preference without reloading; confirm catalog actions stay in catalog mode. Physical Fire TV and browser interaction have not been verified for this patch. This patch has not been deployed.

Build verification: Expo TV web export passed. The web production build passed with elevated filesystem access after the sandbox prevented esbuild from reading an ancestor directory. No deployment was performed.

## Follow-up: five additional review findings fixed

- Browser and phone-browser timeline rendering now uses the same recipe-aware projection as TV. Deterministic rendered-markup tests compare both dinner and watch times for delayed and late-progress sessions.
- An expired but uncleared timer keeps the remaining recipe steps in the estimate. Expiry no longer switches back to the earlier progress anchor and moves dinner backward. Both catalog copies carry the fix and are tested.
- Initial takeout confirmation anchors the ETA to the supplied placement time, including when converting an existing cooking plan. Explicit ETA updates remain relative to now and preserve the original placement timestamp. Invalid/future or expired initial placement timestamps are rejected.
- Browser cooking shows saved recipe guidance when capabilities are missing or catalog-only, and the AI coach only when connected. Private shared cooking reads/connects/updates carry non-sensitive current capabilities without exposing household memory or keys.
- TV Recipe help opens the actual cooking component's ingredient and coaching panels, including repeated requests after closing the panel. A component hook/render regression exercises this behavior.

Validation: `npm test` passed 129 web tests, 38 TV tests, TypeScript and remote scrolling checks. `npm run build`, `npm run check:secrets` and `git diff --check` passed. Production build required elevated filesystem access for dependency/ancestor reads. Browser hardware navigation and physical Fire TV checks remain outstanding. Changes remain local, not pushed or deployed.
