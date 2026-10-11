# Running without GCP AI

Set the server runtime variable `AI_PROVIDER=catalog` and deploy. This disables model calls even when an old GCP credential remains configured. Do not put credentials in client code or hosting.json.

Catalog mode supports title-to-recipe matching across the existing recipe library, ingredient exclusions, time and dietary filters, pantry scoring, saved preferences, recent-suggestion avoidance, cooking steps and evening scheduling. The recommendation response reports `recommendationSource: catalog` and `aiEnabled: false`. Household responses include `capabilities.matchingMode` for clients.

Documented title references are matched to recipe ingredients and formats. Inspired dinners are distinguished from actual on-screen dishes. Where there is no supported food connection, the app describes a practical dinner rather than inventing a scene. Familiar alternatives are prioritized after the leading match. New suggestions exclude recently shown meals; the explicit revisit control permits them again. Rejected meals stay excluded.

Live free-form coaching, photo interpretation and AI-created menus remain unavailable in catalog mode. The TV planner explains this and directs users to working catalog and cooking flows. The app does not silently switch to another billable provider.

To restore the existing Vertex integration later, remove `AI_PROVIDER=catalog`, configure valid server-side GCP credentials and redeploy. No alternative model provider is connected in this change.

Verification: backend suite (109 tests), TV suite (18 tests), TypeScript checks, remote scrolling regressions, web export and HTTP preview. Browser interaction and physical Fire TV validation remain unverified for this release because no browser connection was available during the update. The native APK requires a separate rebuild to include the new client UI.
