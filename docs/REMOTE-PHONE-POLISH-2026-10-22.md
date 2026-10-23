# Local remote, layout, recovery and hero pass

## Changes

- Directional navigation now visits the second line of wrapped navigation before leaving it. Added a regression running the actual keyboard handler with a two-line navigation layout; verifies Down, Right, Up and exit to content. Disabled buttons cannot regain preferred/restored focus.
- Back dismisses a visible error before navigating away. Existing dialog/delay/order dismissal priorities remain intact. Silk cursor scrolling is unchanged.
- Retained the preceding narrow-layout fixes: wrapped navigation, stacked search input/submit, bounded saved cards, and a full-width hero text column on narrow screens. Hero dinner name uses its existing short name when available and a two-line visual limit; accessibility retains the full recipe name.
- Phone web sessions pause polling offline and refresh when online again. Visibility and native app lifecycle handling remain. A response started before disconnection cannot replace the recovered state. If reconnect occurs during a request, a new read is scheduled immediately after that request settles, without overlapping reads. No cooking mutations are queued or replayed by reconnect.
- Featured evening selection now prefers recipe-specific photos, then reviewed illustrations and readable names, from already-eligible results only. It does not relax allergies, diet, time or other server filtering, change recipe ingredients, or substitute another dish's picture. If all eligible meals lack photos, the honest unavailable placeholder remains.

## Verification

211 web tests and 51 TV tests passed (262 total), plus TV type checking, remote-scroll regressions and the new wrapped-navigation regression. Production build and configured secret-pattern scan passed. New tests cover reconnect during a pending read, saved step/timer recovery, spotlight ranking, empty results and preservation of eligible choices.

The existing connection test also covers failed read followed by successful retry. Reconnect is read-only; no automatic replay of writes was introduced. This is not a claim of end-to-end exactly-once delivery under every network failure.

## Still requires hands-on acceptance

Local browser access was previously blocked by browser policy. No alternate route was used. These changes were compiled and tested, not visually confirmed on a local browser or physically on Fire TV/phone.

1. At 320/390/768px, inspect navigation, Search submit, focus outlines, and hero wrapping.
2. At 720p on Fire TV, navigate through each screen with D-pad/Center/Back, including dialogs and the paging dock; confirm no clipped focus or traps.
3. Scan the cooking QR, advance once, disable phone connectivity, reconnect, and compare the saved step/timer with the TV. Confirm a failed write is reconciled by reading saved state before repeating it.
4. Confirm the chosen hero dish image matches its recipe, including any clearly labeled adaptation/illustrative limitations.

No commit, push or deployment performed.
