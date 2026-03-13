# Debrief Readiness Progression

## Scope
- Stage 9 Step 8.3.2 readiness progression from debrief outcomes.
- Defines formula constraints and runtime update behavior.

## Formula
- Per-outcome contribution:
  - `boundedDelta = clamp(readinessDelta, -10, 10)`
  - `ratingMultiplier = { insufficient: -1.0, adequate: 0.4, strong: 0.8, exceptional: 1.2 }`
  - `recencyWeight = { <=3d: 1.0, <=14d: 0.85, <=30d: 0.7, >30d: 0.55 }`
  - `outcomeContribution = boundedDelta * ratingMultiplier * recencyWeight`
- Aggregate constraints:
  - `totalDelta = clamp(sum(outcomeContribution), -12, 15)`
  - `finalReadiness = clamp(baseReadiness + totalDelta, 0, 100)`

## Runtime Behavior
- Debrief outcomes are treated as completion events for progression updates.
- Readiness computation applies progression whenever canonical debrief outcomes are present.
- Progression metadata surfaced for telemetry:
  - `appliedDelta`
  - `appliedOutcomes`
  - `trend` (`declining`, `stable`, `improving`)

## Implementation
- Formula + constraints: `src/utils/readiness/progressionModel.ts`
- Readiness integration: `src/utils/readiness/model.ts`
- Milestone tiers + unlocks: `docs/major-overhaul/content-and-data-model/mission-milestones-and-unlocks.md`
- UI wiring (canonical debrief outcomes):
  - `src/components/Readiness/ReadinessPanel.tsx`
  - `src/components/MissionHeader/MissionHeader.tsx`
