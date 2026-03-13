# Vision

## Purpose & North Star
- Deliver a true-to-spirit personal training experience that feels coach-led, adaptive, and motivating through gamification.
- Balance guidance (coach cues, recommended plans, difficulty-aware suggestions) with user agency (custom selection, presets, quick start).
- Keep friction low: fastest path from selection → schedule → session, with feedback loops (recap, rewards, goals).

## Success Criteria (behavioral & qualitative)
- Primary: weekly active sessions (WAS) and streak retention (3/7/14-day) improve while empty-schedule states drop.
- Secondary: session start latency (selection → start) remains low (<3 clicks/15s); users see immediate, meaningful feedback after actions (XP, badges, recap, next best action).
- Reduced confusion: users always know what’s next (Today’s plan + active session indicators).

## In Scope (initial waves)
- Client-side progress: streaks, XP/levels, badges, daily/weekly goals (one daily + one weekly), challenges (one daily + one weekly), all localStorage-backed.
- Guidance layers: Today’s plan, smart schedule generation, difficulty alignment prompts, presets/filters.
- UI enhancements: Workouts page header/selector, sidebar goals/challenges, Home left rail (coach, progress, badges), recap modal.
- Feature flags for safe rollout of challenges/recap/badge strip; prioritize fast-start flow before deeper layers.

## Out of Scope (for now)
- Server-side leaderboards, social competition, or friend graphs.
- Wearables/device integrations and live biometrics.
- Multi-user accounts or shared schedules.
- Cloud sync of progress (local-only in this phase).

## Personas & Scenarios
- Newcomer: needs quick wins, preset-based start, and reassurance on difficulty fit.
- Returning on a streak: motivated by streak/XP; wants fast resume and gentle streak protection.
- Time-crunched: wants short “Quick 20” plans, clear time estimates, and minimal clicks.
- Advanced athlete: wants difficulty alignment, focused blocks (e.g., strength/cardio), and ability to swap/adjust quickly.

## Constraints & Assumptions
- Persistence via localStorage; must degrade gracefully if unavailable.
- Existing models: `WorkoutSchedule`, `WorkoutCategoryCache`, `DifficultySettingsStore`; we add `UserProgressStore` client-side.
- No backend required initially; telemetry optional/future. Feature flags control exposure.
- Must remain responsive on low-spec devices; avoid heavy recompute of selection summaries; keep core flows under 3 clicks from selection to start.
