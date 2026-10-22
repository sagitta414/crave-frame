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

Automated checks cover persistence, household isolation, validation, capability preservation, constraints, preference-based ranking, distinct shortlist choices, phone ritual snapshots, browser setup actions, and the two-person private-voting flow. Production build and secret checks must pass before deployment.

Still required: physical Fire TV navigation and readability, phone QR scanning and clipboard behavior, a complete two-person session, and a fresh-user usability session. No claim of real-world relationship benefit or retention validation is made.
