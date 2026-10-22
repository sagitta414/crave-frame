# Critical judge review — 22 October 2026

Scope: source review of current local feature branch, current automated tests, official public judging criteria. No fresh rendered UI inspection, physical TV, or two-phone session. Web retrieval could not access the AWS application; that is a tool limitation, not proof the application is down. Devpost connector authentication did not complete; criteria were read from the official public event page instead.

Official source: https://amazonappdev2026.devpost.com/

## Provisional assessment

Scores below are personal review estimates on a ten-point scale, not official judge scores or weighting.

| Criterion | Estimate | Reason |
| --- | --- | --- |
| Tech Implementation | 7 | Household isolation, private votes, constraint validation, phone progress and delay projection are substantive. Current deployment parity and device behavior remain unverified. |
| Design | 6.5 | Strong dinner/show hierarchy and warm couples direction, but choices, setup, extras and repeated explanations accumulate. Source-level simplification is not visual validation. |
| Potential Impact | 6.5 | Couples deciding dinner and entertainment is a specific plausible need. No observed repeat usage, kitchen trials or customer evidence yet. |
| Quality of the Idea | 8 | Shared TV decision, private phone preferences, practical dinner preparation and recovery combine into a coherent use case. Generic ritual prompts are easy to copy and should not lead the pitch. |

Overall: approximately 7/10, worth submitting, not yet a demonstrated polished contender. This is not a win-probability prediction.

## Findings and actions

1. **High — source/live gap:** recent improvements remain local. A judge cannot credit features absent from the supplied build/video. Push and deploy a known commit, smoke test it, and record that exact version.
2. **High — device proof:** demonstrate the working app on Fire TV or the supported simulator and show actual phone synchronization. Automated scrolling checks do not replace this.
3. **Medium — interaction overload:** quick starts precede the hero, the hero contains expanded supporting facts, and couples setup/rituals compete with choice. Changed locally: hero first; facts under disclosure; couples setup initially collapsed; optional touches under disclosure.
4. **Medium — hidden setup save bug:** TV users could edit settings, hide setup, then request choices from stale stored settings. Fixed by persisting displayed settings before requesting choices; added interaction regression.
5. **Medium — duplicate setup in shared voting:** host setup followed by each guest's preferences can feel like administration. For the demo, explain the short shared path and omit optional fields. Further structural changes should wait until after device validation.
6. **Medium — promise discipline:** no automatic next-episode tracking, notifications, playback, or order placement. Catalog matching must not be presented as live AI. Exact title search needs a working configured TMDB connection; this review did not establish its live status.
7. **Medium — content trust:** illustrative food images and non-kitchen-tested recipes require accurate labels. Curated story matches should lead the demo; arbitrary practical pairs weaken the central premise.
8. **Medium — privacy wording:** individual energy choices are omitted from responses, but a partner can infer preferences from resulting constraints. Describe what is hidden, not absolute secrecy.
9. **Medium — evidence of usefulness:** a second unprompted evening from a fresh user is better evidence than more optional features. No retention or relationship-benefit claims are established.

## Simple judge-facing flow

Choose an evening → optional private two-person choice → review ingredients → QR to phone → cook → apply a delay → observe both screens update → remember the dinner.

Suggested demo allocation, approximately 2:40: problem and TV (20 seconds), choose together/reveal (40), phone handoff (30), real delay recovery (35), repeat/favorite (20), architecture and limitations (15). Keep optional rituals to one brief moment after the functional payoff.

The public event page lists the deadline as October 23, 2026 at noon Pacific (3 p.m. Eastern), a video shorter than three minutes, repository/run materials, developer feedback, and Fire TV/device or simulator demonstration. Verify submission completeness against the actual form; this review does not certify submission or eligibility.

## Remaining verification

- Publish and verify the exact commit intended for submission.
- Remote-only choice and back navigation, 8–10 feet from a TV.
- Two separate phones join, vote, and receive the reveal.
- Cooking and a delay update the TV and phone coherently.
- Exact-title search or a clearly described working catalog path.
- Confirm assets and demo media are appropriately licensed; do not treat source attribution as permission.
