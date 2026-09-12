# AI matching design

## Selection pipeline

1. Normalize supported preferences and enforce AI action quotas.
2. Resolve the selected movie or exact TV episode. Ambiguity returns choices rather than guessing.
3. Build candidate pairs using catalog recipes and known titles. Apply food, cooking effort, cooking/viewing time, family, recent-meal and explicit rejection constraints.
4. Supply adapted ingredient names, title descriptions, household context and exact allowed IDs to Gemini.
5. Ask for up to six distinct dinner candidates with specific explanations and real limitations.
6. Reject unknown or ambiguous IDs. A setting label requires a 16–240 character excerpt found in that title’s supplied synopsis. Curated documented food references take precedence.
7. Replace unsupported connections with practical text. Use catalog durations instead of model-written timing.
8. Select up to three finalists, preferring documented/grounded connections, familiar dinners and different recipe categories.
9. Present choices for review. A recommendation does not itself change a saved evening.

## Meaning of the labels

- **Documented food reference:** supported by a curated reference; the home recipe may still differ from the film’s dish.
- **Inspired by the supplied synopsis:** an AI interpretation anchored to text present in the selected title description. It is not proof the dish appears on screen.
- **Practical dinner choice:** no supported story-food connection is asserted.

An exact quote can be irrelevant or misinterpreted. Quote matching is a syntactic guardrail, not semantic verification. Generated tradeoffs and optional rituals can still need review. Candidate diversity is a heuristic, not a measured confidence score.

## Other AI modes

Pantry photo recognition returns suggested visible ingredients for review. Cooking help receives the selected recipe and step. Rescue parses supported changes and proposes eligible options before application. Taste reflection uses saved explicit feedback. Group explanations use supplied member preference facts. Model prompts are in web/server/ai.js; provider requests are in web/server/vertex.js.

## Failure, latency and costs

Recommendation failures return an unavailable state rather than silently masquerading as AI picks. Cache keys reflect relevant preferences and household context; a deliberate refresh requests fresh results. Actions are limited to 35 per household and 200 globally per UTC day. A single action can involve multiple model calls. These are not monetary spending caps.

The frontend can cancel waiting requests. Cancellation is not a guarantee that server work or a write already accepted by the server was undone. Users should check saved evenings if they cancel during saving.

## Evaluation before submission

Use at least ten distinct titles, including specific food stories, broad action titles, family titles, exact TV episodes and sparse descriptions. Record raw returned recipe names, labels, quoted evidence, repeated meal formats, latency and constraints. Score the relevance of each explanation independently from its fluency. Keep poor results in the log and fix systematic problems; do not present a curated success as average performance.
