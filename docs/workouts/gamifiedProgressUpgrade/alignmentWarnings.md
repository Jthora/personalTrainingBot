# Alignment warnings — thresholds and telemetry

## Thresholds
- **Warn trigger:** More than 30% of scheduled sets fall outside the selected difficulty range (see `checkScheduleAlignment`).
- **Neutral handling:** WorkoutBlocks are counted as neutral; only WorkoutSets contribute to out-of-range counts.
- **Debounce:** UI surfacing is delayed ~300ms to avoid flicker on rapid edits.

## Surfacing rules
- **Per-change:** A warning surfaces once per material change (schedule version, difficulty level, or item count).
- **Quiet mode:** If `quietMode` is enabled in `UserProgressStore`, warnings are suppressed entirely.
- **Dismiss:** Users can dismiss a warning for the current schedule key; it will re-evaluate on the next material change.
- **Resolution:** When alignment returns to pass, the surface hides and a resolution event is logged.

## Auto-suggest fixes
- **Lower difficulty:** Suggests `level-1` as a quick fix and references the current misaligned count.
- **Mobility/steady insert:** If out-of-range workouts are present, names the heaviest offender (when available) and prompts a swap or mobility add-on; otherwise defaults to a steady-block recommendation.
- **Spread muscle groups:** Encourages alternating heavy blocks; when two out-of-range workouts are found, they are called out directly.
- **Data source:** Suggestions are derived from `schedule.scheduleItems` when available (workouts with `difficulty_range`), otherwise fall back to generic copy.

## Telemetry events
- `alignment_warning_surface`: Fired once per schedule key when a warn state first surfaces. Payload: `{ outOfRange, total, difficulty }`.
- `alignment_warning_resolved`: Fired when a prior warn transitions to pass on a new key. Payload mirrors `surface`.
- `alignment_warning_ignored`: Fired when the user dismisses the warning for the current key. Payload mirrors `surface`.

Metrics are stored locally via `recordMetric` (see `src/utils/metrics.ts`); capped at 200 events for storage safety.

## Tuning levers
- **Warn threshold:** Adjust `threshold` in `checkScheduleAlignment` (currently `> 30%` out-of-range).
- **Debounce delay:** Adjust the `300ms` timeout in `AlignmentWarning` to balance responsiveness vs. churn.
- **Dismiss scope:** `dismissedKey` equals `scheduleVersion|difficulty|itemCount`; tweak composition to broaden/narrow the suppression window.
