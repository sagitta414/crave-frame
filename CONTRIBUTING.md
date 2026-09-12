# Contributing

1. Install dependencies with npm run setup.
2. Make changes in tv/ for the main TV experience, or web/ for the API, canonical catalog and browser/phone surfaces.
3. Keep duplicated catalog modules under tv/src/catalog aligned with corresponding web/product modules when changing shared rules.
4. Run npm test, npm run check:secrets and npm run build.
5. Describe the user-visible behavior and actual validation in your pull request.

Do not commit generated TV exports, native builds, dependencies, credentials or local household data. Use an independent backend for experimentation; the default native fallback is a public demonstration endpoint. Preserve deterministic restrictions and approval steps when changing AI prompts. Do not add invented provider availability, order status or on-screen food claims.

Changes to diagrams should keep the Mermaid source readable in GitHub. For visual assets, record provenance and avoid bundling copyrighted promotional stills without redistribution rights.
