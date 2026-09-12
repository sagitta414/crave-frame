# Testing and verification

## Automated

Run npm run setup, then npm test, npm run check:secrets and npm run build from the root. CI repeats these checks on pushes and pull requests. The backend currently has 71 regression tests; the TV app is type-checked. Tests use in-memory/local SQLite and mocked model/catalog responses. No external credentials are required for this suite.

Coverage includes deterministic filtering, candidate IDs, source-excerpt checks, variety, timing, ingredient scaling, feedback, persistence, sharing, parental controls, group planning and ordering handoffs. A passing suite does not establish live model quality or device usability.

## Remote-only device rehearsal

- Launch the current /tv/ build in Silk on the target Fire TV.
- Navigate search, preferences, pairing details and ingredient confirmation using only the remote.
- Read the smallest essential labels from the normal couch distance.
- Scroll down, return up, open/close a modal and verify focus returns sensibly.
- Watch the matching animation; pause it and test the device reduced-motion setting.
- Cancel a long request and recover without losing the current evening.
- Apply a delay and compare the displayed old and new schedule.
- Scan the cooking QR on a phone, advance a step, and verify synchronization.
- Confirm order-out links leave the app and no checkout success is falsely reported.
- Exercise parental controls and an intentionally ineligible title.

## Live AI evaluation

Use the matrix in AI.md. Record provider/model, date, preferences, selected title/episode, response time and exact outputs. Run repeated requests to expose repetition. Verify familiar/easy refinements preserve the selected title and dietary restrictions. Test a disconnected provider and missing search credentials.

## Current evidence

The source snapshot derives from a deployed app with 71 passing backend tests and successful TV type-check/export. Real Fire TV use is visible in development photos, but that is not a final device regression pass. The demo script is drafted, not recorded. Document subsequent results explicitly rather than marking this checklist complete by assumption.
