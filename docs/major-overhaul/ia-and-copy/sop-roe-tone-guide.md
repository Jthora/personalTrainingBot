# SOP/ROE Tone Guide for System Messaging

This guide standardizes system messaging for alerts, prompts, and guidance in mission surfaces.

## Intent
- Keep copy calm, precise, and operational.
- Reduce ambiguity under stress.
- Ensure every message includes a clear next action.

## SOP/ROE Principles
- Safety first: do not imply risky action without verification steps.
- Minimum necessary action: escalate only when evidence warrants.
- Traceability: prefer wording that supports audit/debrief records.
- Local-first reliability: be explicit when operating from cached/offline data.

## Message Patterns

### Alert Pattern
Format: **State + impact + next action**
- Example: `Mission context mismatch. Saved operation no longer exists. Reset to Mission Brief.`
- Example: `Sync required. 3 signal updates are queued locally. Reconnect to transmit.`

### Prompt Pattern
Format: **Imperative verb + object + expected outcome**
- Example: `Open Triage Board to select an active case.`
- Example: `Review mission plan conflict before forcing add.`

### Guidance Pattern
Format: **Condition + action + fallback**
- Example: `If drill metadata is unavailable, run cached steps and sync online when possible.`
- Example: `If no signal is selected, open Triage Board to continue analysis.`

## Preferred Vocabulary
- Use: mission, operation, case, signal, artifact, debrief, mission plan, drill, readiness, triage.
- Prefer: `Sync required`, `Ready`, `Offline, using cached intel` for status messaging.

## Avoid
- Dramatic or vague language (`critical failure`, `catastrophic`, `something went wrong` without action).
- Fitness/Web3 jargon in active mission routes.
- Multi-step paragraphs that hide the immediate next action.

## Review Checklist (SOP/ROE)
- [ ] Alert copy follows state/impact/action sequence.
- [ ] Prompt copy starts with an action verb and names the target surface.
- [ ] Guidance copy includes a fallback path for offline/cached conditions.
- [ ] Tone stays low-drama and operational.
- [ ] Terminology matches mission lexicon checklist.
