# QA Plan

## Test Areas
- Progress math: streak rollover (local day), XP accrual rules (complete vs skip/timeout), badge unlock criteria, challenge progress, goal bars accuracy.
- Events: complete/skip/timeout emit once; recap triggers on schedule completion and on-demand; challenge claim idempotent.
- UI: chips/bars values; presets/filters applied; alignment warnings appear/hide correctly; CTA enable/disable for empty selection.
- Recap: correct deltas, badge list, goal/challenge progress, share text populated.
- Flags: recap/challenges/badge strip off hides related UI; on shows full flow.
- Quiet mode: suppress prompts/animations but still update state; ensure UI chips persist.

## Manual Scenarios
- Streak boundary: complete before and after midnight; ensure one-day increment only.
- Skip/timeout: streak freeze/penalty rules apply; XP reduced/none; UI reflects status.
- Empty selection: generate/start disabled; guidance shown; preset enables CTA.
- Difficulty out-of-range: warning shown; swap/adjust options functional; warning clears after fix.
- Challenge completion: progress increments; reward granted once; claimed state persists reload.
- Recap: after schedule end; shows correct XP/streak/badges; share copies text.
- Home left rail: actionable cards start/resume; upcoming/completed toggle works.
- Quiet mode: no prompts mid-session; recap still available; chips still update.

## Performance/Resilience
- Large selection tree remains responsive; summary memoization effective.
- LocalStorage unavailable: fall back to defaults; no crashes; reward UI hides gracefully.
- Offline: flows work without network; no telemetry dependency.
- Debounce checks: alignment warnings don’t spam; mid-session prompts capped.

## Regression Targets
- Existing schedule creation/generation not broken by new CTA/flows.
- Difficulty settings persistence intact.
- Audio player still triggered appropriately (complete/skip/timeout).
- Header remains uncluttered on small screens; drawer closes cleanly.
