# Routes Catalog

> Complete inventory of every route in Starcom Academy.

## v2 Shell Routes (Production Default)

The v2 shell (`shellV2: true`) uses `AppShell` with `BottomNav` as the primary navigation.

| Path | Component | Tab |
|---|---|---|
| `/` | Redirect → `/train` | — |
| `/train` | `TrainingSurface` | Train |
| `/train/quiz` | `QuizSurface` | Train |
| `/review` | `ReviewDashboard` | Review |
| `/progress` | `StatsSurface` | Progress |
| `/profile` | `ProfileSurface` | Profile |

## v1 Mission Shell Routes

The mission shell (`MissionShell`) is always mounted and accessible when Active Duty mode is enabled.

| Path | Component | Phase |
|---|---|---|
| `/mission` | `MissionEntryRedirect` | — |
| `/mission/brief` | `BriefSurface` | 1. Brief |
| `/mission/triage` | `TriageSurface` | 2. Triage |
| `/mission/case` | `CaseSurface` | 3. Case |
| `/mission/signal` | `SignalSurface` | 4. Signal |
| `/mission/checklist` | `ChecklistSurface` | 5. Checklist |
| `/mission/debrief` | `DebriefSurface` | 6. Debrief |
| `/mission/stats` | `StatsSurface` | — |
| `/mission/plan` | `PlanSurface` | — |
| `/mission/training` | `TrainingSurface` | — |
| `/mission/quiz` | `QuizSurface` | — |

## Legacy Redirect Routes

These paths existed in earlier versions and redirect to their v2 equivalents via `resolveLegacyAliasPath`.

| Legacy Path | Redirects To |
|---|---|
| `/home` | `/train` (v2) or `/mission/brief` (v1) |
| `/home/plan` | `/train` or `/mission/brief` |
| `/home/cards` | `/train` or `/mission/triage` |
| `/home/progress` | `/progress` or `/mission/case` |
| `/home/handler` | `/profile` or `/mission/signal` |
| `/home/settings` | `/profile` or `/mission/debrief` |
| `/schedules` | Resolved via `resolveLegacyAliasPath` |
| `/drills` | Resolved via `resolveLegacyAliasPath` |
| `/training` | Resolved via `resolveLegacyAliasPath` |
| `/training/run` | Resolved via `resolveLegacyAliasPath` |
| `/settings` | Resolved via `resolveLegacyAliasPath` |

## Special Routes

| Path | Component | Purpose |
|---|---|---|
| `/c/:slug` | `CardSlugRedirect` | Short-link redirect for shared training cards |
| `/share/:slug` | `CardSharePage` | Public card share view (renders card content without app chrome) |
| `*` | Catch-all redirect | Redirects any unknown path to the default root |

## Deep Link Parameters

Mission routes support query parameters for context restoration:

```
/mission/brief?op={operationId}&case={caseId}&signal={signalId}
/mission/triage?op={operationId}&case={caseId}&signal={signalId}
...
```

Card routes support source tracking:
```
/c/:slug?source={referrer}
```

Quiz routes support scoping:
```
/mission/quiz?deck={deckId}&module={moduleId}
/mission/quiz?mode=review    (SR-due cards only)
```

## Route Count Summary

| Category | Count |
|---|---|
| v2 shell routes | 5 |
| v1 mission routes | 11 |
| Legacy redirects | 11 |
| Special routes | 3 |
| **Total** | **30** |
