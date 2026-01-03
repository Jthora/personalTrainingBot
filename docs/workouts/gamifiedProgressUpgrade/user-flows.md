# User Flows

## Generate & Start Session
1) Select presets/filters/search or manual picks in the selector.
2) View selection summary (counts, est. time) + difficulty chip; warnings if misaligned (debounced); header stays minimal (chips + primary CTA).
3) Tap “Generate & Start” -> schedule is created with metadata (name/date) -> navigate to active session (Home left rail shows current item and progress).
4) If selection empty: CTA disabled with inline guidance to pick a preset (show one recommended option to reduce choice overload).

## In-Session (Complete/Skip/Timeout)
1) View current item (details, timer for blocks) with now/next indicators.
2) Actions:
	- Complete: mark item, award XP, update streak/badges/goals/challenges.
	- Skip/Timeout: apply reduced XP or none; apply streak freeze/penalty rules; advance.
3) UI refresh: chips/bars update, coach prompt fires (rate-limited to max one mid-session), sounds optional.

## Adjust Selection & Replan
1) Open preview drawer from header; reorder, replace with similar, or remove items; offer cancel to avoid accidental changes.
2) Apply preset/filter to adjust focus; rerun alignment checks (debounced).
3) Regenerate schedule; keep difficulty in mind; resume session from updated list.

## Post-Session Recap
1) Trigger when schedule completes or via user action from left rail.
2) Show XP gained, streak delta (gain/freeze/break), badges unlocked, goal/challenge progress, suggested next steps, share button (flagged); keep one primary CTA.
3) Offer “Start next plan” or “Adjust selection” shortcuts; allow quick close to avoid blocking.

## Challenges & Goals
1) View active daily/weekly challenge and goals in sidebar/coach dialog (only one daily + one weekly shown).
2) Completion/skip/timeout updates progress; completing challenge grants XP and may unlock a badge (grant once, mark claimed).
3) Weekly reset/rotation logic; daily challenges rotate; expired challenges drop from UI gracefully.

## Edge Cases & Recovery
- Empty selection: CTA disabled, preset suggestions shown.
- No storage: fall back to in-memory progress; hide reward UI if needed, log warning.
- Difficulty out-of-range: show alignment warning, offer swap/adjust-range, or accept with explicit confirm.
- Streak boundary (midnight): ensure date-based calc to avoid double-count or missed day.
