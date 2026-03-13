# Workflows

## User Journeys
- Create random schedule: user triggers generation → cache selections applied → difficulty-aware generator → schedule persisted and shown.
- Create/adopt custom schedule: user builds or selects custom → set as current → context updates → UI refreshes.
- Apply filters: user toggles categories/groups/workouts → selection stored → next generation uses filtered set.
- Complete/skip workouts: user acts in UI → context mutates schedule → persistence and UI advance to next item.
- Calendar usage (future): user assigns schedules per day → agenda/notifications reflect stored calendar.

## State Charts / Sequences (to elaborate)
- Schedule generation: load taxonomy → hydrate selections → generate → persist → notify.
- Completion: complete/skip → update schedule items → persist → bump version → UI derives next item.
- Selection change: toggle → persist versioned map → future generations reflect new set.
- Custom schedule adoption: set current → persist → bump version → UI refresh.

## UI States to Document
- Loading/hydrating schedule.
- Empty schedule (no workouts after filtering/difficulty).
- Corrupt storage recovery (cleared/rebuilt state).
- Calendar disabled/flagged state.

## Error & Empty Handling
- No workouts match difficulty/filters → prompt to relax filters or auto-widen range.
- Storage parse error → warn, clear keys, regenerate schedule.
- Missing taxonomy → show retry and block generation until ready.
