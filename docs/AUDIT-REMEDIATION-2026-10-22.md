# Audit remediation — 22 October 2026

The fourteen findings in DEEP-JOURNEY-AUDIT-2026-10-22.md and RESCUE-COLLECTION-AUDIT-2026-10-22.md have been addressed locally as follows. Earlier audit documents describe the pre-fix behavior; this document records the remediation state. Nothing in this report confirms an AWS deployment.

| Finding | Resolution |
| --- | --- |
| 1. Delivery-to-cooking bypass | Shared cooking-plan validation requires the approved adaptation, current ingredient exclusions and confirmed ingredients. A delivery-first TV evening opens a fresh approval flow instead of silently converting. Previously approved cooking plans can still be restored if valid. |
| 2. Photo-sharing ambiguity | Explicitly labeled Stop sharing page, disclosed that old photo links remain usable, and added Remove collection & revoke photo links. Existing deletion removes the stored photo and invalidates the application route. Downloaded copies cannot be recalled. This preserves the disclosed bearer-link policy rather than silently changing it. |
| 3. Dinner-first alternatives | Server selection deduplicates shows, not the deliberately fixed meal, in dinner-first mode. Three API regression cases each return three different shows. |
| 4. Delivery watch disagreement | Delivery watch time is derived from arrival, dinner duration and the original watch anchor; the TV delivery panel consumes the same projection. Generic preparation-time edits are rejected for delivery plans and hidden in the browser. |
| 5. Completed delivery drift | Delivery projection preserves saved arrival and watch anchors regardless of feedback completion. Completed cooking falls back to stable scheduled dinner rather than render time if no actual ready timestamp exists. |
| 6. Viewing drops cooking delay | Cooking is projected independently of viewing. Actual viewing start controls the watch timestamp without discarding cooking progress or servingNotBefore. |
| 7. Extra preparation deadline | Dinner scheduling subtracts the full effective cooking duration including extra prep, and rejects insufficient time. Delivery uses its own ETA path. |
| 8. Rewriting finished preparation | API and browser controls lock generic preparation-start edits after cooking/viewing begins. |
| 9. Kids serving guidance | Kids recipe generation receives the approved people count; adult instructions match the regular recipe at that count. |
| 10. Shopping aisles | Eggplant uses Produce; selected plant-milk, nut-butter and canned-bean ambiguities avoid the dairy substring rule. This is a targeted categorization repair, not a claim of perfect supermarket aisle mapping. |
| 11. Rescue allergen bypass | The actual final adaptation and ingredient list pass the shared cooking-plan validator at apply time. A rejected change leaves the original evening intact. |
| 12. Rescue changes placed delivery | Rescue rejects delivery plans, and its browser action is hidden for that state. Provider orders cannot be silently rewritten as different meals or serving counts. |
| 13. Rescue misses finish target | Remaining time is calculated from the absolute finish target and proposed effective start, including elapsed lateness, explicit delay and preparation allowance. Options that overrun are omitted. |
| 14. Collection loses adaptation | New collection records and public views preserve adaptation; TV recreation carries it into approval. Older unknown records display a review notice rather than claiming the original adaptation is known. |

Final transition inspection also guarded the TV delivery ETA preview for completed/viewing states; completed delivery panels no longer attempt to construct an editable order plan.

## Verification

- Seven new multi-scenario regression tests in `web/tests/audit-remediation.test.js` cover the reproduced validation, transition, matching, deadline, collection, kids and shopping failures. Shared schedule cases run against web and TV modules.
- Final `npm test`: **210 web tests + 44 TV tests passed**, TV TypeScript check passed, and remote scrolling regressions passed.
- `npm --prefix aws test`: **10 passed**.
- Total: **264 passing tests**.
- Production build passed after the final TV screen guard.
- Configured secret-pattern scan passed. It is not a complete security audit.
- Diff whitespace check passed before the final small TV guard; Windows line-ending warnings were informational.

## Limits

Changes remain local and uncommitted. No AWS release was deployed, and no physical Fire TV/phone walkthrough was performed. The previously reported dependency advisories remain outside these functional audit repairs. Passing these regressions is evidence for the repaired scenarios, not a guarantee that no bugs remain.
