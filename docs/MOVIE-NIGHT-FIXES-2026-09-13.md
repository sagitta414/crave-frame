# Movie-night fixes — 2026-09-13

Resolved all three findings in RETEST-2026-09-13.md:

- Three-Act Dinner preserves the selected movie and uses explicit preparation-time, servings and dietary controls.
- Suggestions contain catalog-owned starter, main and dessert recipes. Combined preparation time is checked against the selected limit; saved exclusions also apply to both side courses.
- Movie-only formats require a feature film when the current selection is an episode.

Course plans persist through review, saving, cooking and protein substitution. Cooking instructions include per-course quantities scaled to servings. The photo is labelled as the main-course illustration.

Validation: 102 backend tests and 14 TV tests passed; TV TypeScript and production builds passed. Isolated browser journey with simulated Silk user agent: Chef → 4 people / 45 minutes → three-course dinner → ingredient confirmation → save → cooking step with 320 g cucumber. Selecting Detectorists then Movie nights displays the movie-selection guard and no build action. External providers were mocked in that local journey. No physical Fire TV or actual cooking test performed.

Publication: source 28c5f07531bc2d67de32f3ee5116951a7e4613dc, version 106. Live verification recorded after publication.

Live verification passed: the selected Chef movie returned three complete course plans (40, 45 and 35 minutes) using the real AI service. Chicken-to-turkey substitution preserved the starter, dessert, four-person quantities and 35-minute combined estimate. Ingredient confirmation remained required. No new live evenings or ratings were saved during this final verification. Existing household settings remained 4 people / 45 minutes / No preference.
