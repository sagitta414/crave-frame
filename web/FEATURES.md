# Crave Frame: shared evenings

The React Native browser build is served at `/tv/`. New features:

- Together: invite up to eight guests by QR; collect mood, diet, avoided ingredients, format and viewing limits; generate three pairings; vote and reveal once everyone has voted. Rooms expire after 24 hours. Incompatible food constraints produce an honest empty state. Host management and guest voting use separate permissions.
- Ready by: set a local dinner date and time; work backward through total recipe time, including preparation once; retain the plan on the shared phone cooking link. Impossible deadlines are rejected.
- Pairing controls: Mood, Setting, or On-screen food. Documented on-screen coverage currently includes a rustic ratatouille interpretation for Ratatouille, with a source. Other dishes are labeled as interpretations; no unverified on-screen claims are generated.
- Streaming: select region and subscription services in My kitchen. Search, standard recommendations, group picks and AI plan results respect the subscription filter. Rental and purchase offers remain separate. TMDB/JustWatch series availability does not guarantee a specific episode. Group streaming matching checks up to 24 eligible catalog titles.
- Double features: save a named evening and notes, upload a photo, share a viewing link and recreate the pairing. Photo upload links have a separate edit capability. Stop sharing revokes the collection page; direct photo links remain capability URLs until replaced/deleted.
- Motion: animated pairing reveals, backdrop transitions and remote focus; OS reduced-motion support and a saved device preference in My kitchen.

Storage: D1 holds rooms and collections; MEDIA is the logical R2 binding for JPEG uploads. Browser uploads are resized and re-encoded before upload; the server enforces payload limits and JPEG signatures. Collections are private until shared. No user credentials are embedded in public guest/viewer responses.

Verification: 35 backend/domain tests; three native catalog/manifest tests; TypeScript; browser group creation, preference submission, voting, reveal, ingredient approval, scheduling and collection sharing. Physical Fire TV testing requires a connected device. `scripts/features-smoke.mjs` verifies production using an isolated test household, removes its collection and saved night, and leaves its group room to expire.
