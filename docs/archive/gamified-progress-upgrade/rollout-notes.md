# Rollout Notes

## Feature Flags
- Flags: recap modal, challenges, badge strip, alignment warnings, animations/confetti, share helper. Default off in production until validated.
- Gradual enablement: turn on chips/widgets first, then recap, then challenges/badges strip.
- Quiet mode toggle should always be available; flags should not disable quiet mode.

## Migration
- Initialize `UserProgressStore` with safe defaults; versioned key; migrate older keys if present.
- On parse failure, reset to defaults and log a warning (non-blocking).
- Do not block UI if storage fails; fall back to in-memory session progress.

## Fallbacks
- If progress store errors: hide streak/XP/badges UI, keep core scheduling functional; show light banner if needed.
- If selector summary fails: disable generate/start and show guidance; allow presets to re-enable.
- If feature flagged off: ensure UI elements are removed cleanly (no blank gaps).
- If quiet mode is on: suppress prompts/animations regardless of flags; keep chips/bars visible.

## Telemetry (optional/future)
- Log: session starts, completions, skips/timeouts, badge unlocks, challenge completions, recap opens, share actions.
- Use sampling to reduce noise; keep PII-free.

## Communication
- Patch notes: highlight streaks/XP/badges, goals/challenges, recap; emphasize data is local-only.
- In-app tip: where to find streak/XP and how to protect streaks (quick 10-min option).
