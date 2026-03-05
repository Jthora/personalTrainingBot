# Mission Milestones and Unlock Criteria

## Scope
- Stage 9 Step 8.3.3 milestone tiers and unlock prerequisites.
- Surfaces milestone progress in mission and home views.

## Milestone Tiers
- Tier I · Trainee (`score >= 0`)
- Tier II · Operator (`score >= 55`)
- Tier III · Specialist (`score >= 70` + signal-analysis threshold)
- Tier IV · Mission Lead (`score >= 85` + artifact-traceability threshold + improving debrief trend)

## Unlock Prerequisites
- Tier II: readiness score at least 55.
- Tier III: readiness score at least 70, signal analysis competency at least 65, and at least one debrief outcome.
- Tier IV: readiness score at least 85, artifact traceability competency at least 70, and improving debrief trend.

## Runtime Surfaces
- Home surface: readiness panel shows current tier, percent progress, and next unlock hint.
- Mission surface: mission header metric row shows tier label and progress percentage.

## Implementation
- Milestone model: `src/utils/readiness/milestones.ts`
- Readiness integration: `src/utils/readiness/model.ts`
- Home view surface: `src/components/Readiness/ReadinessPanel.tsx`
- Mission view surface: `src/components/MissionHeader/MissionHeader.tsx`
