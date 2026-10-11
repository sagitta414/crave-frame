# Silk TV layout fix — September 12, 2026

The supplied Fire TV photo showed the Silk browser using three cramped comparison columns with cropped artwork and small text.

- Silk comparisons now use stacked horizontal cards, with full dish artwork alongside dinner details.
- Silk TV text uses a 32px minimum at desktop/TV widths and larger comparison headings.
- Down, Up, and Top controls stay fixed near the bottom of the viewport. Additional bottom spacing lets the final actions scroll clear of the controls.
- Other browser and native TV comparison layouts retain their existing layout.

Validation: 100 existing automated tests passed (86 backend, 14 TV), TypeScript and production build passed. In a local browser preview simulating Silk detection, verified the comparison layout, complete dish artwork, Down scrolling through all choices and refinements, and Top returning to the beginning. This does not replace testing on the physical Fire TV remote.

## Follow-up: intro height in Silk

The next physical-TV photo revealed that the intro inherited an indefinite flex height after Silk's document-scrolling overrides made #root height auto. It occupied only part of the screen. The intro is now fixed to all four viewport edges with an explicit height, independently of normal scrolling pages. The page fallback background is dark. Removed Silk's scrolling instructions from the intro footer to prevent its controls from crowding the story.

Verified all three intro scenes at 1280x720 in the simulated Silk browser. Intro bounds and document height both measured 720px, with no blank region; all buttons remained within the viewport. Skip returned to the normal app. Existing automated tests and production build passed. Physical Fire TV verification remains with the user.
