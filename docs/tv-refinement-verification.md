# TV refinement verification

Implemented: compact navigation and paging dock; content-first vertical focus movement; consistent paging-button focus; a shared 24px minimum for explicitly sized TV text at widths of 900px and above; smaller hero; secondary planning actions behind More ways to plan; concise dinner comparison explanations; elapsed request time and cancel guidance; finalist selection reserving room for two familiar dinners when available among model candidates.

Automated: 72 backend tests, TypeScript validation, TV export, site build, and paging regression checks passed. Scrolling checks cover both directions, bounds, modal isolation, and dock focus retention. GitHub now runs those scrolling checks too.

Physical TV checks remain unverified: test Silk at 720p and 1080p using only the remote, from the normal couch distance. Complete title search, dinner selection, details, cooking, Back, and long-page navigation. Check larger labels for wrapping and focus visibility.

Human matching evaluation remains unverified: across at least eight different titles, ask people to score willingness to cook (1–5), familiarity (1–5), and connection clarity (1–5). Record which meal they choose and why they reject the others. Include dietary constraints and repeat requests. Treat prompt improvements and familiarity tests as implementation evidence, not proof of better taste or satisfaction.
