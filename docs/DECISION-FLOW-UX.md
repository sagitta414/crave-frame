# Dinner decision and completion UX

Implemented the six app recommendations:

1. The TV featured evening and browser recommendation cards explain practical fit using recipe time, effort and total time including 25 minutes to eat. An over-budget pairing is never described as fitting.
2. A visible secondary “Keep the title, change dinner” action sits beside the TV hero's primary planning action and on browser recommendations. It preserves current limits. Browser exclusions apply to this draft rather than permanent household dislikes. TV uses the existing recommendation/refinement endpoint.
3. The TV review screen has a large dish illustration and effort/equipment signals alongside the ingredient list and expandable full instructions. Browser review exposes equipment, step count and all steps before saving.
4. Saved planned evenings say “Check ingredients”; active cooking says “Continue cooking.” The TV next-step panel appears before detailed timing controls. Secondary timing and change controls no longer compete with its primary action.
5. Confirmed cooking completion shows a brief entrance reveal and the saved viewing choice on TV and the shared phone cooking route. The existing motion preference and system reduced-motion behavior apply. The browser completion panel also respects reduced motion. No sound or automatic streaming playback was added.
6. Empty results explain known viewing-time, total-time, format or family-filter conflicts. When the exact cause is not known, copy describes the active limits without pretending to diagnose a single cause. Recovery requires explicit user action; no food restriction or filter is silently changed. TV empty-result actions open the relevant preference controls or title search.

Verification: 141 web tests and 42 TV tests (183 total), TypeScript, remote-scroll checks, production build and configured credential-pattern scan passed. Browser-control initialization failed, so this is not a verified browser screenshot review or physical Fire TV walkthrough. Check the hero, review, empty-result and completion layouts on the user's TV before deployment.

This source change does not itself publish the public site, push GitHub, or update an installed APK. Prior unresolved dependency advisories and real-world kitchen/device validation remain documented in REVIEW-CLOSURE-2026-10-18.md.
