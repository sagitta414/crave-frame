# Five-household TV and phone trial

Status: not run. Recruit five consenting households; do not treat automated tests or the builder’s own demonstration as user validation. Use anonymous IDs H1–H5, not names or private cooking-link tokens.

## Session setup

Record TV model, Fire OS/Silk or native build, browser viewport, phone OS/browser, test date, and deployed version. Use the actual TV remote, not a mouse. Observe from the normal couch distance. Test once without coaching; record every intervention. Use a test household and disconnect cooking links after the session.

## Tasks

1. New user: understand the app and reach a usable evening from the opening. Can they find Plan my evening without watching the full story?
2. Select a known movie; compare the returned dinners. Measure time from opening the app to choosing dinner. Ask why they chose it; do not suggest an answer.
3. Review ingredients and save. Check that food exclusions and serving quantities are visible. Change optional settings only if the participant asks.
4. Scan the cooking QR on the phone. Verify that the refreshed food image and step screen opens, not the legacy web cooking page.
5. Preview steps, start cooking, advance a step, and confirm TV agreement. Start/stop a timer. Temporarily disconnect and reconnect the phone; record whether the UI tells the truth about saved progress.
6. Add a delay on the TV; check revised dinner/watch times. Return without losing the selected meal or completed steps.
7. Create a shared room. Join with two phones, save preferences and vote privately. Verify no individual choice is visible before reveal, all votes unlock reveal, and tied results are explained honestly.
8. Complete a real recipe using FLAGSHIP-RECIPE-TRIALS.md. Record actual cooking problems, not hypothetical opinions.
9. Mark dinner ready, open the streaming provider independently, leave feedback, and find the evening in the library.
10. Return another day without prompting. Record whether they return voluntarily, what they repeat, and whether Crave Frame reduced effort.

## Device and recovery checks

- Every direction, Select and Back work; focus stays visible after modals and paging.
- At couch distance, read a title, ingredient quantity, timer and the next action.
- At narrow phone widths, no clipped controls or horizontal scrolling; keyboard entry remains usable.
- Screen reader labels, larger text and reduced motion remain usable.
- Expired cooking links explain how to renew; refresh does not duplicate an evening.
- Takeout opens the provider and clearly requires the user to place the order and enter an ETA.
- For catalog mode, refinements change the requested dimension or explain no match; they do not pretend to run AI.

## Results sheet

| Household | Time to choose | Needed help / where | Actual dinner cooked | Route or sync failures | Voluntary return | Decision felt easier? |
|---|---|---|---|---|---|---|
| H1 | Pending | Pending | Pending | Pending | Pending | Pending |
| H2 | Pending | Pending | Pending | Pending | Pending | Pending |
| H3 | Pending | Pending | Pending | Pending | Pending | Pending |
| H4 | Pending | Pending | Pending | Pending | Pending | Pending |
| H5 | Pending | Pending | Pending | Pending | Pending | Pending |

## Proposed acceptance criteria

These are test targets, not achieved results: four of five households save an evening without coaching; median decision time under two minutes; no blocked remote/phone journey; saved restrictions preserved; clear reconnect/expiry handling; at least three voluntarily use it again within a week. Investigate any wrong recipe quantities or lost progress before increasing scope. Record failures and corrections before claiming readiness.
