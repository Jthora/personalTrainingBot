# Drill Schema

## Fields (draft)
- id (string)
- title (string)
- type (simulation, tabletop, rapid-response)
- difficulty (enum)
- duration (minutes)
- steps (ordered list with text; optional media refs)
- success_criteria (list)
- failure_modes (list)
- telemetry (events to emit)
- cacheable (bool), assets (with size/budget)
- prerequisites (skills/tools)
- readiness_effect (delta, decay)

## Notes
- Steps must degrade gracefully offline; avoid media dependence.
- Keep telemetry names consistent with event taxonomy.
