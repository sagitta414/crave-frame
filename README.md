# Crave Frame

<img src="tv/assets/brand/crave-frame-3d-v5.png" alt="Crave Frame logo" width="160" />

**Dinner and a story, planned together.**

Crave Frame helps a household answer “what should we eat?” and “what should we watch?” as one evening. Start with a movie, TV episode, or meal, compare explained pairings, approve a dinner, and carry the recipe from the television to a phone. When plans change, preview a revised schedule or replacement dinner before applying it.

[Live TV/web demo](https://screen-to-supper-storyboard.sagitta107.chatgpt.site/tv/) · [Architecture](docs/ARCHITECTURE.md) · [Setup](docs/SETUP.md) · [Demo guide](docs/DEMO.md) · [Testing](docs/TESTING.md)

> Hackathon prototype, not a streaming service or delivery marketplace. Crave Frame does not play films, place food orders, or connect to Alexa. The live deployment and this public source snapshot differ in bundled promotional artwork; see [asset provenance](docs/ASSETS.md).

## The evening in six steps

1. **Choose a story or dinner.** Search exact movies and editions; select an episode for a series.
2. **Compare the matches.** See real recipe names, cooking time, viewing time, and the basis for each connection.
3. **Make it yours.** Adjust people, food preferences, time, cooking skill, and household choices. Ask for familiar meals, less work, or another dinner.
4. **Approve your evening.** Review ingredients and adaptations before saving. Choose cooking or an external order-out handoff.
5. **Adapt and cook.** “I’m delayed” previews the changed schedule. A scoped QR link moves cooking steps to a phone and synchronizes progress.
6. **Remember what worked.** Explicit feedback informs future recommendations and organizes loved evenings.

## Features

| Area | Included behavior |
| --- | --- |
| Matching | Live Gemini selection over eligible catalog recipes; up to six proposed candidates, up to three validated finalists |
| Explainability | Documented food references, synopsis-based setting interpretations, and plainly labeled practical choices |
| Constraints | Deterministic food, time, effort, family, title, and rejected-ingredient filtering before AI selection |
| Discovery | Meal-first and watch-first flows, TMDB search, exact movie/episode selection, pantry input, shared planning |
| Recipes | 527 catalog recipes; quantities, steps, timers, portion scaling, and supported adaptations |
| Cooking guidance | Beginner, regular, confident, and kid-oriented guidance; recipe-aware AI questions |
| Recovery | Delays, missing ingredients, guest changes, simpler dinners, and changed-mind alternatives with review |
| TV experience | Large controls, remote focus navigation, scrolling assistance, reduced motion, animated matching and introduction |
| Household | Saved evenings, explicit taste feedback, parental controls, and scoped phone sharing |
| Order out | DoorDash/Uber Eats search handoff and user-entered delivery estimates; no checkout integration |

## Quick start

Requires **Node.js 24+**, npm, and Git. Windows PowerShell is supported. Native Android tooling is not needed for the browser version.

~~~sh
git clone https://github.com/sagitta414/crave-frame.git
cd crave-frame
npm run setup
npm run build
npm run dev
~~~

Open **http://127.0.0.1:4178/tv/**. The companion web interface is at **http://127.0.0.1:4178/app/**.

The initial build exports the editable Expo app and assembles the Worker-compatible site. The local server uses SQLite and applies checked-in migrations. Local data stays in ignored files under web/.local/.

**Without credentials:** catalog planning, recipes, and local persistence work. Live AI and TMDB search require your own credentials; AI failure is reported rather than silently represented as an AI match. See [configuration and native setup](docs/SETUP.md).

## Architecture at a glance

~~~mermaid
flowchart LR
    TV[TV UI: Expo / React Native Web] --> API[Worker API]
    Phone[Phone cooking companion] --> API
    Browser[Web planning UI] --> API
    API --> Rules[Deterministic planning and constraints]
    Rules --> AI[Gemini on Vertex AI]
    AI --> Validate[ID validation / evidence checks / variety]
    Validate --> API
    API --> TMDB[TMDB title lookup and availability]
    API --> DB[(D1 production / SQLite local)]
    API --> R2[(R2 media: production)]
    TV -. external handoff .-> Providers[Streaming / delivery providers]
~~~

Full component, AI request, trust-boundary, and data-model diagrams are in [ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Repository map

~~~text
crave-frame/
  tv/                    Editable TV application and native Android project
    App.tsx              Application navigation and evening workflows
    src/                 UI, API client, matching animation, recipe/catalog copies
    assets/              Generated brand, food, story imagery and audio
    android/             Native Android configuration; no signing keys/build output
  web/
    product/             Browser planner, phone companion, canonical catalog/logic
    server/              Worker routes, Gemini integration, title lookup, sharing
    db/                  Drizzle schema
    drizzle/             Checked-in database migrations
    tests/               Node regression tests with mocked external services
    build-app.mjs        Worker + static site assembly
  docs/                  Setup, diagrams, AI design, security, demo, testing, assets
  scripts/               Cross-platform setup/build/test and credential-pattern checks
  .github/workflows/     Automated tests, type-checking, credential scan and build
~~~

TV catalog modules are currently duplicated from web/product; edits to shared logic must keep both copies aligned. Consolidating these into a shared package is a future maintenance improvement.

## How the AI works

Crave Frame does not ask a model to invent arbitrary recipes. The backend builds a legal candidate set from the existing recipes and title metadata, applies household restrictions, and then asks Gemini to choose and explain candidates. Returned recipe/title IDs must resolve to that set. Recent dinners and explicit dislikes affect eligibility.

A setting label requires an exact excerpt from the selected title’s supplied synopsis. The excerpt check proves text presence, **not that every interpretation is correct**. Unsupported links are replaced with practical explanations. Known documented food references follow curated evidence. Actual recipe and viewing durations replace model-written timing. A final ranking favors grounded links, familiar food, and different meal formats.

See [AI matching design and limits](docs/AI.md). The AI provider is **Gemini on Vertex AI**, not an AWS runtime.

## Validation and current limitations

~~~sh
npm test
npm run check:secrets
npm run build
~~~

The current backend suite contains **71 tests**. Tests cover filtering, IDs, source excerpts, variety, planning, persistence, sharing, family constraints, and mocked provider behavior. They do not establish real-world recipe safety, model taste, production reliability, or smooth Fire TV performance. See the [manual device and live AI checklist](docs/TESTING.md).

Known limitations:

- Recipes are prototype content, not professionally kitchen-tested or allergy-certified.
- Images illustrate meals and atmosphere; they are not proof of an actual dish or scene.
- Browser/native features vary by device. The latest UI needs a full Fire TV remote-only rehearsal.
- Streaming and ordering happen outside Crave Frame; prices, checkout, and delivery tracking are not integrated.
- Local media upload lacks the production R2 binding. Phone testing requires a backend reachable by the phone.
- AI response quality and latency vary. Daily limits are 35 AI actions per household and 200 globally per UTC day.
- A synopsis excerpt can still be semantically misused by a model; human evaluation remains necessary.

## Hackathon materials

[Demo script](docs/DEMO.md) · [Submission checklist](docs/SUBMISSION.md) · [Tool feedback template](docs/TOOL-FEEDBACK.md)

A public repository alone is not a completed submission. The entry still needs a recorded demo, accurate tool feedback, final track details, and a submission receipt. For Fire TV, demonstrate the app running on a Fire TV device or the specified simulator. This repository does not claim Amazon endorsement or Alexa integration.

## Contributing, security, and license

Read [CONTRIBUTING.md](CONTRIBUTING.md) before editing shared catalog logic. Do not commit service-account JSON, household keys, cooking links, API tokens, or native signing files. Read [SECURITY.md](SECURITY.md) for reporting guidance and [security architecture](docs/SECURITY.md) for known boundaries.

Project-authored source is available under the [MIT License](LICENSE). Third-party dependencies and marks retain their own terms. Generated artwork provenance and exclusions are documented in [ASSETS.md](docs/ASSETS.md).

## Latest AI evaluation

See the [live eight-title evaluation](docs/AI-EVALUATION.md): 24 distinct recipes, 20 catalog-familiar choices, and remaining weak links disclosed. A separate model review now checks proposed connections; factual validation and household limits still bind.
