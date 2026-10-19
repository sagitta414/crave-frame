# Review follow-up: fixes and unresolved evidence

## Fixed in source

- Replaced all seven generic core-dish images with distinct, ingredient-led AI illustrations. Inspected each output before installing it. The images show meatballs, quesadilla wedges, peas, pepperoni and other defining ingredients rather than unrelated category food. Original recipe presentation is illustrative; substitutions and portions can differ.
- Normal catalog and browser atmosphere ranking now favor existing sourced food connections over arbitrary title favorites. Ratatouille can lead with the rustic vegetable interpretation; Avengers can lead with a filled pita. Explicit theme selections, practical matching and hard time/food limits remain in control.
- Both local matching paths now honor a saved “do not recommend this meal” preference. This was missing outside the server's personalized selection flow.
- Browser cooking now opens a preparation preview with quantities, equipment, all steps and three readiness checks before Start cooking. A changed plan resets the checks.
- Browser schedule polling detects the complete saved view, including delays, finish targets, preparation allowance and capabilities. Responses for a different evening cannot replace the current evening.
- Browser timeline controls now expose finish targets and preparation allowance; projected overruns are visible. The API saves combined timing edits atomically instead of silently applying only the first field. A regression verifies that invalid targets do not partially save the allowance.
- Catalog mode no longer offers the browser's unavailable evening-concierge action. Saving browser feedback no longer implicitly marks the mood as liked.
- Phone-search QR sizing adapts to narrow viewports.

## Verification

137 web/API tests and 42 TV tests passed (179 total), including the previous review regressions. TypeScript, remote-scroll regressions, production export/build and the configured credential-pattern scan passed. New tests cover sourced ranking, explicit disliked meals, delay/target synchronization, readiness quantities and plan changes, and actual JPEG file validity and parity across web/TV assets.

These checks are software evidence, not proof of physical device UX or food quality. No deployment, GitHub push or APK installation is implied.

## Dependency audit: still open

Fresh `npm audit --json` in `tv` reports 14 high-severity affected package entries, no critical entries. Two underlying advisories propagate through the Expo/Metro dependency tree:

| Package | Registry latest checked | Advisory |
| --- | --- | --- |
| braces | 3.0.3 | GHSA-vfj7-8cjw-p6xm, affected through 3.0.3 |
| node-forge | 1.4.0 | GHSA-86w9-cpqp-85rv, affected through 1.4.0 |

No patched stable version was available from the configured npm registry at this check. The previous force-fix proposed Expo 44 and failed resolving `undefined@undefined`. No incompatible downgrade, advisory suppression, or unreviewed local security patch was applied. CI's high-severity audit gate remains enabled. Keep development services private, use trusted build inputs, and review the upstream fixes when published; these precautions do not close the advisories or prove absence of runtime exposure.

## Cannot close through source edits

1. Cook the eight flagship recipes for two and four people, then record actual elapsed time, portions and corrections. Current estimates remain untested.
2. Test the exact built revision on the user's Fire TV and phone: remote navigation, couch legibility, QR handoff, interruption recovery and schedule changes. No physical device or browser surface was available for this pass.
3. Run the planned household trial to measure decision time, meal completion and voluntary return. No retention claims are supported yet.
4. Publish the reviewed revision and verify its release marker before calling the live site updated. This pass leaves production unchanged.
5. Review the remaining image library and wider title library. The seven replaced core images are visually checked; 358 optional recipe variations still have no dedicated image. No fabricated image or test coverage is claimed.

Image prompts, saved paths and scope are recorded in [CORE-DISH-IMAGES.md](CORE-DISH-IMAGES.md). The earlier feature matrix and device walkthrough remain in [FEATURE-REVIEW-IMPLEMENTATION.md](FEATURE-REVIEW-IMPLEMENTATION.md).
