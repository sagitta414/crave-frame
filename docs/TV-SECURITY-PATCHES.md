# Temporary TV dependency security mitigations

These are locally maintained patches, not official upstream releases. Raw
`npm --prefix tv audit` still reports the original package versions as vulnerable.
The application security gate accepts only the two mitigated advisories below,
after verifying installed source hashes and running exploitation regressions.
Exceptions expire **November 5, 2026 (00:00 UTC)**. New high/critical advisories,
unexpected dependency versions, modified/missing patches, failed audit requests,
failed regressions, and expiry fail the gate. No blanket audit suppression is used.

## Patches

- **braces 3.0.3 / GHSA-vfj7-8cjw-p6xm:** cap parser nesting for both braces and
  parentheses before AST recursion. Guard direct AST compile/expand/stringify
  entry points with an iterative traversal bounded by depth and node count.
  Excessive nesting and cyclic ASTs throw a controlled SyntaxError. Ordinary
  Metro globs, expansion and stringification are regression-tested. The imposed
  limits may reject unusually complex build patterns; they are deliberately not
  configurable to bypass the security boundary.
  [Upstream issue](https://github.com/micromatch/braces/issues/70).
- **node-forge 1.4.0 / GHSA-86w9-cpqp-85rv:** validate the nested DigestAlgorithm
  child count, including optional NULL parameters, after ASN.1 validation. This
  follows the proposed correction in [upstream PR 1152](https://github.com/digitalbazaar/forge/pull/1152),
  which was not merged at the time of adoption. Tests create signatures with
  extra nested elements and require rejection, while accepting valid signatures
  and rejecting mismatched message digests. This is not an independent audit of
  the full cryptographic library.

Before patching, the depth/AST and RSA rejection regressions failed against the
installed upstream versions. All four dependency behavior tests pass after
patching. Four audit-policy tests cover expiry and rejection of new findings,
unknown dependencies and malformed audit responses.

## Installation and verification

`npm --prefix tv ci` runs the tracked postinstall script. The patch manifest pins
exact upstream source SHA-256 values and resulting patched SHA-256 values. Every
copy in the TV lockfile is checked. Re-running the patcher is idempotent. Do not
use `--ignore-scripts`; a skipped patch will fail verification.

```sh
npm run setup
npm run check:security:tv
npm test
npm run build
```

The CI security job installs dependencies before auditing. Web and AWS retain
their unmodified high-severity npm audit gates. The TV gate prints the raw counts
and names the mitigated dependency entries; passing means the specified local
mitigations were verified, not that npm reports zero vulnerabilities.

## Removal and release scope

Review official patched releases before the expiry date. Update the compatible
dependency tree, remove the corresponding local patch and exception together,
and rerun all checks. Do not simply extend expiry or change expected hashes to
make an unreviewed dependency pass. A fully clean raw npm audit is preferred.

Build/export the TV app only after patch installation. These patches affect the
Node TV toolchain; they do not modify deployed AWS infrastructure, secrets or
database schema. Rebuild release artifacts from the final verified commit before
deployment. Existing GitHub Actions failures remain in history.
