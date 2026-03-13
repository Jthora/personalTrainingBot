# Archive

Historical documentation from previous design phases. These docs are **superseded** by the current mission-flow architecture and the [refined approach](../roadmap/refined-approach.md), but preserved for design-intent reference.

## Contents

| Directory / File | Era | What It Documented |
|-----------------|-----|--------------------|
| `homepage-refactor/` | Pre-mission-flow | Homepage redesign splitting Plan/Cards/Progress/Coach into sub-nav routes. Replaced by MissionShell. |
| `loading-audit/` | Pre-mission-flow | Loading pipeline audit + 14-file refactor plan. Superseded by current build/cache architecture. |
| `workouts-page-redesign/` | Pre-mission-flow | First workouts page overhaul (17 files). "Workouts" concept replaced by "drills". |
| `workouts-page-redesign-v2/` | Pre-mission-flow | Second iteration of workouts page (9 files). Also superseded. |
| `gamified-progress-upgrade/` | Pre-mission-flow | Gamification design (XP, badges, streaks). **Concepts were adopted** into `UserProgressStore` — these docs record the original design intent. |
| `workouts-overhaul/` | Pre-mission-flow | Schedule generation, persistence, custom schedules. Replaced by drill/mission scheduling. |
| `CLEANUP_SUMMARY.md` | July 2025 | Records a cleanup session: directory audit, linting, dead code removal. |
| `workout-audit.md` | Nov 2025 | Parameter order bug, bulk-action sync issue, selection rehydration gap. Some issues may be resolved. |

## Why Keep These?

These docs record *why* certain design decisions were made, even though the implementation has moved on. When the current architecture faces similar problems (and it will), this history avoids re-learning old lessons.
