# Movie preferences, kitchen exclusions and protein choices

Movie and episode selection now opens visible cooking-time, servings, food-preference and effort controls before requesting meals. The selected title is preserved. Additional viewing and matching options remain available.

Kitchen stores multi-select allergen exclusions separately from freeform ingredient dislikes. Ingredient-name screening runs in AI eligibility, catalog curation, recovery, kids choices, recipe search, protein options and final evening creation. Product labels and cross-contact cannot be verified from recipe ingredient names; the UI states that limitation.

Protein choices are available from proposals, details and review. Ready-cooked protein recipes have registered variants with revised ingredients and reheating instructions. Other recipes offer clearly labeled alternative recipes, favoring the same dish category. The movie, time, diet and exclusions stay active. Switching resets ingredient confirmation and removes the old pairing explanation. Group plans return to group planning.

Validation: 89 backend tests and 14 TV tests pass, plus TypeScript, remote regressions and production build. New tests verify allergy aliases, persistence and invalid inputs, AI/protein filtering, final-save rejection and changed protein in shared phone ingredients and instructions. Simulated Silk walkthrough: Ratatouille -> 45 minutes / 4 people -> Kitchen shellfish exclusion and mushrooms -> matching dinners -> turkey pasta -> unconfirmed ingredient review with the same title and portions.
