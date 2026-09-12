# Recipe imagery

The generated dish library fills the 471 missing recipe-image mappings identified in `missing-dish-photos.json`. Each recipe receives a separate generated image using its own name, ingredients, and preparation instructions. Existing image mappings are preserved.

These are AI illustrations of the intended dish, not photographs of cooked or tested recipes. The app labels generated images visibly and includes that provenance in their accessibility descriptions. Ingredient substitutions and dietary adaptations may change the finished dish; the selected recipe instructions remain authoritative.

## Asset workflow

- Generate one image per recipe with the built-in image generation tool.
- Depict only listed ingredients, respecting preparation and serving format. Conditional generic instructions do not authorize adding unlisted ingredients.
- Use close views, warm natural light, and clear separation between food and background for television viewing. Avoid embedded text, logos, props, and unrelated side dishes.
- Save optimized JPEGs in `assets/meals/generated/<recipe-id>.jpg`. Full-resolution originals are archived separately on the development machine.
- Run `node scripts/index-dish-images.cjs` to rebuild static asset imports. Run with `--check` before release to reject incomplete coverage.

The generation prompt combines each recipe's name, ingredient names, and step text with the visual constraints above. `missing-dish-photos.json` records the recipe inputs used for this image set.
