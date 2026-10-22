# Our night in

Implemented locally on 22 October 2026. This document does not confirm production deployment or physical-device validation.

## Experience

The home screen introduces Our night in after the first recommendation shelf. A dedicated screen saves a usual day, kind of evening, cooking budget, and existing food, viewing, and streaming preferences. Two servings is the initial setup; this does not overwrite household preferences merely by opening the screen.

The shortlist offers a familiar favorite when available, a dinner/title absent from saved history when possible, and another distinct occasion. If fewer eligible pairs exist, it shows fewer; it does not manufacture favorites or loosen exclusions. Vibes adjust soft mood/energy ranking. Saved easier-cooking and shorter-viewing preferences influence the shortlist and are explained onscreen.

Optional rituals support unwinding, play, reconnection, or a special occasion. There is no required disclosure, intimacy score, or answer collection. A chosen ritual is copied into the saved evening so later setup changes do not rewrite an existing evening. It appears on the TV plan and after cooking on the phone.

Couples can create a two-person private-vote room. Both join using the existing phone handoff. A third guest is rejected. Existing private-vote rules remain: the host reveals after all joined members vote. Browser hosts refresh room state explicitly; TV hosts use the existing polling flow. Link access remains bearer access, with the existing 24-hour expiry and privacy disclosure.

A favorite-dinner action finds another episode within current limits while keeping the dinner adaptation. This is **not automatic next-episode tracking**. The recurring day is a saved planning preference, **not a scheduled notification, automatic booking, or automatic weekly generation**. New choices are generated when requested.

## Runtime and data

- `PUT /api/our-night`: validate and save day, vibe, preferences, and streaming options in the authenticated household JSON.
- `POST /api/our-night`: produce a catalog shortlist through the existing availability and restriction filters, plus feedback explanations.
- `DELETE /api/our-night`: clear the saved routine.
- Existing household revision checks, parental lock, capability response shape, and household isolation apply.
- Rooms accept `maxMembers: 2` or `8`; legacy rooms retain eight.
- `couplesNight: true` on night creation copies only the saved day/vibe into the evening. Shared cooking views receive this snapshot alongside the existing plan.
- No schema migration, new credentials, AI provider, notification service, or public sharing is introduced.

## Verification

### Personal finishing touches

The existing night-in heading now uses the saved day (for example, Friday, just us). Optional finishing ideas cycle through a song, place settings, and a name for the evening; no extra recipe or automatic task is created. Completion copy says, Dinner is ready. The rest of tonight is yours, while retaining the viewing guidance and next action.

Setup can follow the selected mood, keep one favorite ritual, or choose No prompts. No prompts hides both conversation and finishing suggestions. The choice is validated, saved in the routine, and copied into new couples evenings. Clients omitting the new field preserve the existing setting. Already saved evenings keep their snapshot. Shared-pace copy describes an easy dinner or cooking together without attributing anyone's energy preference. No matching, voting, navigation, or schedule algorithms are changed in this pass.

### Shared pace and preparation follow-up

Two-person rooms now collect an energy preference on each phone: Keep it easy, Up for cooking together, or Make it special. Matching waits for both people to join. It uses the gentler preference and never expands existing time or food limits. Keep it easy selects easy recipes and caps cooking at the lower of 30 minutes and the existing budget. Individual energy values are omitted from room responses even after reveal, and from saved group members; the resulting shared recipe limits remain visible. Legacy submissions without a value default to Keep it easy.

Saved couples evenings offer optional Kitchen lead / Set the scene preparation suggestions, with a swap button. These are local suggestions, not synchronized assignments or extra recipe steps. Partners choose who does what together. The same panel retains the optional conversation starter, without collecting answers.

Our night in now has a prominent Do this evening again action alongside the alternate-episode option. It opens an unconfirmed draft using the same dinner, title, servings, and adaptation. Old timers, schedule, watch progress, ingredient confirmations, and voting-room access are not copied. The original saved evening remains intact; a fresh schedule starts only when the new plan is approved. Couples styling follows the saved routine currently configured for the household.

Regression checks cover gentler-pace selection, individual energy omission before/after reveal and in saved plans, role swapping, and fresh repeat drafts. These are automated results, not a physical two-phone test.

Automated checks cover persistence, household isolation, validation, capability preservation, constraints, preference-based ranking, distinct shortlist choices, phone ritual snapshots, browser setup actions, and the two-person private-voting flow. Production build and secret checks must pass before deployment.

Still required: physical Fire TV navigation and readability, phone QR scanning and clipboard behavior, a complete two-person session, and a fresh-user usability session. No claim of real-world relationship benefit or retention validation is made.
