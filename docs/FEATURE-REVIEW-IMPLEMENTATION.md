# Feature review implementation and remaining weaknesses

This record follows the feature and content review on 18 October 2026. The changes improve choosing an evening, cooking preparation, timing, and honest explanations. They do not establish that meals have been cooked successfully, households will return, or the release has been deployed.

See [the follow-up closure report](REVIEW-CLOSURE-2026-10-18.md) for subsequent fixes and current verification.

## Changes in this working copy

| Area | Implementation |
| --- | --- |
| First visit | A short, readable explanation replaces the automatically advancing opening. The full animated story remains an explicit option, with pause and navigation controls. Returning users retain the existing skip behavior. |
| Featured evening | The existing single primary action remains dominant. A compact pairing explanation and an effort signal now support the decision. |
| Discovery shelves | Selection favors dinners not already used in other shelves, when eligible alternatives exist. The one-hour shelf now includes 25 minutes to eat rather than counting cooking and viewing alone. |
| Recipe discovery | Core recipes appear first in meal search. An explicit control includes variations. Variation cards can use a shorter method-and-main-ingredient name; detailed recipes retain their full names. |
| Phone search | A private, one-hour, single-search QR link lets a phone send a movie or series query. Results appear on the TV for selection. It does not expose the household credential or grant general household editing access. Repeated identical submissions are idempotent; different second submissions are rejected. |
| Recent searches | Typed TV searches persist locally, capped at five. |
| Refinement | Optional reasons offer less work, another dinner, or familiar food without permanently marking a dish disliked. The selected watch and exclusions stay fixed. |
| Total evening time | An optional 60–360 minute budget filters both catalog and AI candidates, including 25 minutes for dinner. Saving an over-budget plan is rejected. Three-course candidate selection reserves its extra preparation time. |
| Finish target | Saved evenings show their projected finish and whether it meets the chosen target. A target is not a promise or permission to shorten cooking steps. |
| Personal pace | A user can explicitly add 5–30 minutes of preparation allowance before cooking. Shared web and TV schedule logic includes it; recipe timers do not change. Repeated “took longer” feedback prompts consideration of extra time, without silently changing future plans. |
| Ready to cook | TV and shared TV-web phone cooking previews show quantities, equipment and prepared-ingredient assumptions. Starting from that preview requires checking ingredients, equipment and instructions. Existing saved plans are not rewritten by previewing. |
| Feedback | Optional effort, flavor, connection and repetition reasons, plus cooking-time feedback, are saved. Easier future cooking requires an explicit choice. A negative rating no longer automatically saves the mood as a preference in the TV flow. |
| Taste summary | Favorite cuisine and cooking-rhythm inference uses enjoyed dinners only. Explicit saved preferences still take precedence. “Calibrated” and “Taste Twin” claims are replaced by a transparent rated-evening summary. |
| Special dinner | Four supported mains offer an optional three-course menu using existing catalog sides. Food exclusions, cooking time and total evening time gate the option. Menus remain labeled untested. Group-approved dinners are not silently modified. |
| Conversation | Optional prompts vary with mood or family context. They remain spoiler-free and do not claim knowledge of particular scenes. |
| Image labels | TV dish imagery is visibly labeled as an AI illustration or illustrative photo, including ordinary category images. Missing images retain an honest fallback. |
| Pantry | The phone flow suggests starting with a few ingredients. Photo recognition is shown only when the server reports connected AI. Typing remains available in catalog mode. |
| Connection and delivery copy | Interrupted synchronization distinguishes last saved progress from new changes. Delivery timing is explicitly described as the user's entered estimate. |
| Technical wording | “AI CHANGED,” “ingredient delta” and “Save my reflection” are replaced with plain, accurate language. |
| Documentation | README links both AWS and legacy demos and distinguishes source changes from deployed releases. |

## Existing features retained and reinforced

Meal-first discovery, cooking skill levels, ingredient exclusions, ready-cooked protein constraints, two-appetite servings, private group voting, tie disclosure, the shared reveal, delay previews, saved evenings, same-dinner/new-story replay, phone shopping lists, parent controls, and reduced motion already address the review recommendations. Their scope remains bounded. In particular, Kids Kitchen controls Crave Frame, not Fire TV or other applications; delivery remains an external provider handoff; streaming playback is external.

The home screen retains the existing two-feature preview pattern. New detailed feedback and timing controls are expandable rather than additional home-screen panels. The remote scrolling implementation is unchanged.

## Content coverage and limitations

Run `node scripts/audit-recipe-content.mjs` to regenerate `recipe-content-audit.json`. The report checks mappings and file existence, not the contents of image pixels.

The current source has 527 recipes: 127 core recipes and 400 variations. There are image mappings backed by files for 169 recipes. All core recipes and all featured recipes have mapped images. The remaining 358 gaps are variations. The follow-up replaced all seven core category images with dedicated AI illustrations; the regenerated audit now reports zero core category images.

Seven replacement illustrations were generated and visually checked in the follow-up. See CORE-DISH-IMAGES.md for prompts and scope. The remaining library still requires visual review; asset presence alone does not establish accuracy.

## Remaining weaknesses

1. **Food quality and timing are unproven.** All eight flagship kitchen trials remain pending. Cook the dishes for two and four people, record preparation, elapsed time and problems, and update the actual recipes. New optional menus also require trials. Do not call them tested in a submission.
2. **Device usability is not certified.** No browser surfaces were available to the agent for visual inspection in this session. Test this release on an actual Fire TV with the remote and a phone, including small TV viewports, QR scanning and interruptions.
3. **Image truth still needs human review.** Asset existence is not ingredient or presentation accuracy. The seven identified core category mappings are now replaced; wider library review remains open.
4. **The matching library still needs editorial judgment.** Existing sourced connections and practical labels are retained. No automated scoring change proves that every pairing feels persuasive. Review at least ten familiar titles and reject weak explanations.
5. **Retention and speed remain hypotheses.** The five-household trial has not run. Measure time to choose dinner, successful unassisted phone handoff, actual meal completion, and voluntary return.
6. **Deployment is separate.** These edits do not update AWS, the legacy public site, GitHub or the installed APK by themselves. Deploy a single reviewed revision, then retest the exact release marker.
7. **Dependency audit remains open.** The previous TV dependency audit reported high-severity package findings; `npm audit fix --force` failed without changing dependencies. This product pass does not remediate or dismiss that dependency work.
8. **Surface parity needs a walkthrough.** The flagship `/tv/` experience and its shared cooking route receive the new controls. Shared backend rules also apply to the older browser planner, but not every new control has been reproduced in its separate UI.

## Verification

Automated checks cover positive-only taste summaries, readiness gating, total-evening candidate filtering, finish targets, preparation allowance, shared schedule agreement, feedback validation, capability retention, and private search-link scope, expiry and idempotency. Existing remote-scroll regressions remain required.

Verification completed for this implementation: 133 web/API tests and 42 TV tests passed, TypeScript passed, remote-scroll regressions passed, production build passed, credential-pattern scan passed, and whitespace diff checks passed. The build required host execution because the sandbox blocked esbuild parent-directory access. A passing web export is not an APK build or a physical device test.

## Device acceptance walkthrough

1. Start with a new local household. Read the short introduction; enter planning immediately. Replay the long story, pause it, and exit with Back.
2. From search, scan the phone-search QR. Send a movie and then, using a new link, a series query. Select the correct edition or episode on TV. Confirm a used or expired link cannot send a different search.
3. Choose a 90-minute total budget. Every proposed pairing must fit cooking plus 25 minutes to eat plus viewing. A long selected movie should produce an honest empty state, not relax the limit.
4. Reject a dinner as too much work. Confirm the movie stays fixed and the saved permanent dislikes do not change.
5. Save a dinner. Set a finish target and add 15 minutes of preparation. Compare the prominent times, timeline and phone state. Apply a delay and compare again.
6. Open cooking. Review quantities and equipment. Confirm Start cooking remains unavailable until the readiness checks are complete. Complete a timer and move between steps on the phone.
7. Rate a dinner negatively. Confirm its cuisine does not become a favorite. Save “took longer” feedback; verify that a later evening offers an explicit adjustment rather than changing itself.
8. In catalog mode, use the pantry phone flow. Typing works; unavailable photo recognition is not offered.
9. Check the hero and recipe cards from the couch. Image labels must be readable without obscuring the dish. Confirm focus remains visible and Down, Up and Top still work.
