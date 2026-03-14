# Shell v2 Telemetry Continuity Guide

> Reference for analytics teams: how dashboard queries should be updated when
> AppShell v2 rolls out to production.

## Route Path Changes

| Old path (MissionShell v1) | New path (AppShell v2) | Notes |
|---|---|---|
| `/mission/training` | `/train` | Primary training surface |
| `/mission/checklist` | `/train` | Drill-run context within training |
| `/mission/plan` | `/train` | Plan surface merged into train tab |
| `/mission/brief` | `/train` | Brief surface merged into train tab |
| `/mission/triage` | `/train` | Triage merged into train tab |
| `/mission/case` | `/train` | Case merged into train tab |
| `/mission/signal` | `/review` | SR review surface (new tab) |
| `/mission/stats` | `/progress` | Progress/stats surface (new tab) |
| `/mission/debrief` | `/profile` | Profile/settings surface (new tab) |
| `/mission/quiz` | `/train` (with `?mode=*`) | Quiz surfaces kept under train |

## Telemetry Event Changes

### New event: `tab_view`

Fired when user switches tabs in AppShell v2.

```json
{
  "category": "navigation",
  "action": "tab_view",
  "data": {
    "tab": "/train",
    "shell": "v2"
  }
}
```

### New event: `app_tab_transition`

Fired via `buildAppTransitionPayload()` in `missionTelemetryContracts.ts`.

```json
{
  "category": "navigation",
  "action": "navigate",
  "data": {
    "tab": "/review",
    "fromTab": "/train",
    "toTab": "/review",
    "transitionType": "app_tab_transition",
    "source": "bottom_nav",
    "shell": "v2"
  }
}
```

### Shell marker

All v2 events include `"shell": "v2"` in their data payload. Use this to
segment dashboards during rollout:

```sql
-- v1 only
WHERE data->>'shell' IS NULL OR data->>'shell' != 'v2'

-- v2 only
WHERE data->>'shell' = 'v2'
```

## Rollout Timeline

| Date | Action | Flag state |
|---|---|---|
| Rollout start | Enable `shellV2` in staging | `staging: true` |
| +1 week | Enable for 10% production | Feature flag % rollout |
| +2 weeks | Full production rollout | `production: true` |
| +4 weeks | Remove flag, delete MissionShell | All configs: removed |

## Dashboard Migration Checklist

- [ ] Add `shell` dimension to path-based queries
- [ ] Create v2-specific dashboards for `/train`, `/review`, `/progress`, `/profile`
- [ ] Map old mission step funnels to v2 tab-switch funnels
- [ ] Verify `app_tab_transition` events appear in staging
- [ ] Update alerting thresholds for new route names
