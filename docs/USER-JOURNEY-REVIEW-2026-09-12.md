# Live user-journey review

Reviewed the published TV/web app after the second round of fixes. Used live providers, keyboard selection, a 1280×720 desktop viewport and a temporary 390×844 viewport. This is a usability sample, not a statistical AI evaluation or a physical Fire TV test.

## Journeys exercised

1. **Title first:** Ratatouille, 30-minute cooking limit → explicit 45-minute story dinner → swap bread for ready-cooked rice → confirm ingredients → save. Completed. The preparation warning updated with the substitution and save stayed disabled until ingredient confirmation.
2. **Cook and change plans:** Open current cooking step → next step → start and stop the eight-minute timer → return to evening → open change tools. Recipe and timer controls rendered correctly, but opening the step started cooking and the change tools subsequently offered only the coach.
3. **Series and refinement:** Search The Bear → Season 1 → E1 System (28 minutes) → dinner choices → Less work. Completed. The episode stayed fixed and the new dinners were 15, 30 and 25 minutes. All were labeled everyday options.
4. **Takeout:** Tuna & sweetcorn rice bowls → Find similar takeout → Closest match → phone handoff button. Handoff instructions and a private QR were offered. The closest query was incorrectly “curry.” The open-handoff button caused no visible navigation or new tab in the inspected browser; completion on an actual phone remains unverified. No order was placed.
5. **Dinner first:** Search meals for chicken → chicken quesadillas → find choices. Completed with The Grand Budapest Hotel, Detectorists S1 E1 and Only Murders' premiere. The screen repeated meal images, cooking times and reasons, but omitted viewing runtimes and title artwork. Phone layout stacked without obvious horizontal overflow; the header occupied substantial vertical space.
6. **Resume:** My evenings displayed both the new test evening and the existing pizza evening. The test evening could be reopened.

## Prioritized findings

### High: leaving immediately after stopping a timer can cancel the stop

Pressed Stop timer, then Back immediately. The evening displayed a request-cancelled notice. Reopening the cooking screen several minutes later showed the timer still counting down (4:28). Stopping again and waiting for the Start timer button succeeded. Navigation should not silently discard a pending timer mutation; show a pending state and preserve/finish the write, or clearly confirm its failure before leaving. The test timer was confirmed stopped at the end of the review.

### High: viewing a recipe changes the saved plan

“Open current cooking step” calls the same function as starting cooking (`tv/App.tsx:118`). For a planned evening it writes a cooking step; the Worker sets cookingStartedAt and status=cooking (`web/server/worker.js:141`). Users cannot inspect the recipe without starting the plan. Afterward the ordinary dinner-change and delay controls disappear. Separate read-only recipe preview from explicit start/completion actions; keep a usable route for handling delays while cooking.

### High: takeout recommendations overclaim matching and speed

The closest takeout query for tuna-and-sweetcorn rice bowls was curry. `orderBrief` matches either “curry” or “rice” to the same list (`web/product/evening.js:12`). “Closest match,” “Fastest arrival,” and “Best for the group” imply comparisons that have not occurred. Use ingredient/format-aware search phrases, label them as search suggestions, and reserve speed claims for actual provider ETA evidence.

### Medium: dinner-first comparison emphasizes information that is already fixed

The user has chosen chicken quesadillas, yet gets three large copies of its image and cooking metadata. Film/episode runtime, synopsis, artwork and availability are the information needed at this point. The preceding action also says “Find dinner choices,” although the user is selecting a watch. Make comparison and copy depend on the starting point.

### Medium: AI failure state contradicts its alternatives

The initial home screen reported that no grounded AI match was available, showed a title-only hero with “Find its dinner,” but alternative buttons named Ratatouille + margherita and two titles + spaghetti. The fallback title cards inherit meal labels despite the hero intentionally treating them as unpaired. Use title-only labels consistently, or explicitly present a usable catalog pairing. The failure itself succeeded on a later title-specific request; its cause was not established.

### Medium: useful constraints, weak editorial distinction

The Bear's episode choices and the dinner-first watch choices all had no direct story link. Variety and honest labels improved, but explanations largely repeated cooking time/category rather than helping choose one option over another. This sample supports a need for better editorial coverage and comparison copy; it does not establish model-wide failure rates.

### Lower: waiting and phone hierarchy

Recommendation requests repeatedly blocked the screen with a generic full-screen interstitial. Use a compact progress state describing the selected title and work in progress, and preserve browsing where possible. The phone comparison is usable, but a multi-line heading and large repeated imagery delay the actual comparison.

## Test effects and limits

Created one test evening: Ratatouille with rustic vegetable ratatouille and the ready-cooked rice substitution. Its saved state reached cooking step 2; the existing Ratatouille/pizza evening was preserved. Creating the test evening saved the approved 45-minute cooking preference. Later unsaved refinement used a 30-minute limit. A private takeout handoff was created, but no provider checkout, payment, order confirmation or feedback rating was submitted. Browser viewport override was reset.

No changes were made to app implementation during this review. Physical cooking, couch-distance reading, native Fire TV behavior and actual-phone QR completion were not tested.
