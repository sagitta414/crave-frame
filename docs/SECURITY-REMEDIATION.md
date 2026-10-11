# Security scan remediation — 10 October 2026

The supplied scan reviewed GitHub commit `55b73e0`, which predates the current local app and Sites deployment. This ledger distinguishes source fixes from operational verification. It is not a penetration-test certification.

| Finding | Changes and evidence | Remaining work |
| --- | --- | --- |
| CF-01: shared AI quota exhaustion | Existing household-first reservation and rollback retained. Added pre-quota validation of malformed JSON values, pantry photos, saved-night references, group payloads and three-act movie selection. Quota and invalid-input tests pass. | Live AI is disabled in catalog mode; enabling a provider should include a provider integration test. |
| CF-02: retained replaced photos | Both owner and editor replacements delete the previous object after saving. Optimistic-lock conflicts delete the new upload. Photo reads require a current database reference and use no-store. Added a photo-reference index and replacement/revocation tests. | Historical unreferenced R2 objects require a separate bucket inventory and deletion job. They are no longer readable through the app. Existing cached copies cannot be recalled. |
| CF-03: missing HTML security headers | HTML documents are embedded in and served by the Worker; their static copies are removed at build time. Live testing showed that Sites bypasses the Worker for static HTML even with run_worker_first, so changing that flag alone was insufficient. CSP blocks inline scripts, framing, objects and base-URL changes; styles remain inline-compatible for React Native Web. Added HSTS, no-referrer, nosniff and frame denial. | Verified public HTML responses after deployment (see below). Image HTTPS sources remain broad for catalog artwork; this is not a strict image-domain allowlist. |
| CF-04: debug-signed native release | Release uses a separate signing configuration and fails without four protected environment variables. Build helper no longer generates a demo identity for release. Expo plugin preserves release signing policy on prebuild. | A protected release keystore, signed APK and certificate verification are required before native distribution. No new APK has been built or certified by this change. |
| CF-05: anonymous resource abuse | Atomic per-edge-IP limit of 20 new households/day, shared limit of 500/day, and retained-household cap of 2,000. Photo uploads share a cumulative 500 MiB write allowance across households. Expired rooms/shares are removed during household creation; creation counters retain seven days and store daily IP hashes, not raw IPs. | Limits mitigate anonymous abuse, but do not establish identity. Edge WAF/bot controls are not verified. Existing households are preserved. Historical object usage is outside the new upload counter. |
| CF-06: unescaped genre | Selection was already escaped in newer source. Fixed the remaining preference-summary genre interpolation. Regression check covers both sites. CSP additionally prohibits inline script execution. | None identified for the reported interpolation. |
| CF-07: bearer key backups | Disabled Android backup and excluded storage domains from both cloud backup and device transfer. Config plugin preserves rules on prebuild. | Verify on the target Fire TV hardware; no device backup/restore test has been performed. |

## Dependency results

- Web: removed unused Vinext, RSC, formatter and UI framework dependency trees. Production code imports qrcode; esbuild is now an explicit development dependency. npm audit reports **zero vulnerabilities**.
- TV: compatible updates remove shell-quote's critical finding and other patchable findings. Xcode's uuid override uses the patched CommonJS-compatible 11.x series; its UUID generator was checked. Audit changed from **27 (1 critical, 18 high, 8 moderate)** to **14 high, zero critical/moderate**.
- The remaining 14 entries derive from two upstream advisories, not fourteen independent app exploits: [braces](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) and [node-forge](https://github.com/advisories/GHSA-86w9-cpqp-85rv). Neither lists a patched version at review time. They are in the Expo/Metro build-tool chain. Do not expose Metro to untrusted networks or build untrusted input. These controls do not close the advisories.
- CI now independently audits both lockfiles at high severity and performs dependency review on pull requests. The TV security job intentionally fails while these advisories remain. No blanket allowlist or forced Expo downgrade was added.
- Maven/Gradle transitive dependencies and artifact verification metadata have not been audited or bootstrapped. Review native dependency checksums from trusted sources before enabling strict verification; never blindly accept downloaded checksums as proof of authenticity.

## Photo storage operations

The 500 MiB counter is a conservative cumulative upload budget, not a live R2 byte measurement. Replacement/deletion does not refund it, preventing churn from creating unbounded storage writes. Reset it only after checking R2 inventory, removing confirmed orphaned objects, and setting a new intentional budget. It does not retroactively count pre-existing photos. Never delete objects without comparing them against current collection references, and exclude in-flight uploads from a cleanup sweep.

## Native release signing

Supply these through a protected local environment or CI secret store, never committed files:

- `CRAVE_RELEASE_STORE_FILE`: absolute path to the release keystore outside the repository.
- `CRAVE_RELEASE_STORE_PASSWORD`
- `CRAVE_RELEASE_KEY_ALIAS`
- `CRAVE_RELEASE_KEY_PASSWORD`

Keep a secure backup of the signing identity: future updates must use the appropriate same key. Do not reuse the demo/debug identity. After building, use Android SDK `apksigner verify --verbose --print-certs` on the final APK; compare its certificate fingerprint against the independently recorded release fingerprint and confirm it is not the Android Debug certificate. Check the merged release manifest and test backup/transfer behavior on hardware. The old local demo key was preserved under ignored `.local/android/`, not published.

## Verification

114 web unit/API tests, 26 TV tests, TypeScript, TV scrolling regression checks, Expo web export, custom Worker build and credential-pattern scan were run. Security tests exercise invalid AI requests, quota rejection, live photo references, replacement deletion, creation limits and response headers. Build/config checks do not substitute for signed-APK or real-device validation. See deployment addendum for live verification.

References: [Cloudflare asset routing](https://developers.cloudflare.com/workers/static-assets/binding/), [Android backup controls](https://developer.android.com/identity/data/autobackup).

## Deployment addendum

Sites version **116**, source `5b4d844072aee5056917473df71d5ff2d6d8d587`, deployed successfully. Live requests to `/`, `/app/`, `/tv/` and `/app/companion.html` returned HTTP 200 with CSP, X-Frame-Options DENY, HSTS, nosniff and no-referrer. An unauthenticated `/api/household` request returned 401 with those headers. Evidence: `docs/security-evidence/live-headers.json`.

Browser automation was unavailable, so no visual or interactive browser walkthrough is claimed. Native source changes are in the local repository; no signed APK or GitHub push was performed during this security pass. Deployment to Sites does not publish the local native project to GitHub.
