# Mission Step Transition Event Contracts

## Scope
- Stage 10 Step 9.1.1 mission route transition contracts.
- Defines the contract table for all mission step transitions using `ia:tab_view`.

## Event Contract Table

| Event key | Transition group | Route target |
| --- | --- | --- |
| `ia:tab_view` | mission step transition | `/mission/brief` |
| `ia:tab_view` | mission step transition | `/mission/triage` |
| `ia:tab_view` | mission step transition | `/mission/case` |
| `ia:tab_view` | mission step transition | `/mission/signal` |
| `ia:tab_view` | mission step transition | `/mission/checklist` |
| `ia:tab_view` | mission step transition | `/mission/debrief` |

## Payload Fields per Event
- Required:
  - `data.tab`
  - `data.fromTab`
  - `data.toTab`
  - `data.transitionType` (`mission_step_transition`)
  - `data.source` (`tab`, `select`, `keyboard`, `palette`, `system`)
- Optional:
  - `data.operationId`
  - `data.caseId`
  - `data.signalId`
  - `data.actionId`

## Runtime References
- Contract model: `src/utils/missionTelemetryContracts.ts`
- Mission transition emissions: `src/pages/MissionFlow/MissionShell.tsx`
- Validator constraints: `scripts/validateTelemetryEvents.ts`
