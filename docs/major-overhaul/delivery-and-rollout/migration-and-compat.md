# Migration and Compatibility

## Routing
- Canonical IA is mission-first: `/mission/brief`, `/mission/triage`, `/mission/case`, `/mission/signal`, `/mission/checklist`, `/mission/debrief`.
- Legacy and transitional route families are compatibility redirects only.

### Home-route compatibility redirect map
| Transitional route | Mission canonical target |
| --- | --- |
| `/home` | `/mission/brief` |
| `/home/plan` | `/mission/brief` |
| `/home/cards` | `/mission/triage` |
| `/home/progress` | `/mission/case` |
| `/home/coach` | `/mission/signal` |
| `/home/settings` | `/mission/debrief` |

### Compatibility rules
- Mission routes are always canonical and user-facing.
- `/home/*` and obsolete workout-centric aliases remain available only as compatibility redirects.
- Product UI must not present `/home/*` IA labels as primary navigation.

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
