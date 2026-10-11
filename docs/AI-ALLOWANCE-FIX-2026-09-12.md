# AI allowance correction

The production usage table showed one household at the 35-action daily limit and the shared counter at 81 of 200. This was an application limit, not evidence of a Vertex AI outage.

The household allowance is now 100 actions per UTC day. The shared limit remains 200. Counters and existing usage are preserved. Requests rejected by the household limit no longer increment shared usage; requests rejected by the shared limit release their household reservation. Errors identify the exhausted scope and time until the midnight UTC reset.

Verification: 86 backend tests and 14 TV tests passed, plus type-checking and scrolling regressions. New tests cover resuming at the old 35-action limit, repeated household rejections, rollback after shared-limit rejection, and concurrent reservations at the shared limit. Sites build passed.

Published source: `425a512df69c5d026779fe05ed438124990de13f`, Sites version 93.

Deployment succeeded. A live home refresh returned a non-quota matching failure; the following focused Ratatouille request returned three dinner choices with streaming availability. The allowance error was absent. Provider/model matching can still fail independently of the daily allowance.

User-requested testing increase: daily limits raised to 1,000 per household and 2,000 site-wide. Midnight UTC reset and rejected-request accounting remain intact. All 100 tests and the release build passed. Release source: c86b93d806b777d675386867c71ece10d0aeb4c7.
