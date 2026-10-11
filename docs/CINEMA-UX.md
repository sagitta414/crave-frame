# Cinematic TV experience

The TV client now centers browsing on complete movie-and-dinner pairings. The homepage features one evening, followed by horizontal shelves for personal choices, easy movie nights, family choices, short episodes, and saved favorites. Directional focus updates the hero; explicit shelf arrows also support Silk's browser cursor. The document-scrolling and Back restoration mechanisms are retained.

Pairing details contain the main planning action and three refinements: keep the movie/change dinner, simpler cooking, and similar story mood. Simpler cooking and mood are saved as editable household preferences. Existing ingredient exclusions and parental restrictions remain enforced by the server. This works with catalog matching and does not require GCP AI.

Saved evenings show the selected dish, film artwork, and dinner/viewing times together. Existing cooking, phone handoff, delay, delivery, feedback and synchronization actions continue underneath. The welcome story is for first visits and can be replayed in Kitchen → Playback; returning visitors reach their saved evening or browsing directly. The story retains Next, Previous, Pause and Skip.

## New illustrative asset

`tv/assets/meals/grilled-cheese-soup-v2.png` was generated using the built-in image-generation tool and is labeled AI illustration in the app. It replaces the generic soup mapping for this recipe.

Prompt: Create one photorealistic editorial food illustration for the Crave Frame TV dinner app. Landscape composition. A complete simple grilled cheese and tomato soup dinner: smooth red tomato soup in a small cream ceramic bowl, beside two triangular halves of a golden buttery grilled cheese sandwich, melted cheddar visible, on a warm ceramic plate. Both soup AND sandwich are prominently visible, equal visual weight, entire plate comfortably inside frame for responsive cropping. Familiar everyday home food, appetizing natural textures, cozy evening cinematic warm side light on a dark navy charcoal tabletop, subtle linen napkin, no people, no text, no logos, no beans, no meat, no extra dishes. Image is illustrative, not a photograph of a tested recipe.

## Verification

TypeScript, the TV model suite, and remote/Silk scrolling regression checks pass. Focused backend tests cover catalog refinements, saved exclusions, parent restrictions, and schedule behavior. The Expo web build succeeds. Automated browser visual testing was unavailable in this session; actual Fire TV couch readability and remote traversal still need device confirmation. This release changes the public TV web client; it does not rebuild the Android APK.

## Motion polish
The featured evening now uses slow backdrop drift, a floating glass dish frame, a mood-colored glow, and a periodic light sweep. Pause motion freezes the effect; reduced-motion, backgrounding, and off-screen detection stop animation. Shelves favor distinct existing dinners and use title artwork when no dish photo exists. Card width increased for couch browsing. TypeScript, shelf diversity tests, scrolling regressions and the export build passed; Fire TV animation smoothness remains device-unverified.
