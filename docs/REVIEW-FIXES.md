# Critical review fixes — September 12, 2026

## Changes

- The default AI shortlist favors core recipes, dish-specific imagery, and familiar choices. The full 527-recipe library remains available for explicit selection; 400 entries are labeled variations. No recipe is newly claimed to be kitchen-tested.
- Existing documented food connections remain candidates even if a model overlooks them. For a selected title with an eligible documented dinner outside the cooking budget, an optional longer-time offer explains the difference. Selecting it changes only the cooking limit and opens ingredient review. Current choices remain within the original limit until that explicit action.
- The TV home puts title, dinner, duration, and the primary action together. The comparison screen puts all three review buttons above the fold at 1280×720. Persistent resume information is compact, and the active-evening banner is omitted on the comparison screen.
- Both web and TV use 161 existing dish-specific illustrations. The TV fallback is an honest unavailable-photo label, replacing the abstract plate drawing. AI-generated image labels remain.
- Timing labels identify prepared ingredients. Ingredient review lists which items must already be cooked, including an approved substitution when applicable. Raw preparation is not silently counted as complete.
- Practical-choice explanations are concise. Detailed sources and recipe facts remain available without repeated disclaimers or unexplained “DNA” labels.
- Browsing reconciles the known legacy Detectorists and Only Murders premiere records with imported episode names, while keeping other episodes and movie editions distinct.
- The standard test command discovers and runs the TV test files, in addition to backend tests, TV type-checking, and scrolling regressions.

## Verification

- 77 backend tests and 11 TV tests passed; TV type-checking and scrolling regression checks passed.
- Production TV export and Worker/web build passed.
- Isolated local browser rehearsal used the real app and Worker with in-memory persistence and mocked AI/catalog providers (`web/scripts/review-preview.mjs`). It exercised title search, comparison, the explicit 30-to-45-minute offer, ingredient approval, saving, QR dialog presentation, and Escape dismissal.
- Desktop screenshot inspection at 1280×720 confirmed the primary home action and all three comparison review actions are visible. Phone-size inspection at 390×844 confirmed responsive stacking and an accessible primary action.

These checks do not establish real model taste, physical recipe timing, couch-distance readability, or native Fire TV performance. The existing remote-only device checklist in TESTING.md still requires a hardware rehearsal. Kitchen-test a representative core menu before describing recipe timing or taste as validated.

## Follow-up: selected issues 1, 2, 3, 5 and 6

- The longer story-linked dinner appears above the standard choices and still requires explicit approval.
- Fully cooked and precooked ingredients now receive preparation warnings.
- Meal facts use plain descriptions without numerical bars or calculated labels.
- Narrow model candidate lists are supplemented from the eligible catalog for distinct meal formats; invalid AI output still fails, and unsupported links remain practical.
- Tonight retains recommendations and the selected alternative in session memory across navigation, with an explicit New suggestions action. Alternatives identify the title and dinner.
- 79 backend and 13 TV tests pass, including preparation, shortlist diversity, session retention, retry and stale-response checks. Build passes.
