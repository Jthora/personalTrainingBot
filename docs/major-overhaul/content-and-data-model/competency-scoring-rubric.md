# Competency Scoring Rubric

## Scope
- Stage 9 Step 8.3.1 competency dimensions and weighted scoring rules.
- Maps mission actions to readiness competency inputs.

## Competency Dimensions and Weights
- `triage_execution`: `0.30`
- `signal_analysis`: `0.28`
- `artifact_traceability`: `0.24`
- `decision_quality`: `0.18`

## Mission Action Mapping
- `drill_start` → triage execution
- `step_complete` → decision quality
- `signal_ack`, `signal_resolve` → signal analysis
- `artifact_review`, `artifact_promote` → artifact traceability
- `drill_complete` → decision quality

## Runtime Implementation
- Model: `src/utils/readiness/competencyModel.ts`
- Readiness blend: `src/utils/readiness/model.ts`
- Validation: `src/utils/readiness/competencyModel.test.ts`

## Notes
- Weighted readiness score blends drill score and competency score (70/30).
- Scoring remains deterministic and local-only.
