# Review fixes and remaining physical validation

Implemented:
- Exact ingredient composition records replace substring allergy guessing. Known and unknown selected allergens are excluded. Unknown products fail closed. This does not certify brands or cross-contact handling.
- Direct protein swaps stay in the same recipe family. Changing to another dish is a separate explicit action.
- Changes to saved ingredient exclusions synchronize the Kitchen draft. Food has save/discard controls; Pantry and Streaming have their own labeled saves.
- Kitchen opens with food restrictions, with Pantry, Streaming, Playback and Taste in separate panels.
- Silk shows one dinner at a time, with numbered choice controls. Extra matching details are collapsed. The scroll controls occupy reserved space beside the main content.
- An explicit non-AI recipe-matching action retains title, preferences, household exclusions and selected streaming constraints.
- Recipe proposals and reviews disclose that recipes are not kitchen-tested and times are estimates. Existing prepared-ingredient notes remain visible.
- Pausing the intro also pauses its music. Playback settings describe the opt-in music policy and separate sound effects.

Validation: 92 backend tests and 14 TV tests passed, plus TypeScript, remote regressions and production builds. New regressions cover ghee, sesame-free bread, buckwheat, unknown products, direct swap boundaries and non-AI matching. Browser walkthrough confirmed the saved-exclusion removal no longer returns after saving, the new Kitchen sections, non-AI matching with the chosen movie, switching focused dinner cards, and explicit alternative-meal consent. Kitchen Food measured 1754px at a 720px viewport, compared with the previous 5146px Kitchen page.

Still requires physical validation: Fire TV remote/overscan behavior and actual recipe cooking. No recipe has been newly marked kitchen-tested. See KITCHEN-VALIDATION.md.
