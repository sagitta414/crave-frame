# Security and privacy architecture

## Trust boundaries

~~~mermaid
flowchart LR
    Client[Untrusted client input] --> Validate[API validation and authorization]
    Validate --> Household[Household-scoped data]
    Link[Cooking share bearer link] --> Scope[Share validity / expiry / selected night]
    Scope --> Recipe[Scoped cooking view and coach]
    Validate --> Model[External model: limited request context]
    Model --> Checks[Candidate and evidence validation]
    Checks --> Review[User review before plan changes]
~~~

Household keys are bearer credentials stored on the client. They are not a full account/password identity system. Cooking QR links expose a narrower selected-evening view and have expiry/revocation behavior. Parent PIN controls support household restrictions but should not be treated as a hardened OS-level child-safety boundary.

## Sensitive data

Do not commit household keys, private cooking links, local SQLite databases, service-account JSON, provider access tokens, cloud integration encryption keys or native signing files. Server-side Vertex credentials must never enter client bundles. EXPO_PUBLIC values are public configuration.

Requests to external models contain the context needed for that feature, such as title details, food preferences, recipe steps or a supplied pantry photo. The application does not persist pantry photos in its recognition flow, but the model provider processes them. Production social/media features use R2 where configured. Review the code and provider terms before accepting sensitive data from real users.

## Protections and limits

The API validates allowed values, applies quotas and constraints, scopes shared access and requires approval for supported plan changes. The credential-pattern scanner checks common key formats and forbidden key files; it is not a comprehensive security audit. No penetration test or independent safety certification is claimed.

Private links are capabilities: anyone possessing a valid link may exercise its permitted access. Do not include real links in screenshots, issue reports or demo recordings. Use demonstration households and revoke shared links afterward.

## Production work remaining

Review identity recovery, abuse resistance, cost limits, media retention, logging, provider data handling, household access and remote-device behavior before a broader launch. Recipe guidance is not allergy or food-safety certification. External delivery/provider services retain their own authentication and checkout responsibilities.

## Dependency audit baseline

The initial clean backend install reported 14 dependency advisories (6 moderate, 8 high). The repository preserves the current application dependency lockfile rather than applying automatic breaking upgrades. Review npm audit in each package and remediate applicable runtime/build risks before production use. This is not a security-cleared release.

The initial TV install also reported 11 moderate dependency advisories. Counts describe this installation date and can change as advisories are updated.
