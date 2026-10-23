# Second review — 22 October 2026

Scope: updated local source, deterministic rendering/API probes, fresh automated suites, public release markers. No new full browser walkthrough or physical Fire TV test. Local preview was blocked by the browser tool during the preceding turn. This review changed no product code.

## Findings, ordered by priority

### High — custom pantry names become HTML in the kitchen page

Location: `web/product/main.js:79`, mirrored input boundary in `web/server/worker.js:128` and `web/server/companion.js:59–61`.

The latest change adds saved custom pantry values to the checkbox list. Attribute values are escaped, but the displayed label still uses raw `${x}`. The API accepts arbitrary strings under 80 characters. An in-memory API probe saved `<strong data-review="pantry">Test ingredient</strong>` successfully; running the actual kitchen rendering function returned the raw tag in the label. A person holding a pantry companion link can also submit custom ingredient names.

This confirms stored HTML injection, not demonstrated arbitrary JavaScript execution. CSP prohibits inline scripts and limits some exploit paths; it does not make HTML interpolation safe. Untrusted markup can alter the kitchen interface. Escape the displayed ingredient text and add a regression covering custom strings through both input paths. This is a regression introduced by the custom-pantry preservation change and should block deployment of the current candidate.

### High — public deployment remains behind candidate source

Fresh GET requests to `/version.json` and `/api/health` both returned HTTP 200 and version `9ef944a274d0`; health reports ready. The latest source changes are still uncommitted in the feature worktree. The new fixes therefore must not be described as public-site fixes. Correct the candidate's remaining defects before packaging and deploying; verify matching frontend/backend release markers afterward.

### Medium — instructions contradict selected serving counts

Locations: `web/product/recipe-library.js:64`, `web/product/expanded-recipes.js:47`, `web/product/catalog.js:19`, `web/product/engine.js:59–64`, and corresponding TV catalog files.

Calling `recipeSteps(gardenMinestrone, false, 'Confident', 4)` still returns “Ladle into two bowls.” Other recipes specify two bowls, two ovenproof dishes or two personal pizzas. Ingredient quantities scale but ordinary recipe prose does not. Use serving-neutral prose or explicit serving placeholders, and test one, four and eight servings. Changes to vessel size or cooking batches need guidance rather than mechanically increasing cooking time.

### Medium — pasta sequence leaves cooked pasta waiting for its sauce

Location: `web/product/recipe-library.js:128`, mirrored in the TV catalog.

Broccoli & garlic pasta first tells the user to cook and drain the pasta, then prepare the vegetables, then cook them for 12–15 minutes. Following the sequential cooking UI leaves drained pasta waiting through preparation and sauce cooking. The accompanying tip says to have the sauce ready first, contradicting the step order. Prepare first, start the sauce, and give explicit overlapping pasta timing. Confirm beginner instructions work when followed literally. The sauce text also contains the new punctuation error “last minute, .”; cosmetic, but evidence that string assembly needs a rendered-content check.

### Medium — an initialization loop still erases explicit cuisine metadata

Location: `web/product/catalog.js:53`, mirrored in TV.

The category overwrite was fixed, but the cuisine loop still unconditionally assigns `cuisines[meal.id]`. Ratatouille declares European cuisine in its recipe, then receives undefined because it is absent from that lookup. A deterministic probe found `mealCuisines` includes undefined and `filterMeals('ratatouille', 'All recipes', 60, 'European')` returns no matches. Preserve explicitly declared cuisine values and ensure filter options contain no empty values.

## Confirmed improvements

- Catalog-mode concierge rendering offers watch-first and meal-first actions without AI-only controls or provider marketing.
- Takeout ETA regression passes for empty, invalid and valid estimates, provider changes, and unrelated actions.
- Broccoli pasta no longer names unrelated vegetables; its pasta tip appears no more than once.
- All recipes marked as having dish images resolve to files in the browser asset source. This is file-existence validation, not visual ingredient verification or deployed CDN verification.
- The 20 editorial nights reference valid distinct meals and retain legacy theme lookup compatibility.
- Schedule projection, household capability, TypeScript and scrolling regressions continue to pass.

## Verification

Fresh results: 189 web tests + 44 TV tests + 10 AWS tests = 243 passing tests, plus scrolling checks. The identified defects are not covered by those tests. No fresh build or dependency audit was required for this review because product code was unchanged; preceding build success and 14 high dependency findings remain the last known results.

## Recommendation

The candidate is improved but not ready to deploy unchanged. Fix the pantry escaping regression first, then cuisine preservation, serving-aware prose and pasta sequencing. Add behavioral/content regressions for these cases, deploy a verified release, and perform the real remote-plus-phone walkthrough. More features should wait.

## Remediation completed in local source

The four product defects above are now fixed:

- Pantry labels escape custom ingredient text while preserving the original value. A regression exercises both authenticated pantry updates and private phone pantry confirmation, then runs the kitchen renderer against the returned data to confirm markup remains literal text.
- Explicit cuisine survives catalog initialization; filter choices exclude empty values. Ratatouille is returned under European cuisine.
- Serving prose uses neutral plating or per-person directions. Expanded burgers use patties per bun, sandwiches use half the bread slices, and pizzas/pies/parcels explain individual portions. Non-default serving counts receive batch and doneness guidance; timer durations are not multiplied. Tests cover one, four and eight people across the catalog.
- All ten library pasta recipes prepare ingredients first, start the sauce, then cook pasta alongside it. They describe how to handle a sauce finishing first or vegetables needing more time, fix stray punctuation, and retain four steps for saved progress compatibility.
- Browser and TV catalog copies are synchronized for these changes.

Fresh validation: 193 web + 44 TV + 10 AWS tests passed (247 total), along with TypeScript, scrolling regressions, secret-pattern scan and browser/TV production build. No fresh browser visual or physical Fire TV validation is claimed. Product changes are local; the AWS deployment gap remains outstanding and requires publishing the corrected release through the authenticated AWS deployment workflow. This remediation does not resolve the separately reported dependency audit findings.
