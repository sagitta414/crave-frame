# Crave Frame: current demo scope

Crave Frame coordinates dinner and entertainment across a Fire OS app and a phone companion. It recommends what to watch; it does not stream movies or TV shows.

## AI that changes a decision

- Discovery: server-side recipe and viewing limits produce eligible pairs. Gemini selects and explains three; catalog alternatives are explicitly labeled. A catalog preview can appear first, with an explicit reveal when AI choices are ready.
- Change tonight: Gemini interprets the request, catalog rules enforce the constraints, then Gemini compares up to nine eligible alternatives and recommends up to three with explanations and tradeoffs. Failed comparison falls back to labeled catalog alternatives.
- The model cannot replace the stored recipe quantities, timings or instructions. Ingredient approval is required before a changed plan is saved.
- Pantry recognition, household matching, cooking questions and taste reflection are additional AI functions. Memory consists of explicit saved preferences and feedback.

## Honest limits

Cooking comparisons now include recipe step counts, prep actions explicitly named in the steps, and named equipment. The workload index combines recipe minutes, step count, prep-step count and equipment count; it is a heuristic, not measured active time. “Easiest of these” compares the displayed choices only. Familiarity labels require explicit saved meal or cuisine preferences; otherwise the app uses “Comfort pick.” “A different direction” does not claim an unseen title.

The curated recommendation shelf has recipe-specific artwork. Artwork illustrates each base recipe and is not a photograph of a tested result. Ingredient substitutions do not regenerate the image automatically. Remaining searchable recipes retain recipe cards where a matching photo is unavailable.

The searchable recipe library is larger than the automatic recommendation shelf, which is capped at 48 curated recipes. Recipes are demonstration recipes, not kitchen-tested; times are estimates and larger batches may take longer. Available photographs are illustrative. Recipes without a matching photo use a recipe card. No verified ingredient-price savings or allergy-safety guarantee is provided.

The native target is Fire OS / Android TV, not Vega OS. The browser URL is a preview, not a Fire TV simulator. The APK is a sideload demo signed with the template debug certificate. AI has daily usage limits and requires network access; catalog planning has no model dependency but still requires the backend.

## Suggested demo sequence

1. Choose a movie or episode and set dinner preferences.
2. Reveal AI pairings and inspect the explanation.
3. Request: keep the watch, add two guests, reduce cooking effort.
4. Compare the proposed recipe, servings, time, step count and tradeoff.
5. Approve ingredients and open the cooking handoff on a phone.
6. Save feedback and show the next recommendation using that preference.

Use a starting meal with room to reduce effort; if no valid change exists, show the honest empty state instead of promising a result.

## Verification and submission

Recent TypeScript, web export and APK builds have passed. Subsequent implementation turns have intentionally skipped functional and device tests at the owner's request. Older README verification notes are historical and do not establish that the latest release has been tested.

Still to verify for submission: the final app running on a Fire TV or accepted simulator, a public source repository with license and complete backend setup instructions, the final demonstration video, asset permissions, product feedback and any genuine friction log. Do not describe these as completed solely because the APK compiles.
