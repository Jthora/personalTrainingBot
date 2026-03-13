# Event Map

## Core Events
- `WORKOUT_COMPLETE`: user completes current item (set/block).
- `WORKOUT_SKIP`: user skips item.
- `WORKOUT_TIMEOUT`: timer expires; treat as skip with timeout reason.
- `SCHEDULE_SET`: schedule generated/selected and becomes active.
- `SELECTION_CHANGED`: selector state updated (presets/filters/manual toggles).
- `DIFFICULTY_CHANGED`: difficulty level/range updated.
- `CHALLENGE_CLAIMED`: reward claimed after completion.
- `RECAP_VIEWED`: recap modal opened/completed.
- `QUIET_MODE_TOGGLED`: user opts in/out of prompts/animations.

## Emitters (sources)
- `useWorkoutSchedule` (complete/skip/timeout, schedule set).
- `WorkoutSelector` (selection change, generate/start triggers schedule set).
- Difficulty UI (dropdown/range changes).
- Recap modal (view/close), challenges UI (claim).
- Settings/coach dialog (quiet mode toggle, flags for animations/share).

## Handlers & Side Effects
- Progress updates: streak calc (date-based), XP increment with rules (full for complete, partial/none for skip/timeout), badge checks, goal/challenge progress.
- UI updates: chips/bars refresh (streak/XP/goals/challenges), toasts/prompts, recap trigger on schedule completion or on-demand.
- Audio/feedback: success/skip/timeout sounds; optional haptics toggle (future).
- Alignment checks: rerun when difficulty or selection changes; surface warnings and suggested swaps.
- Quiet mode: suppress prompts/animations/sounds when enabled; still update state silently.

## Guardrails
- Debounce rapid-fire events (multi-complete) to avoid double XP.
- Idempotency per item id within a short window; ignore duplicates.
- Date handling for streak rollover (local day boundary); avoid double-count across midnight.
- Challenge/goal over-completion: clamp to target and ensure single reward grant.
- Prompt rate-limit: max one mid-session prompt per session; alignment warnings show once per material change.

## Data Writes
- `UserProgressStore`: streak/XP/badges/goals/challenges, last recap.
- `WorkoutSchedule`: completion state, completion%.
- Optional: cached selection summary for quick load.

## Feature Flags
- Recap modal, challenges, badge strip, alignment warnings, share.
