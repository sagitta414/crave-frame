# User journey fixes

- AI provider failures now return explicitly labelled catalog recipe matches within existing limits. This is continuity during a provider outage, not a claim that the provider itself has recovered. The response identifies `recommendationSource: catalog` and the home and comparison screens disclose the source.
- Home Adjust opens people/time/food preferences for the displayed title. Editing allergies from preferences opens Kitchen Food.
- Kitchen food editing uses an isolated form draft, explicit save/discard, and a remote-friendly Clear avoided ingredients action. Saving an empty list removes exclusions and invalidates recommendation history/cache.
- Correction to the original review: the browser automation's empty `fill` did not actually clear the input. Select-all and Backspace did. The previously reported persistence failure was not established as a backend bug. Normal clearing and a fresh Taste view were verified after this change.
- Cards and review display whether direct protein swaps exist under current restrictions. Unsupported recipes offer another meal explicitly.
- Empty results retain the chosen title, have no numeric rendering artifact, and link directly to dinner preferences.
- Flatbread finishing instructions no longer trigger a sauce-topping tip from the noun “top.”
- Cooking sessions inactive for over six hours offer a fresh, ingredient-reviewed plan while retaining the original record and steps; stale live schedules are hidden.

Validation: 95 backend tests, 14 TV tests, TypeScript, remote regression checks, and production builds passed. Browser preview simulated an AI outage and verified labelled fallback, Adjust preserving the displayed title, save/clear/read preferences, unavailable swap messaging, and empty-result recovery. Physical Fire TV and actual recipe cooking were not tested.
