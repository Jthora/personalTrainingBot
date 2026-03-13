# UI Wireframes (Annotated)

## Workouts Page Header & Selector
- Header bar (minimal): chips for current schedule name/date, difficulty level/range, selection summary (counts + est. time), and a single alignment warning badge (only when misaligned).
- Controls row: primary “Generate & Start Session” CTA; secondary actions (Presets, filters, search, Preview drawer toggle) grouped/right-aligned to avoid crowding; “Save preset” optional and hidden by default.
- Preview drawer: ordered items (set/block), duration, focus tags; replace/shuffle/remove; alignment icons; cancel/close to avoid accidental apply.
- Empty state: CTA disabled; inline guidance with one recommended preset; skeleton for summary while loading.

## Workouts Sidebar
- Cards stack (limit visible cards):
    - Daily goal: progress bar with target/current (one daily only); unit toggle optional.
    - Weekly goal: progress bar with week window (one weekly only).
    - Streak chip: day count, freeze warning if skip/timeout risk.
    - XP/level meter: bar with current XP/next level threshold; badge strip truncated with +N.
    - Difficulty selector (collapsible by default): dropdown + range; “recommended range” hint.
- Challenges widget: active weekly and daily challenge with progress, reward XP, time remaining (one of each); hides if flagged off.

## Home Left Rail
- Coach Dialog: coach avatar/name, rotating prompt (rate-limited), badge strip (truncated), streak chip, XP chip, “Today’s focus” text; quick actions (Regenerate, Adjust difficulty, Manage selection, Open recap). Quiet mode toggle (Phase 4).
- Workout List: “Up Next” stack with actionable cards (start/resume). Each card shows duration/intensity/difficulty alignment icon, completion %, remaining time; secondary action (view details). Toggle for Upcoming vs Completed.

## Recap Modal
- Sections: XP gained (with breakdown), streak status (gain/freeze/break with reasoning), badges unlocked (icons + criteria), goals/challenges progress, suggested next steps (start next plan / adjust selection), share button (copy summary, flag-controlled).
- Visuals: celebratory state for badge unlocks (flagged/optional); neutral state for skips/timeouts with guidance.
- Controls: one primary CTA; dismiss is easy; no blocking core navigation.

## Additional States to Cover
- Loading (skeletons for chips/bars/cards), empty selection (guided CTA), alignment warning (highlight misaligned items), active session (now/next), completed schedule (prompt to generate next), challenge completed (confetti/celebrate strip).
