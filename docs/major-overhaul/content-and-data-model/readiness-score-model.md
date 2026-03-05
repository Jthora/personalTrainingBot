# Readiness Score Model

## Inputs
- Recency of drills (time-decayed).
- Difficulty weighting.
- Completion quality (success/abort, step completion).
- Fatigue/alertness proxy (simple slider or cadence-based decay).
- Competency dimensions from mission actions (triage, signal analysis, artifact traceability, decision quality).

## Computation (draft)
- Base score range 0-100.
- Decay function over time since last drill; boost on completion with difficulty multiplier.
- Penalty on aborts; partial credit for partial steps if defined.
- Weighted blend: drill score `70%` + competency score `30%`.
- Competency weighting: triage `0.30`, signal analysis `0.28`, artifact traceability `0.24`, decision quality `0.18`.

## Outputs
- Displayed score.
- Recommended next two actions (drill suggestions, sync prompt).
- Confidence indicator if data is stale.

## Acceptance
- Runs locally on cached data; deterministic; documented formulas.
- Competency dimensions and mission action mapping are documented and implemented.
