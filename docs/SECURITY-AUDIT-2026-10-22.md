# Security audit — 22 October 2026

> Remediation follow-up: see [Security fixes and remaining external items](SECURITY-FIXES-2026-10-22.md). The findings below preserve the pre-fix audit evidence.

## Scope and conclusion

Audited GitHub main at `be614fe4657c1167a77d97ff9ecc8ccaef3f3f70`, matching the local checkout. Fetched GitHub branches/tags, scanned reachable Git history, queried npm advisories and GitHub security settings, executed automated checks, and reviewed authorization, media sharing, source-IP trust and secret handling. No production mutations, deployment or hostile live traffic were performed.

**Conclusion:** no matching committed credentials were detected in the scanned material, but this is not a security-cleared release. Two local media-access/lifecycle defects were reproduced, TV dependencies still fail the security gate, and the repository secret scanner has coverage gaps.

## Findings

### 1. P1 — Unsharing a collection does not revoke its photo or editor capabilities

Locations: `web/server/social.js:50`, `:65`, `:90` (collection-editor, photo and collection update handlers).

The public photo route checks that the photo is referenced by any collection, without checking sharing state or owner authorization. The editor route checks a long-lived edit key without an expiry; switching `shared` to false does not rotate that key. The token is unguessable in normal use, so this is a retained-access/revocation defect, not evidence that strangers can enumerate pictures.

**Isolated local reproduction:** create a synthetic collection with an editor key, upload a synthetic JPEG, disable sharing, then request the known photo without a household header: HTTP 200. Use the previously issued editor key to replace the photo after unsharing: HTTP 200. No real user photos or credentials were used.

**Recommendation:** define separate view/editor grants, issue expiring editor capabilities, add explicit revocation, and authorize photo requests against owner access or a currently valid sharing grant. Make the UI clearly distinguish stopping public viewing from revoking an editor. Test that revoked links fail while owner access remains functional.

### 2. P2 — Global photo budget can be exhausted without retained storage

Location: `web/server/social.js:17` and photo replacement/deletion paths.

Every upload increases the single global `storage:photo-upload-bytes` counter. Successful replacements and deletion remove objects but do not return quota; rejected revision saves also delete the uploaded object without releasing that reservation. Only an object-store put failure refunds it. The counter is an all-time upload budget, with no expiry or per-household allocation.

**Local evidence:** after two four-byte synthetic uploads followed by deletion, zero media objects remained while the global count was eight bytes. The gate blocks at 500 MiB. A valid owner/editor can consume the shared allowance by repeated replacement; lifetime legitimate uploads can also eventually disable uploads for everyone.

**Recommendation:** distinguish live-storage accounting from a time-window upload/abuse allowance. Use per-household limits, explicit release on deletion/conflict, and reconciliation for failed object operations. If a global lifetime cap is intentional, document and provide an operational reset procedure; it is not sufficient tenant isolation.

### 3. High dependency findings — TV build/toolchain

Fresh npm audit:

| Package | Critical | High | Moderate/low |
| --- | ---: | ---: | ---: |
| web | 0 | 0 | 0 |
| tv | 0 | 14 | 0 |
| aws | 0 | 0 | 0 |

The 14 affected package entries propagate two underlying advisories through Expo/Metro/React Native TV:

- `braces`: stack-exhaustion denial of service with deeply nested patterns — https://github.com/advisories/GHSA-vfj7-8cjw-p6xm
- `node-forge`: RSA PKCS#1 v1.5 signature verification accepts extra nested DigestAlgorithm elements — https://github.com/advisories/GHSA-86w9-cpqp-85rv

These are mostly tooling-chain paths; the audit does not prove an exploit in the deployed app. The verifier/certificate path deserves special review. npm proposes an incompatible Expo 44 downgrade for several paths. No forced upgrade/downgrade was applied.

GitHub main run https://github.com/sagitta414/crave-frame/actions/runs/39887256216 confirms the `verify` job succeeded and the `security` job failed at the TV npm audit step.

**Recommendation:** evaluate supported patched versions/overrides against Expo and React Native TV, then repeat web export, native build and signature/development workflow tests. Do not hide the failing security gate.

### 4. P2 — Repository secret check is narrower than its intended use

Location: `scripts/check-secrets.mjs`; `.github/workflows/ci.yml`.

The script checks selected private-key/GitHub/Google token formats and extensions in the working tree. It does not scan Git history, generic JWT/TMDB tokens or AWS access-key IDs; `.env` and Python file contents are outside its extension allowlist. Thus passing this command cannot establish that all credentials were excluded.

The separate audit performed here scanned 749 reachable historical text blobs using additional AWS access-ID, JWT and credential-URL patterns. It found zero pattern matches. This is still a pattern-based scan, not entropy analysis, provider validity testing or a binary forensic search. It cannot cover deleted unreachable objects, forks, private messages or all unknown credential formats.

**Recommendation:** extend the scanner and use a maintained history-aware secret scanner in CI. Keep output limited to locations and credential types. GitHub provider secret scanning and push protection are enabled; non-provider patterns and validity checks are disabled. No open GitHub secret-scanning alerts were returned. Dependabot automatic security updates are disabled.

## Credential already disclosed outside Git

A TMDB API Read Access Token was previously pasted into this conversation. That is separate from repository exposure. Rotate it in TMDB and replace the Secrets Manager value; do not paste the replacement into chat. This audit neither used nor printed the token and does not confirm rotation.

## Verification

- 211 web tests and 55 TV tests passed; TV type checking and remote/paging regressions passed.
- 10 AWS tests passed, including persistence, concurrency, trusted source identity and private object-key constraints.
- Four Python deployment-tool tests passed using the CI-pinned boto3 dependency in a temporary folder.
- Production web/TV export passed.
- AWS runtime bundle build and CDK synthesis passed. A process-local Git safe-directory setting resolved a local ownership mismatch; no global Git trust configuration changed.
- Repository credential-pattern scan passed for 420 text files.
- Two supplemental media probes reproduced the behaviors above against an isolated in-memory database and object-store mock.

AWS authorization tests demonstrate specific adapter boundaries; they do not override the application-level revocation findings. No native APK build, physical Fire TV session, interactive local-browser walkthrough, AWS account configuration inventory, load test or penetration test was completed. Passing synthesis does not verify deployed IAM or bucket policies.

## Status

Review only. No remediation, dependency changes, deployment or public publication of this report was performed. The unrelated screenshot gallery remains untracked and was not included in this audit or published.
