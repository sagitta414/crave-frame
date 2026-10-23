# AWS live acceptance — 23 October 2026

Release verified: crave-20261023-2. API readiness and frontend marker agree.

## Passed
- 52 live HTTPS flow checks: pages/assets and security headers, preferences, catalog recommendations, household isolation, saving, scoped phone updates, cooking delay persistence, completion/viewing, edition creation/update/stale-revision rejection, feedback and taste capability preservation, delivery ETA/arrival/retry guards, revocation and cleanup.
- Direct API and private media bucket deny public access (403). Missing document returns 403.
- Browser: recent Dexter search executes immediately; real TMDB series/seasons/episodes load; dinner shortlist opens; review blocks saving before ingredient approval; adaptation updates ingredients and image caption; Escape returns to shortlist.
- TV page: navigation, page-down/top, library and stale-evening explanation, food and pantry settings inspected. 1280x720 screenshot checked.
- Browser planner: home to ingredient review and catalog-mode Plan tonight both work. Narrow 390px layout inspected.
- Scoped phone browser at 390x844: preparation gate, start cooking, step advancement and reload preserve step 2. Test evening removed; link verified revoked.

## Findings and limitations
- Dexter shortlist produced three pasta dishes; all three carried the same Least cooking effort label. Valid choices, weak differentiation.
- Phone cooking opens with a large optional partner/role block before the current step; at 390x844 it consumes almost the entire visible content area. Collapse or move it below the current step after starting cooking.
- Browser planner navigation wraps into two rows at 390px; accessible, but consumes significant vertical space.
- TV console emits useNativeDriver unsupported on web warning and falls back to JS animation. No error-level console messages observed in inspected tabs.
- Physical Fire TV remote, two physical phones, actual offline/reconnect and live AI provider behavior were not tested. Catalog-mode and phone reload behavior were verified.
- Three empty disposable test households remain; their test evenings/memories were removed. Existing user evening progress was not changed.
- Existing dependency advisories remain under documented temporary mitigations. This pass did not change deployed code.

## Follow-up fixes prepared
The four UX findings above were corrected locally: phone instructions precede collapsed partner controls, personalized watch shortlists prefer distinct meal categories, tied effort scores omit the superlative badge, mobile destinations use one compact row, and web animations use the JS driver. Validation: 245 web tests, 108 TV tests, 11 AWS tests, TypeScript, navigation checks, production build, and credential-pattern scan passed. Real-device visual verification remains outstanding.

