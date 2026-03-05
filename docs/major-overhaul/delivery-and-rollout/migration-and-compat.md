# Migration and Compatibility

## Routing
- Map legacy Plan/Cards/Training to Mission Kit/Drills/Execute; maintain rewrites.

### Mission route fallback compatibility map
| Mission route | Disabled-state fallback |
| --- | --- |
| `/mission/brief` | `/home/plan` |
| `/mission/triage` | `/home/cards` |
| `/mission/case` | `/home/progress` |
| `/mission/signal` | `/home/coach` |
| `/mission/checklist` | `/home/cards` |
| `/mission/debrief` | `/home/settings` |

### Cutover compatibility rules
- `missionDefaultRoutes=false` keeps `/home/*` as canonical routes and treats `/mission/*` as opt-in surfaces.
- `missionDefaultRoutes=true` enables mission-first routing, but each mission surface can be rolled out independently.
- Disabled mission surfaces always redirect to `/home/*` equivalents to preserve deep-link continuity during staged rollout.

### Legacy route retirement (Stage 11 / Task 10.2.1)
Obsolete workout-centric aliases are now permanently mapped to mission routes to remove legacy IA dependencies:

| Obsolete route | Retirement target |
| --- | --- |
| `/schedules` | `/mission/brief` |
| `/workouts` | `/mission/triage` |
| `/training` | `/mission/checklist` |
| `/training/run` | `/mission/checklist` |
| `/settings` | `/mission/debrief` |

This mapping is now independent of `missionDefaultRoutes` so deep links converge on mission IA during retirement.

## Data
- Legacy workout data: hide or map to mission kits; document decision.
- Cache versioning to avoid stale assets after rename.

## Acceptance
- Redirect map documented; data handling choice recorded; tested in deep-link matrix.
