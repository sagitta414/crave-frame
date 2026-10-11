# User review — 2026-09-13, pass 2

## Journeys tested

- Fresh launch: pause, resume, and skip the 90-second introduction.
- Household food settings: save a Milk exclusion and a mushroom exclusion.
- Movie-first: search for *Chef*, choose 4 people / Vegetarian / 15 minutes, recover from no results by changing to 30 minutes, compare three meals, inspect details, confirm ingredients, save, and start cooking.
- Meal-first: choose Sesame broccoli noodles and compare three movies.
- Saved evening: continue an unfinished cooking plan and inspect ingredients and timing.
- Takeout: choose a similar-dish search and reach the private phone handoff.
- Group planning: create a room and inspect the host preference form.
- Kitchen: inspect Food, Pantry, Streaming, Playback, and Taste.

The review used an isolated local household and mocked movie/AI providers. It did not change the live household, place an order, or test a physical Fire TV remote.

## Findings

### High — recipe steps mention ingredients that are not in the recipe

Sweetcorn & snow pea noodles lists tofu, sweetcorn, snow peas, garlic, noodles, vinegar, soy sauce, sesame oil, and honey. Its preparation step nevertheless tells the user to slice carrots or peppers, cabbage, mushrooms, green beans, and broccoli “when listed.” The sauce and noodle steps similarly mention ginger, peanut butter, miso, and edamame. This reads like an unedited template and is especially alarming after the user explicitly excluded mushrooms. Generate each instruction from that recipe's actual ingredients only.

### High — Pantry offers ingredients that conflict with saved safety settings

After saving Milk and mushroom exclusions, Pantry still presents Mushrooms, Butter, Parmesan, and Mozzarella as normal selectable ingredients. Recommendations continue to filter them, but the UI suggests they are valid pantry choices. Hide, disable, or clearly mark ingredients blocked by the saved allergy and avoid lists.

### Medium — meal-first choices are labelled as dinners

After selecting a meal first, the heading correctly says “Choose what to watch,” but the pager says “1 of 3 dinner choices” and its tabs are “Dinner 1,” “Dinner 2,” and “Dinner 3.” Use “watch choices” and “Watch 1/2/3” or the titles themselves.

### Medium — “Details & ingredients” does not show ingredients

The control opens Pairing Info. Expanding Dinner & availability shows timing, availability, and provenance but still no ingredient list. Ingredients appear only after selecting Plan this evening. Either show ingredients on Pairing Info or rename the control to “Pairing details.”

### Medium — the three meal alternatives lack meaningful variety

For *Chef* at 30 minutes, Vegetarian, Milk excluded, and mushrooms excluded, the three suggestions were Ginger spinach noodles, Edamame sesame noodles, and Sweetcorn & snow pea noodles. All use the same noodle/tofu recipe pattern. Diversify by meal format before filling all three slots, and explain when restrictions leave only one format.

### Medium — the Silk result image wastes roughly half its column

On the TV-sized comparison screen, a landscape meal image uses `contain` inside a tall column, leaving a large black area above it. Use a fixed-height image region with `cover`, or a shorter media column, while retaining the current accessible illustration label.

### Medium — group planning is too long for a television form

The host must traverse more than 35 meal-style buttons before reaching vetoes and viewing limits. Collapse meal styles into a smaller first-level set, make the detailed list optional, or move individual guest entry to the phone and keep the TV as the room/status screen.

## What passed

- Intro pause, resume, and skip worked.
- The movie remained *Chef* through preference selection and recovery from no results.
- Allergy and avoid settings persisted and were visible in planning.
- The no-results state preserved limits and gave a direct recovery route.
- Ingredient quantities scaled correctly for four people and required confirmation before saving.
- Saved evening timing, cooking progress, takeout handoff, streaming settings, playback settings, and taste controls were coherent.
- The browser logged no application errors during the journeys. The only warning was the expected web fallback for native-driver animation.
