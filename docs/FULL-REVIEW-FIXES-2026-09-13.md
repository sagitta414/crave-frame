# Full review fixes — 13 September 2026

Published to the existing Crave Frame site in versions 104 and 105.

- Recommendations: production diagnostics established that the model response was failing catalog-pair validation. The model now selects numbered eligible pairs using a constrained response schema; the server resolves those indices to trusted catalog records. Live Home verification returned three AI pairings without the fallback banner. Editorial-review failures downgrade unverified connections to practical matches rather than discard the dinner choices. Fallbacks have accurate messaging and an explicit retry, and quota errors retain their explanation.
- Recipes: all 64 ready-protein base/variant recipes rebuild instructions from their final ingredients. Fish checks and canned-food draining appear only where relevant; tortillas, pita, rice, pasta and couscous receive the appropriate base and serving directions. Recipe quantities, preparation requirements and timing disclosures remain in effect.
- Movie nights: Home passes its visible title, the movie-night screen includes an explicit movie picker, and the concierge names the selected watch. The selected movie's runtime uses the existing watch-budget selection logic. Empty concierge results preserve their specific explanation rather than overwrite it with a subscription-filter error; pinned titles offer a direct route back to limits and catalog matching.
- Taste: mood, cuisine and average cooking time use rated evenings only. Zero-rating households display Still learning and No saved preference, verified live.
- Dinner-first: preference copy and fallback actions refer to choosing a watch. Shared meal/protein controls appear once above the watch cards, verified with Margherita pizza.
- Missing variant photos: intentionally styled recipe cards identify the protein, meal and cooking estimate and disclose that a photo was not provided. No other protein's photo is substituted. Verified visually in the existing turkey-taco saved evening.

Validation: 98 backend tests, 14 TV tests, TypeScript, production export/build, and a numeric-choice regression check passed. Live UI checks confirmed recommendation recovery, neutral Taste state, movie selection and named concierge context, dinner-first copy and comparison controls, and the variant card. No new evening was saved during this fix pass; the earlier review's test evening remains. Physical Fire TV and actual recipe cooking were not tested.

The live Ratatouille premiere request also returned three eligible dinner choices while preserving the selected movie.
