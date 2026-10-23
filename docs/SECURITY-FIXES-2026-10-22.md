# Security remediation — 22 October 2026

## Implemented

- Photo reads require an explicit active access grant, rather than only a known object key.
- Stopping collection sharing rotates owner/view grants and revokes editor access. Resharing never reactivates the old photo URL.
- Owners create editor links explicitly; links expire in one hour and can be revoked without deleting the collection.
- Owner collection reads safely initialize grants for older collections. Legacy editor links without expiry fail closed. Previously issued bare photo URLs no longer work.
- A daily 10 MiB allowance applies independently to each household. The previous global lifetime counter is no longer used. This is an upload-traffic allowance, not a live-storage gauge: successful uploads and conflicting saves consume it even if the new object is subsequently removed. The daily key rolls over automatically, old counters are removed after seven days, and failed S3 writes refund their reservation. Retained files remain bounded by the existing 60-collection and image-size limits. Use AWS budget/storage alarms for aggregate operational monitoring.
- The secret scanner now covers text files including .env and Python, AWS access IDs, JWTs, credential URLs and private keys. A batched Git-history scan runs in CI with full checkout history. Results print locations only.
- Dependabot vulnerability alerts and automatic security-update pull requests are enabled; weekly dependency and Actions updates are configured.

## Verification

Validation: 215 web + 55 TV + 10 AWS + 4 Python tests passed (284 total). TV type checking, remote/paging checks, production build and secret scans passed.

Regressions exercise owner/view/editor separation, unsharing, resharing, revocation, expiry, legacy owner grants, independent household limits, day rollover, and historical credentials removed from the working tree. Existing PostgreSQL private-media tests now supply the required access grant.

## Unresolved external items — do not describe this as fully security-cleared

### Upstream TV advisories

The registry's latest braces (3.0.3) and node-forge (1.4.0) are affected. Both official advisories list no patched version:

- https://github.com/advisories/GHSA-vfj7-8cjw-p6xm
- https://github.com/advisories/GHSA-86w9-cpqp-85rv

The 14 affected TV package entries propagate these two advisories. No incompatible Expo downgrade, unreviewed cryptographic patch, audit suppression or passing-status exception was added. Web/AWS audits are clean; the TV security gate remains failing until an appropriate fix is available and tested. Keep build inputs trusted and do not expose development servers publicly.

### TMDB token rotation

The token previously disclosed in chat must be revoked/replaced through TMDB, then updated in AWS Secrets Manager. No replacement credential was available during this change and rotation has not been performed. Do not paste replacements into chat or Git. The application code cannot invalidate a provider credential by itself.

## Deployment compatibility

Deploy backend and frontend from this source together: the frontend now supplies photo grants and explicitly requests expiring editor links. Bare old photo/editor links intentionally stop working. Verify owner photos, new public viewing links and new editor links after deployment. Publishing main does not deploy AWS or revoke the provider token.
