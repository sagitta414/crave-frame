# TV planning refinements

- Plan tonight routes catalog users to working movie, dinner and surprise choices. Recipe help opens saved cooking details; saved preferences replace the taste-reflection action. Model-dependent cinematic controls are hidden in catalog mode.
- The home screen has three large starting choices. Additional dinner and surprise settings sit behind Adjust, with the active limits summarized.
- Comparison badges distinguish documented story connections, actual saved favorites, familiar choices and the lowest estimated cooking workload. Labels may overlap when one dinner meets several criteria; no favorite or story connection is invented to fill a slot.
- Recommendation cards show a brief pairing explanation. Full explanations and sources remain in Why this pairing. Catalog matches display dish art in the main spotlight.
- The saved evening displays dinner and watch times and prioritizes cooking, phone handoff and delay actions. Those controls retain their existing state-dependent behavior for completed and delivery plans.
- The intro plays once per device, with immediate Skip and a manual replay in Kitchen. Returning users resume a current unfinished evening. Expired/completed evenings and explicit phone/group/collection links are not replaced by a resume redirect.

Validation: 21 TV tests, TypeScript, remote/scroll regressions and production web export passed. Browser automation was unavailable; physical Fire TV and visual verification remain outstanding. Native source is updated in the local Crave Frame repository; its APK has not been rebuilt for this release.

## TV photo follow-up

The previous layout crowded the first screen with planning cards, a resume strip and a small spotlight. Browse now leads with a large cinematic feature; starting choices remain in Plan tonight. The featured dish only renders when its matching artwork is available. Silk paging controls use a bottom dock instead of reserving a wide right column; scroll behavior is unchanged.

The introduction now runs on ordinary launches, independently of household loading. Scenes advance every 18 seconds; the last scene remains until Continue or Skip. Next, Previous and Pause remain available. Phone, group and collection links bypass the story. This supersedes the once-per-device behavior above.

Validation: 21 TV tests, TypeScript, scrolling regressions, web export/build and HTTP readiness passed. Browser automation remains unavailable, so no visual or physical TV verification is claimed.
