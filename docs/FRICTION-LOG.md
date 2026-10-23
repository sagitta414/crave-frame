# Crave Frame development friction log

I built Crave Frame around a simple evening: choose something to watch on the TV, pair it with dinner, and take the cooking steps to a phone. Getting those pieces to work together was much harder than getting a good-looking page running on a computer.

This is the friction I actually ran into, including my own messages from testing, failures reproduced during code review, and the workarounds we used. Some problems came from my app, some from the development environment, and some from not knowing which Fire TV setup route applied. I have kept those distinctions visible.

Updated from the development record through 22 October 2026. Earlier observations without a recorded date are marked accordingly. Time lost, reproduction frequency, device model and OS version were not measured consistently and are not estimated here.

## Summary

The largest practical obstacle was turning a desktop interface into something comfortable to operate from a couch with a remote. Windows build setup and uncertainty about the device installation route also interrupted progress. Later review exposed schedule and delivery-recovery defects that automated happy-path checks had missed.

The strongest improvements would be a clearer device-to-installation guide, a remote-navigation test example, and more dependable dependency remediation for the TV framework stack. Product-side lessons were to share schedule calculations across screens and make cross-device confirmations safe to retry.

Historical checkpoint: source fixes through commit 0ce2d25 were on GitHub main on 18 October. The 22 October local remediation workspace passed 211 web, 55 TV and 10 AWS tests (276 total), TV type checking, remote/paging regressions, a production build and the configured secret-pattern scan. The latest application repairs remain uncommitted at this documentation update. Publishing this log does not publish those repairs or deploy them. Physical-device acceptance remains open.

## Status definitions

- **Fixed locally:** An uncommitted repair passed the recorded checks; publication, deployment and device acceptance are separate.

- **Reported improved:** The user confirmed improvement on their television; not a certification of all devices.
- **Fixed in source:** A committed fix has automated verification; device acceptance remains separate.
- **Workaround documented:** A route around the obstacle exists, with remaining limitations stated.
- **Open:** The issue or required verification remains unresolved.

## Platform and development experience

### F01 Choosing the correct Fire TV installation route

**Area:** Device identification and developer onboarding. **Observed:** Earlier development; exact date unrecorded. **Impact:** Blocked confidence in installation. **Status:** Workaround documented; installed-device acceptance open.

I had a developer activation code but could not work out where to enter it. I also wanted a Windows workflow and was unsure whether the Fire TV stick needed to be plugged into the computer. The exact device model and OS were not confirmed at that point.

We documented model/OS identification, the Fire OS Android build, and installation over the local network. Silk provided a way to inspect the web experience on the television. The repository's installation notes explicitly distinguish the Android build from Vega compatibility.

**What the interruption looked like:** My messages included “I am trying to activate my developer mode I have the code but can’t figure out where to put it,” followed by “So am I stuck” and “I don’t want to do Mac or Linux.” I then asked how to use Silk. This was not an abstract documentation concern: I had moved from building the app to trying to see it on my own TV and did not have a clear next step.

**Expected versus actual:** I expected a straightforward route from the APK to the TV. Instead, I was trying to distinguish device activation, developer settings, sideloading and browser testing. When asked for the Fire TV model, I answered “Not sure right now.” The record therefore does not support blaming a specific device or OS.

**What helped:** The installation guide now starts with identifying the device, separates Fire OS from Vega, and gives Windows commands. Silk let me continue checking layout and scrolling, but it did not prove that the APK installed or behaved correctly as a native app.

**Suggested improvement:** Start the onboarding flow with device model and OS, then show the applicable packaging, activation and installation steps for the developer's computer OS. Explain what each code or prompt is for, rather than assuming the developer already knows the installation route.

**Evidence:** User setup questions in the development conversation; [installation guide](FIRE-TV-INSTALL.md). This is an onboarding observation, not a verified defect in an Amazon activation service.

### F02 Windows build paths and disk usage

**Area:** Android build environment. **Observed:** 10 October 2026 build notes. **Impact:** Interrupted APK rebuild. **Status:** Workaround documented.

The rebuild required freeing disk space and moving the Gradle cache to a shorter path. The recorded successful build used `D:\cf-gradle` to address Windows dependency path-length limits. The resulting APK passed signature and launcher-entry checks, but no device was connected to ADB for installation verification.

**Why this mattered during the build:** I asked “How much disk space is left” and “What can I move to clean up the space and continue this work.” Development paused to deal with the machine rather than the product. The later build notes record a successful 82.5 MiB APK, but that output size is not the amount of temporary space the build required.

**A second environment problem appeared during review:** The old checkout path was empty because the repository had moved to another drive. We located it, made an isolated review checkout, and initially linked its dependencies. Expo then tried to export a font using an invalid path containing a second Windows drive prefix. Copying the TV dependencies into the working checkout resolved that export failure. The web build separately needed permission to read dependency and ancestor paths outside the sandbox.

**Lesson:** A successful build command depends on the actual filesystem layout, caches and permissions. These were local environment problems, not evidence that the Fire TV runtime was broken. A useful preflight would have surfaced them before the build started.

**Suggested improvement:** Add a Windows preflight that checks available disk space and path length before dependency downloads, and provides a short-cache-path example. Keep the distinction between a debug-signed demo APK and a distribution-ready release visible.

**Evidence:** [Build status and Windows instructions](FIRE-TV-INSTALL.md). Build duration and exact disk consumption were not recorded.

### F03 Forced dependency remediation could not resolve the TV audit

**Area:** npm, Expo and React Native TV dependency chain; not an Amazon SDK failure. **Observed:** 18 October 2026 local session. **Impact:** Dependency security gate remains unresolved. **Status:** Open.

Running `npm audit fix --force` for the TV package proposed changing Expo 57 to Expo 44.0.6, then failed with `ETARGET: No matching version found for undefined@undefined`. No tracked dependency files changed. The subsequent audit reported 14 high-severity package findings and no critical findings; this is not a count of 14 distinct exploitable production vulnerabilities. Web and AWS package audits reported zero findings in that run.

**Reproduction:** From the repository root, run `npm --prefix tv audit fix --force`, followed by `npm --prefix tv audit --json`.

**What I expected:** I asked to run `npm audit fix --force` because I wanted the outstanding findings dealt with. I expected either compatible dependency updates or an understandable explanation of what could not be fixed.

**What npm actually printed:**

```text
npm warn audit Updating expo to 44.0.6, which is a SemVer major change.
npm warn audit Updating undefined to undefined, which is a SemVer major change.
npm error code ETARGET
npm error notarget No matching version found for undefined@undefined.
```

The report named packages including Expo, Metro, node-forge, braces and the React Native TV dependency chain. We checked the tracked package and lock files after the command: there was nothing new to commit. The audit was still unresolved, even though the command had been run.

**What would count as a resolution:** Identify the actual advisory paths, select compatible patched versions, then pass the TV type checks, web export and native build. A lower audit count alone would not justify breaking the TV framework combination. The mechanism behind npm's undefined target has not been established; it should not be presented as a confirmed alias-handling root cause.

**Suggested improvement:** Provide a supported remediation path for the Expo/React Native TV version combination. Audit tooling should report why it cannot resolve a fix instead of generating an undefined package target and should clearly distinguish framework downgrades from compatible security fixes.

**Evidence:** Captured npm command output; `tv/package.json` and `tv/package-lock.json`. Next action is a targeted advisory and compatibility review, not accepting the suggested downgrade blindly.

### F04 Synchronous AI work needs a different AWS request design

**Area:** Application architecture and service integration. **Observed:** AWS migration work. **Impact:** Live multi-call AI cannot simply be enabled in the initial AWS adapter. **Status:** Catalog fallback in place; live AI integration work remains.

The AWS implementation bounds the backend request at 28 seconds. Some existing AI flows can involve multiple provider calls and a longer client timeout. Keeping the UI waiting longer would not make the backend request survive. The initial AWS configuration therefore uses catalog matching while retaining the Vertex integration code.

**What changed in the project:** I asked for AWS hosting while preserving the existing Cloudflare deployment until the new environment could be verified. This required adapting database calls, media storage, request identity and secrets, rather than just uploading the same files somewhere else.

**Where the product expectation and implementation differed:** The product had been discussed as AI-assisted matching, but the initial AWS configuration intentionally used the recipe catalog. The Vertex integration code being present did not mean live AI was enabled. That distinction needed to appear in controls and explanations, not just in deployment notes.

**What was actually checked after deployment:** The public document routes returned successfully, the health response reported ready, and the deployment marker matched the API marker. That established basic reachability and version consistency. It did not establish that AI recommendations, physical remote navigation or phone synchronization worked end to end. An unknown static route also returned a raw S3 403 XML response during that check; a branded missing-page experience was recommended, but a subsequent fix was not verified in this record.

**Suggested improvement:** Use an asynchronous job/status flow or a deliberately bounded generation path before enabling live AI. Show a clear progress or fallback state and do not describe catalog results as live AI output.

**Evidence:** [AWS deployment limitations and configuration](AWS-DEPLOYMENT.md). This is a design constraint identified during migration, not evidence of a measured production timeout incident.

## Product and living room experience

### F05 Remote Down did not move the page in Silk

**Area:** TV navigation. **Observed:** Earlier TV testing; exact date unrecorded. **Impact:** Blocked access to lower content. **Status:** Reported improved; latest physical-device regression still needed.

My answer when asked what happened on the TV was: “Down won’t move the page.” Later, I sent another photo and wrote: “Scrolling is good now now clean up the rest.” That confirmed an improvement in that session, not that every navigation path was fixed.

We added explicit paging assistance and regression checks for scroll bounds, focus restoration and modal isolation.

**The sequence matters:** I first reported that Silk made it difficult to get back up after scrolling down. Later, after more changes, I reported that I could not scroll down at all. I then clarified that pressing Down did not move the page. The problem changed across iterations, so a single “scrolling fixed” note would hide useful history.

**What I was trying to do:** Browse beyond the hero and first shelf, reach an item lower on the page, and get back to the navigation using the remote. When Down did nothing, content below the visible area might as well not have existed.

**What the workaround added:** Explicit Down, Up and Top controls made movement discoverable. Those controls also took up space over the TV layout, creating a design tradeoff: navigation had to remain usable without covering dish images or shelf content. Automated checks now cover page limits and modal behavior, but I still need to run the latest build through the whole screen with the physical remote.

**Suggested improvement:** Include a reference page that exercises long vertical content, horizontal shelves, focus, Back, dialogs and scrolling with an actual remote. Test the last actionable item on every screen, not just the first visible row.

**Evidence:** User TV photos and messages; `tv/src/SilkScrollAssist.tsx`; `tv/scripts/review-regressions.cjs`. No specific Silk or hardware version was captured.

### F06 Desktop-sized text and competing artwork failed at couch distance

**Area:** TV visual design. **Observed:** Multiple earlier living-room reviews; dates unrecorded. **Impact:** Slower reading and difficulty recognizing dishes. **Status:** Iterated; current deployed build needs visual acceptance.

My first practical feedback was “Hard to read from the couch.” Later I asked for a larger logo and said, “That kinda worked but now it’s hard to see the dishes on the images.” Photos showed dense controls and movie artwork competing with food imagery. Adding more movement and features sometimes made the layout less clear.

The design direction changed toward one dominant evening, a clear planning action, larger readable text, visible dish art, and secondary features below the first shelf. Motion was reserved mainly for focused elements and reveal/loading moments.

**What the photos revealed:** Earlier versions had a left sidebar, small navigation labels, paragraphs over movie art and small action buttons. Later versions moved to a top navigation bar and a larger featured pairing. That helped the hierarchy, but some recommendation cards combined differently shaped movie and dish images with empty blue areas. I sent a photo of those cards with the comment “Looks wierd.”

**Why a screenshot at a desk was misleading:** The food image is part of the decision, not decoration. If I can identify the film but cannot tell what dinner is, the main promise of the app is only half visible. Making the movie background more dramatic did not necessarily make the pairing easier to choose.

**The design rule I eventually gave:** Keep one featured evening and one clear “Plan this evening” action dominant. Show two feature previews at a time, put them below the first recommendation shelf, and keep background motion quiet. That instruction came after repeated attempts to make the app more impressive had also made it busier.

**Suggested improvement:** Validate at actual viewing distance with both text and food recognition tasks. Capture TV size, distance, viewport and a representative photo on the next pass. Desktop screenshots alone should not be the acceptance criterion.

**Evidence:** User-provided TV photos and feedback; [UX consolidation notes](UX-CONSOLIDATION-2026-10-11.md). No formal readability score or user-study result is claimed.

### F07 Different screens showed different dinner and watch times

**Area:** Shared schedule state. **Observed:** 18 October 2026 review and follow-up. **Impact:** Undermined trust in the evening plan. **Status:** Fixed in source; device walkthrough pending.

After a cooking delay, prominent TV times used a different calculation from the live timeline. The browser timeline also retained the old calculation. A deterministic follow-up probe showed dinner at 30 minutes in the browser and 50 minutes on TV for the same delayed session.

We routed the displays through recipe-aware projections and tested late progress as well as explicit delays. A separate boundary check found that timer expiry could move dinner five minutes earlier; the fix retains the remaining recipe steps when a timer expires.

**How to reproduce the original mismatch:** Open a saved evening, start cooking, apply a 15-minute delay, and compare the prominent dinner/watch times with the live timeline. The review handoff identified `eveningTimeline` in the prominent displays and `readyTogetherPlan` in the live timeline. Only the latter applied the cooking-delay boundary and projected remaining work.

**What the probes showed:** In one follow-up fixture, the old browser calculation showed dinner 30 minutes after the starting point while the current projection showed 50. These are relative fixture timestamps, not a claim about an observed household dinner. A separate timer fixture showed dinner at +35 minutes just before expiry, then +30 at expiry without a step being completed.

**Why the initial tests missed it:** Individual calculations could return plausible values while different screens disagreed. The added tests compare the sources used by both clients and exercise the exact expiry boundary. This made the acceptance condition concrete: the same saved evening and observation time must produce the same dinner/watch times.

**Suggested improvement:** Treat the schedule as one shared product model. Test transitions and boundary times, including just before and after timer expiry, rather than only testing each screen in isolation.

**Evidence:** Commits `f649649` and `2dfa416`; `tv/tests/schedule.test.mjs`; `web/tests/review-followup.test.js`.

### F08 Saving preferences could make unavailable AI controls appear

**Area:** API response consistency and capability-aware UI. **Observed:** 18 October 2026 review. **Impact:** Users could enter a flow that the server could not fulfill. **Status:** Fixed in source.

Feedback and taste-memory responses replaced the household state without its capabilities. Pantry saves and evening deletion had the same response-shape gap. Separately, the browser cooking page always offered an AI coach even when live AI was disabled; the request returned a 503 response explaining that AI was off.

We standardized full household responses and added non-sensitive capabilities to shared cooking responses. The browser now offers saved guidance when AI is unavailable. TV recipe-help state was also connected to the actual guidance panels.

**What the user journey exposed:** In catalog mode, rating an evening or removing a saved preference could replace the entire client household object. The mutation itself succeeded, but the response omitted capability information. Until a refresh restored it, the app could offer an AI route that the server would reject.

**The original fix was too narrow:** The feature branch already fixed Food settings. Reviewing only that endpoint could have suggested the issue was closed. Auditing all household-replacement paths found feedback, taste memory, pantry updates and deletion as well.

**A second disconnect:** Recipe help set a state value in the parent app, but the cooking screen had its own collapsed-detail state. We added a component-level test that opens the guidance, closes it, and requests help again. That checks what a person can do after pressing the button, rather than just checking that the callback ran.

**Suggested improvement:** Make capability information part of an explicit response contract and test mutation responses against a fresh household read. Check the next action after a save, not only whether the save returned success.

**Evidence:** Commits `f649649` and `2dfa416`; `web/tests/catalog-mode.test.js`; `web/tests/review-followup.test.js`; `tv/tests/recipe-help.test.mjs`.

### F09 Late delivery confirmations and retries changed the evening twice

**Area:** TV/phone handoff recovery. **Observed:** 18 October 2026 follow-up reviews. **Impact:** Incorrect arrival times and stalled confirmation recovery. **Status:** Fixed in source; offline device test pending.

A confirmation processed ten minutes after placement initially turned a 35-minute ETA into 45 minutes from placement. After correcting that, replaying the same confirmation could still move arrival later again. The TV also marked a confirmation handled before persistence succeeded, so a blocked or failed save stopped automatic recovery.

We anchored initial estimates to placement time, separated deliberate ETA updates, and added stable confirmation identity. Replays preserve the saved evening and do not duplicate it or overwrite a newer ETA. Polling now awaits successful persistence, retries failures without overlapping requests, and stops when the handoff closes.

**Three separate failures appeared in sequence:**

1. Initial ETA anchoring: an order placed ten minutes earlier with a 35-minute estimate was treated as arriving 35 minutes from processing time. The API probe produced 45 minutes from placement.
2. Duplicate confirmation: replaying the same payload ten minutes later moved arrival another ten minutes. A retry was being interpreted as a deliberate ETA edit.
3. Failed persistence: the polling effect set its handled flag before awaiting the save. A targeted probe showed one read, one save attempt, `handled: true` and zero retry timers after a callback returned without success.

**Why it matters in a living room:** A phone can confirm while the TV is backgrounded or disconnected. A request can reach the server even if its response never reaches the TV. In either case, asking the person to repeat the confirmation must not change the meaning of the order or create a second evening.

**What the fix now guarantees in automated tests:** The same confirmation returns the existing evening; conversion retries preserve arrival; an older confirmation cannot undo a newer explicit ETA; blocked and failed saves are retried; polling does not overlap saves; closing the handoff prevents a late read from being applied. These checks are stronger than the original happy path, but the physical offline/reconnect demonstration is still outstanding.

**Suggested improvement:** Build retry-safe writes into cross-device flows from the start. Test a lost response after a successful write, not just a request that fails before reaching the server.

**Evidence:** Commits `2dfa416` and `0ce2d25`; `web/tests/review-followup.test.js`; `tv/tests/order-confirmation-sync.test.mjs`.

## Content and iteration costs

### F10 Generating a distinct dish image for every missing recipe did not scale well

**Area:** Asset production and developer workflow. **Observed:** Earlier image-generation work; exact dates unrecorded. **Impact:** Repeated coordination and uncertainty about progress. **Status:** Current image coverage not reconciled in this log.

When told there were 471 missing recipe images, I chose “Create a distinct image for all 471 recipes.” I wanted the food to look appealing and match the actual recipe rather than reuse one generic dish photo.

The following messages show the friction: “how many images were done,” “how many left ?,” “is there a faster way to do this and more chepaer way,” and eventually “stop generating more and talk to me.” I also asked to continue without individual approval prompts or showing every generated result.

The evidence supports a workflow problem: I did not have a clear enough view of coverage, progress or the tradeoff between uniqueness and effort. It does not establish an exact final image count, generation cost, or that every stop request left a job running. Those numbers and process states should not be invented after the fact.

**What I would change:** Start with the dishes that appear in the demo and first recommendation shelves. Maintain a recipe-to-image manifest with pending, generated, reviewed and published states. Show batch progress and failures together. Keep stop and resume behavior clear. Review ingredient accuracy and presentation before publishing, and label generated images as illustrations.

**Evidence:** The 471-image coverage question and my subsequent progress, cost and stop requests. This is feedback on the asset-production workflow, not a Fire TV SDK issue.

### F11 The introduction needed a story without getting in the way

**Area:** Startup pacing and first-use experience. **Observed:** Several earlier iterations; dates unrecorded. **Impact:** The opening could disappear before it communicated the product, or add complexity before planning. **Status:** Source refined; latest on-device pacing unverified.

I initially asked for instructions that took ten seconds or less. I then asked for more animation, images and a real-life story. Later I reported: “The loading screen storyboard goes away too fast and doesn’t work also the whole ux looks bad now.” These requests pulled in different directions, and the design needed to resolve that rather than simply make every screen longer or more animated.

The source now keeps planning as the primary startup action and groups story navigation, pause and music under optional controls. That gives returning users a direct route while keeping the story available.

**What I would test next:** Can a first-time viewer explain what the app does after the introduction? Can a returning viewer skip it immediately with the remote? Does a slow network change the pacing or interrupt the story? A timed clip of the actual TV would be more useful than another static mockup. No comprehension score or completion rate has been measured.

**Evidence:** My startup feedback and [UX consolidation notes](UX-CONSOLIDATION-2026-10-11.md).

### F12 Passing checks did not mean the current device build had been reviewed

**Area:** Verification and release communication. **Observed:** AWS review and subsequent fix rounds. **Impact:** Easy to confuse source readiness, GitHub publication and a working TV release. **Status:** Known verification gap.

The AWS review could verify HTTP responses, headers and the health/version marker, but an interactive browser connection was unavailable. Later fixes passed automated tests and were pushed to main. They were not deployed by those push operations.

One review also raised a possible React remount problem and then ruled it out after checking that the page functions were called directly. That suspicion is not listed as a product defect here. Recording the correction matters: a confident-sounding review statement is not evidence until the relevant behavior has been checked.

**What I would change:** Every release note should show four separate facts: commit tested, commit pushed, version deployed, and version actually exercised on the TV. Every defect should say whether it came from a photo, source inspection, a deterministic probe, a rendered-component test or a physical-device reproduction. This avoids both overstating confidence and repeatedly investigating an already ruled-out issue.

**Evidence:** Deployment checks, correction in the review conversation, and the source/build verification recorded in [review fix notes](TV-PLANNING-REVIEW-FIXES.md).

## 22 October: recovery and journey follow-up

These findings came from source inspection, deterministic probes and automated regressions. They are not new physical-TV observations. Interactive localhost review was blocked by tooling policy; the public deployment was not substituted for the local build.

| ID | Friction | Current status | Acceptance still needed |
| --- | --- | --- | --- |
| F13 | Older reads could undo a visible group reveal | Fixed locally | Two phones voting on a slow connection |
| F14 | Recovered connections could still look broken | Fixed locally | Real disconnect/reconnect and saved-progress checks |
| F15 | Shared-phone Back opened household discovery | Fixed locally | Browser and installed-device Back rehearsal |
| F16 | Parent/photo setup had no initial-read retry | Fixed locally | Network failure and recovery on device |
| F17 | Wrapped navigation and hero presentation needed refinement | Fixed locally | Small-screen and couch-distance inspection |
| F18 | Catalog, delay and delivery states disagreed | Fixed locally | Complete cross-screen cooking/takeout journey |

### F13 Group voting could show an older phase

**Goal:** Vote together and keep the revealed result visible. **Impact:** The group could appear to lose its decision, even without server data loss.

**Reproduction and evidence:** Hold an earlier room read, complete a vote/reveal, then allow the old read to return. The original interval accepted each completion. A deterministic probe resolved a newer read before an older one and observed the phase regress to voting.

**Repair:** Serialize polling; guard results with the local write revision; discard responses after room changes or unmount. Regression checks cover stale results and obsolete errors. **Status:** Fixed locally. A real multi-phone session is still required.

### F14 A recovered connection still displayed an error

**Goal:** Reconnect and continue without wondering whether progress was saved. **Actual:** Successful reads updated room data without clearing the earlier connection error.

**Repair:** Separate connection errors from action/form errors. A successful read clears the connection message without erasing useful validation. Cooking synchronization rejects reads from an earlier connection and refreshes after reconnecting; this does not imply automatic replay of mutations.

**Verification:** Controlled failure/recovery and stale-read tests. **Status:** Fixed locally. Physical disconnection, progress retention and duplicate-action checks remain open.

### F15 Shared cooking Back left the companion flow

**Goal:** Close an overlay or remain with the recipe. **Actual:** At the shared cooking root, Back could enter discovery with partial household state.

**Evidence:** A probe executed the actual Back callback with a shared cooking context. This was a navigation defect, not evidence of expanded server authorization.

**Repair:** Dismiss dialogs/errors first and keep the shared root in cooking. Ordinary household navigation still pops normally. Two regressions execute the actual handler. **Status:** Fixed locally; device Back behavior remains unverified.

### F16 Temporary read failures stranded secondary screens

**Goal:** Open parent controls or a photo editor. **Actual:** A failed initial read left controls unavailable without Retry; the photo editor also lacked a stale-load guard.

**Repair:** Explicit loading/error/ready states and Retry through the cancellable resource loader. Its tests cover retry, failure versus empty state, cancellation and stale results. **Status:** Fixed locally. Helper tests do not prove that every rendered control is reachable on a TV.

### F17 Navigation and first-screen polish needed another pass

**Goal:** Reach every destination and understand the featured dinner. **Friction:** Wrapped navigation needed predictable directional movement; disabled controls could regain focus; long names and missing images weakened the hero.

**Repair:** Wrapped-row navigation checks, disabled-focus guards, narrow-layout sizing and short readable meal names. Spotlight selection favors eligible meals with reviewed imagery when available. Missing-photo cases retain honest fallbacks instead of unrelated dishes.

**Status:** Fixed locally at code/regression level. Image accuracy, clipping and couch readability still need rendered and physical inspection. No visual certification is claimed.

### F18 Planning needed consistent state across surfaces

**Goal:** Save in catalog mode, adapt dinner and see the same schedule everywhere. Earlier review found unavailable-AI routes, lost capability settings after edits, inconsistent delayed times and an assumed takeout estimate before user input.

**Local remediation:** Catalog-aware routing and capability responses, shared schedule projection, explicit delivery estimates and restriction checks across plan transitions. Content work also corrected recipe guidance and selection behavior.

**Verification:** API and pure-function regressions, including schedule, restriction-transition and review-loop cases. **Status:** Fixed locally. Actual taste, kitchen outcomes and cross-device usability are not established by these tests.

### Evidence ledger and release decision

The fresh post-repair review reran 266 web/TV tests successfully. The preceding repair pass also passed 10 AWS tests, the production build and secret-pattern scan. No new defect was confirmed in that focused recheck; this was not an exhaustive visual review.

Before marking these entries released: commit the app repairs, record the tested commit, publish it, deploy deliberately, record the deployment version and complete the device journey. Older entries retain their historical evidence and checkpoint-specific status. Time lost and reproduction frequency were not measured and are not invented here.

## Next evidence to collect

1. Record the Fire TV model, OS, Silk version if used, and app/build version. Distinguish installed-app testing from browser testing.
2. Deploy the reviewed commit, record the deployed version, and complete a remote-only journey from launch to a saved evening.
3. Scan the cooking QR, advance steps on the phone, apply a delay and compare both screens.
4. Confirm a delivery while the TV is offline, reconnect, then intentionally update the ETA. Verify one saved evening and one correct arrival time.
5. Capture a short before/after recording or screenshots for the navigation and readability entries. Keep household keys, QR contents and credentials out of public evidence.
6. Revisit the dependency audit with exact advisory identifiers, affected dependency paths and a tested compatible remediation.

## Template for future entries

- **Date and build:**
- **Device, OS and browser:**
- **Area or tool:**
- **What I was trying to do:**
- **Steps to reproduce:**
- **Expected result:**
- **Actual result and evidence:**
- **Impact and measured time lost, if available:**
- **Workaround or fix:**
- **Verification performed:**
- **Status and next action:**
- **Suggested improvement for the tool or platform:**

This log is project feedback material, not a statement that an official submission requirement or bonus has been satisfied. Nothing in this document has been sent to Devpost.
