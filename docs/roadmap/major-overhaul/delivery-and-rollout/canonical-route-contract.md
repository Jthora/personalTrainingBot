# Canonical Route Contract (Mission-First)

## Product IA (user-facing)
Only the mission route family is user-facing:

- `/mission/brief`
- `/mission/triage`
- `/mission/case`
- `/mission/signal`
- `/mission/checklist`
- `/mission/debrief`

## Compatibility routes (redirect-only)
These routes are not product navigation and must not be presented as primary IA labels.

### Home-era route compatibility
| Route | Redirect target |
| --- | --- |
| `/home` | `/mission/brief` |
| `/home/plan` | `/mission/brief` |
| `/home/cards` | `/mission/triage` |
| `/home/progress` | `/mission/case` |
| `/home/coach` | `/mission/signal` |
| `/home/settings` | `/mission/debrief` |

### Retired workout aliases
| Route | Redirect target |
| --- | --- |
| `/schedules` | `/mission/brief` |
| `/workouts` | `/mission/triage` |
| `/training` | `/mission/checklist` |
| `/training/run` | `/mission/checklist` |
| `/settings` | `/mission/debrief` |

## Navigation hierarchy
- Global/top-level route navigation: mission flow steps only (`Brief`, `Triage`, `Case`, `Signal`, `Checklist`, `Debrief`).
- In-surface navigation: contextual actions and step-local tools only (never alternate route taxonomies).

## Non-negotiable UX constraints
- No page may render both mission-flow primary nav and home-era route nav taxonomy.
- Mission labels must map 1:1 to mission route paths and mission surfaces.
- Compatibility redirects must preserve deep-link continuity silently.
