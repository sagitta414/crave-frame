# Practical evening refinement

Implemented locally on 21 October 2026. This record does not confirm deployment.

## Changes

- Four quick starts persist household preferences while retaining dietary restrictions and stricter cooking budgets.
- The featured evening shows effort, total time including 25 minutes to eat, and expandable scaled ingredients. Pantry matches are explicitly unverified stock, not a shopping guarantee.
- Change dinner keeps the title; change show keeps the dinner and adaptation while excluding the original title.
- A liked dinner offers a new-show shortcut.
- The phone preparation checklist leads with servings, ingredients, equipment, and a clear preparation progress count.
- Larger food artwork, restrained warm and green accents, responsive cards, and focus feedback reinforce the existing visual language. Secondary details expand on demand.

## Verification and remaining work

Automated regressions cover preference preservation, ingredient scaling, pantry labeling, a real featured pairing, and pinned dinner/adaptation behavior. Run `npm test`, `npm run build`, and `npm run check:secrets` before publishing.

Browser automation was unavailable during this pass. Physical Fire TV, phone, and visual checks remain required. No TMDB credentials or production configuration were changed.

## Three-person usability session

Recruit three people who have not seen the app. Give no navigation coaching. Ask each to:

1. Find an easy dinner and show within their available time.
2. Explain the total time and identify ingredients they need to check.
3. Keep the show but change dinner, then keep dinner but change the show.
4. Open the phone handoff, confirm servings and preparation, and start cooking.
5. Apply a delay and compare the phone and TV schedule.
6. Rate the evening and find the option to repeat dinner with a new show.

Record completion time, wrong turns, unreadable text, unexpected recommendations, and any help required. Ask whether they would use it for a real evening and why. This session has not yet been conducted; do not present it as user validation.
