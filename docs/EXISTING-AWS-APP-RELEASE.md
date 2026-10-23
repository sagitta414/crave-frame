# Existing AWS app-only release

Use `aws/scripts/deploy-existing.py` in CloudShell for the existing reduced-cost
CraveFrameAmazon2026 deployment. Do not run the full CDK deployment against it:
the repository's original infrastructure definition differs from the live stack.

The script requires a published GitHub prerelease with `manifest.json`,
`lambda.zip`, and `static.zip`. The manifest identifies the release and SHA-256
digests of both archives. Only build outputs belong in the archives; never include
credentials, environment files, CloudFormation exports or local AWS configuration.

Run with `--release RELEASE` for read-only preflight (apart from a local working
directory), then `--release RELEASE --apply` to deploy. The script preserves all
existing environment settings except the release marker and explicitly enables
the bundled RDS certificate trust store. APP_SECRET_ARN selects the deployed
password-based database connection; deployments without it retain IAM auth.
The application account must be `crave_app`.

## Scope and cost

Changes: upload assets to a new private S3 release prefix, update the existing
Lambda code/configuration, publish a version, move its live alias, change the
CloudFront static origin path and version response header, and invalidate cache.
No schema migrations, Cloudflare data copying, database replacements, secret
changes, IAM grants, NAT gateways or other new infrastructure are performed.
Incremental cost is release storage, requests, normal compute and invalidations;
there is no additional fixed monthly service charge from this release script.
The separately installed NAT gateway continues to incur its existing charges.

Blast radius: all users of the AWS site and clients using its API. There can be a
brief frontend/backend version mismatch during CloudFront propagation. The backend
must remain compatible with the previous frontend. These changes do not deploy
an APK or update the initial prototype deployment.

## Rollback and verification

Before touching Lambda, the script saves non-secret rollback identifiers in
`~/crave-release-RELEASE/rollback.json`. Keep that directory. On failed deployment
checks it attempts to restore the old Lambda alias and frontend release path.
For manual recovery:

```sh
python3 deploy-existing.py --release RELEASE --rollback
```

Rollback preserves application data and uploaded release files. It restores the
live alias, not Lambda's unpublished $LATEST configuration/code; preflight stops
if unpublished changes are present. A subsequent release then needs explicit
reconciliation of $LATEST. Rollback refuses to overwrite an unrelated live alias
or frontend release path. Investigate any failed rollback before retrying.

For a failed frontend switch with a published candidate and staged assets, use
`--release RELEASE --resume` to validate the existing candidate and staged files,
then add `--apply` to resume without rebuilding, reuploading, or overwriting the
original rollback journal. Resume compares the published Lambda code digest with
the release manifest and checks staged asset sizes. It rechecks backend health
before moving CloudFront. It does not modify the database or secrets.

CloudFront update requests restore the required empty legacy OriginAccessIdentity
field only for S3 origins already configured with Origin Access Control. Both
distribution and response policy parameters are validated before traffic moves.
Rollback skips CloudFront updates when the old path and marker are already active.
Failures identify the deployment stage and safe schema errors, without logging
origin secrets. Offline SDK model regressions cover this serialization behavior.

The script checks current health, archive digests, required files, private storage,
runtime shape, backend health/version, document response security headers and
frontend version. It does not claim to validate physical remote navigation,
two-phone synchronization, every API or TMDB search. Test those after release.
The saved plan and the Our night in flows require no new schema migration.

Known release risk: the current TV toolchain audit reports 14 high-severity entries
through braces/node-forge and their dependents; these are not fixed by this release.
Do not force-downgrade Expo to hide the findings. Test and assess dependency fixes
separately. The Python deployer has local syntax checks, but live AWS behavior must
be verified in CloudShell. AWS access is not available to the local authoring session.

## Infrastructure ownership

App-only updates create CloudFormation drift in Lambda code/configuration/alias,
CloudFront origin path and response header policy. Keep the release and rollback
record. Reconcile the actual reduced deployment into CDK before any future full
stack update; blindly deploying the original template can undo these changes or
alter the database/network. The network repair is owned by its separate stack.
