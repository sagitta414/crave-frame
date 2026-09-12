# Live matching evaluation — September 12, 2026

## What changed

The earlier pipeline generated title-background notes, then sometimes quoted those notes as if they came from the synopsis. In a live three-title baseline, eight of nine displayed choices became practical fallbacks while the overall AI introduction still claimed story connections. That mismatch has been removed.

The new pipeline selects from a smaller recipe shortlist preserving familiar and source-relevant meals. A separate model review checks the proposed food link, exact supplied ingredients and supporting source. Deterministic validation still checks IDs, evidence text and reference scope. Final ranking penalizes repeated formats and substantially overlapping ingredient sets. The summary is generated from the validated finalists, not the model’s unvalidated introduction.

Three curated reference records guide the model for Avengers, Paddington and Grand Budapest Hotel. They do not assign fixed recipes. A source reference does not guarantee an appropriate recipe will be found. Grand Budapest still produced only practical choices in the final pass.

## Final live sample

One sequential pass with Gemini 2.5 Flash; two people, 45-minute cooking budget, 180-minute viewing budget, no food restriction, shared recent-choice history. This is a small engineering evaluation, not a controlled benchmark, user study or performance guarantee.

- 8 title requests completed, with 24 returned choices.
- 5 choices were labeled story-inspired or documented; 19 remained practical.
- 20 choices had the catalog’s familiar flag.
- No exact recipe repeats across the pass.
- Local evaluation request times ranged from 3.8 to 7.5 seconds. These exclude browser and deployed-route overhead.
- Four titles had at least one story/food link: Avengers, Ratatouille, Chef and Paddington.
- Grand Budapest, Before Sunrise, Detectorists and Only Murders remained weak for story-specific dinner connections. The app says so rather than disguising them as good matches.

| Title | Local elapsed | Story-linked labels | Returned meals |
| --- | --- | --- | --- |
| grand-budapest | 7.1s | 0/3 | Margherita pizza; Chicken & roasted potatoes; Tomato & basil pasta |
| avengers | 5s | 1/3 | Turkey & pepper pita pockets; Pepperoni pizza; Spaghetti & meatballs |
| ratatouille | 7.5s | 1/3 | Rustic vegetable ratatouille; Slow-roasted tomato pasta; Basil & tomato flatbreads |
| chef | 6.2s | 2/3 | Cheeseburgers & oven fries; Smoky black bean tacos; Grilled cheese & tomato soup |
| paddington | 7.1s | 1/3 | Thyme white bean & mushroom toasted sandwiches; Loaded baked potatoes; Mac & cheese with peas |
| before-sunrise | 4.5s | 0/3 | Roasted pepper & basil pasta; Sweetcorn & potato chowder; Thyme white bean & mushroom puff-pastry pot pies |
| detectorists | 3.8s | 0/3 | Broccoli & garlic pasta; Garden minestrone; Thyme white bean & leek stuffed baked potatoes |
| only-murders | 4.8s | 0/3 | Three-bean chili; Chicken quesadillas; Mediterranean pasta salad |

## Qualitative assessment and limits

Avengers led with a filled pita, grounded in Marvel’s documented shawarma reference, instead of an action-to-chili metaphor. Ratatouille retained its curated namesake vegetable recipe. Chef offered handheld food-truck interpretations. Paddington offered a savory sandwich reinterpretation of the character’s marmalade-sandwich association, not an exact movie dish.

A second-pass result wrongly accepted a generic European-street-food analogy for Vienna; the subsequent editorial guard rejected that language. An earlier Avengers taco reinterpretation was too loose; source-to-ingredient checks now require the applicable filled-pita ingredients. Earlier results are retained in JSON for transparency.

A model reviewer can still make semantic mistakes, and keyword guards are not comprehensive. Shortlists cap available recipes at 80 distinct meals after hard filtering; some valid connections may be omitted. Familiarity flags are authored metadata, not household-specific taste proof. Broader live testing, particularly diets, new titles and exact episodes, remains necessary.

## Sources

- [Marvel Entertainment: official Avengers shawarma clip](https://www.youtube.com/watch?v=7W68Utbku5I)
- [Official Paddington Store: marmalade and sandwiches](https://store.paddington.com/blogs/news/its-marmalade-may-paddingtons-favourite-marmalade-gifts-treats)
- [Searchlight Pictures: Grand Budapest Hotel](https://www.searchlightpictures.com/thegrandbudapesthotel)

## Reproduce

From the backend folder, provide your own local Vertex credentials and run node scripts/evaluate-matching.mjs --live. This makes billable provider calls and writes docs/ai-evaluation-latest.json. No credential or household key is written to the report. The script uses an in-memory evaluation household and does not mutate live user plans.
