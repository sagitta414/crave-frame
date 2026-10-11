# Critical review — September 13, 2026

Assessment: promising prototype, not ready for a confident public launch. The latest additions work in their main paths, but trust, consistency and TV usability need more attention than additional features.

## High priority

1. **Allergy screening is an incomplete keyword heuristic.** `web/product/food-restrictions.js:15` treats ingredient strings as sufficient evidence. Direct probes returned false for Milk + Ghee and true for Sesame + Sesame-free bread. These are function probes, not evidence that ghee is currently served by a catalog recipe. FDA guidance explains that ghee can contain residual milk protein: https://www.fda.gov/media/117410/download. Use structured ingredient/allergen metadata, explicit unknown states, and consistent adapted-recipe validation. Retain label and cross-contact review; do not present the feature as an allergy-safety guarantee.

2. **Change protein can replace the whole dish.** `web/product/protein-options.js:7` prioritizes the original recipe family, then category, but falls back to unrelated recipes. A direct call for `story-ratatouille` returned eight sweetcorn rice-bowl alternatives, all `sameRecipe:false`. Alternatives are labeled, but the entry action promises a narrower change. Separate “Swap protein” from “Choose another meal,” and only offer direct swaps where instructions support them.

3. **Two preference editors can contradict each other.** `tv/App.tsx:94` refreshes household data without refreshing the ingredient-input draft. `TasteMemory` in `tv/src/Intelligence.tsx` removes a saved exclusion through `onUpdate(setHouse)`, while `saveKitchen` sends the old `avoidText` draft. Removing an exclusion then saving Kitchen can restore it. Confirmed by code tracing; browser reproduction was interrupted by local API connectivity. Use one draft source and an explicit save/cancel lifecycle.

## Medium priority

4. **Kitchen is too long and poorly ordered for TV.** Measured 5,146px tall at a 720px viewport, roughly seven screens. Taste Twin occupies the opening section before allergies. Streaming, music, pantry, preferences and remembered feedback share the page. Put allergies/diet first and split the remaining tasks into short panels. Duplicate Save my kitchen controls and a separate streaming save make the save boundary harder to understand.

5. **The TV changes enlarge content without reducing complexity.** Global 32px minimum type plus stacked meal cards creates lengthy pages. The fixed Down/Up/Top dock overlays the viewport; bottom padding clears only the final content, not every intermediate action. A focused dinner view with a short comparison summary would suit a remote better than a long form. Physical Fire TV scrolling, focus and overscan remain unverified in this review.

6. **Recipe reliability is weaker than the polished presentation suggests.** Catalog metadata explicitly describes demo recipes and estimated timings. Protein recipes depend on ready-cooked ingredients. A larger library and convincing dish images do not establish tested yields, times or outcomes. Prioritize a smaller kitchen-tested set and show preparation assumptions beside the main time estimate.

7. **The core dinner flow depends too heavily on AI availability.** `web/server/worker.js:75` returns no picks when AI fails, even with a local recipe catalog. Keeping failures honest is correct, but the user needs an explicit “Browse matching recipes without AI” path preserving the selected title and restrictions.

## Lower priority

8. Intro/music behavior needs a coherent returning-user policy. The story plays on normal launches, Play music is separate from the saved sound-effect setting, and Pause story does not pause music. These are explicit implementation choices rather than confirmed faults, but deserve intentional product decisions instead of accumulating controls.

## Review coverage and limits

Inspected current implementation and used the existing simulated-Silk browser preview. Measured Kitchen and tested ingredient input. Ran direct screening and protein-option probes. The preview API stopped responding during the saved-preference removal attempt; no production settings were changed. This was a review, not a repair or deployment. Previous automated passes do not cover all issues listed here, and no physical Fire TV pass was performed.

Recommended order: allergy metadata and save consistency; true protein swaps; shorter TV flows; validated core recipes and explicit non-AI fallback. Defer further decorative features until those are stable.
