# Scenario 03: Mission Commander

> Persona: `active-commander` — Active Duty enabled. 15 drills, level 4, 7-day streak. Has signals and AARs.

## Purpose

Validates the full 6-phase mission operational loop with Active Duty mode. Tests the advanced mission workflow that transforms the training app into an operational command console.

## Preconditions

- Full profile: archetype set, handler set, Active Duty enabled
- Level 4, XP 2100, 7-day streak, 15 drills in history
- 3 signals pre-seeded (1 open, 1 acknowledged, 1 resolved)
- 2 AARs pre-seeded
- Triage preferences: columns view, cozy density
- Mission step checkpoints seeded (some phases marked complete)
- Mobile viewport: 390×844

## Steps

| # | Step | Action | Assertions |
|---|---|---|---|
| 1 | **v2 shell with mission tabs** | Navigate to `/train` | BottomNav shows 4 primary tabs + mission tabs (Brief, Triage, Case, Signal, Debrief) because Active Duty is enabled. |
| 2 | **Navigate to Brief** | Click Brief tab | BriefSurface renders: TodayLauncher, WeeklySummary, ReadinessPanel, MissionKitPanel, TimelineBand. MissionStepHandoff CTA visible. |
| 3 | **Brief content check** | Inspect brief components | Personalized kit reflects archetype weighting. Readiness panel shows meaningful data. |
| 4 | **Handoff → Triage** | Click "Proceed to Triage" CTA | TriageSurface renders. TriageBoard visible in columns view, cozy density (per seeded preferences). |
| 5 | **Toggle triage preferences** | Switch density: cozy → compact | Layout reflows to compact density. All items still visible, no overflow. |
| 6 | **Switch view mode** | Switch columns → feed | Layout changes from column board to feed list. Items preserved. |
| 7 | **Process triage item — acknowledge** | Click acknowledge on an open item | Item status updates to "acknowledged". Visual indicator changes. |
| 8 | **Process triage item — escalate** | Click escalate on another item | Item status updates to "escalated". |
| 9 | **Process triage item — defer** | Click defer on another item | Item status updates to "deferred". |
| 10 | **Handoff → Case** | Click "Proceed to Case Analysis" | CaseSurface renders. ArtifactList visible with items. |
| 11 | **Review artifact** | Click an artifact | Detail view opens. "Mark reviewed" and "Promote" buttons visible. |
| 12 | **Mark reviewed + promote** | Click both action buttons | Artifact shows reviewed state and promoted badge. |
| 13 | **Handoff → Signal** | Click "Proceed to Signal Operations" | SignalSurface renders. Signal form visible. Existing signals listed (3 seeded). |
| 14 | **Create signal** | Fill title "Contact Report Alpha", description "Anomalous network activity detected", select role, submit | New signal appears in list with "open" status. Total now 4 signals. |
| 15 | **Signal lifecycle — acknowledge** | Click acknowledge on new signal | Status changes to "acknowledged". |
| 16 | **Signal lifecycle — resolve** | Click resolve | Status changes to "resolved". |
| 17 | **Navigate to Debrief** | Click Debrief tab | DebriefSurface renders. DebriefClosureSummary visible. AAR section shows 2 pre-seeded AARs. |
| 18 | **Write AAR** | Click "New AAR", fill all fields (title, context, actions, outcomes, lessons, follow-ups), save | AAR appears in list. Total now 3 AARs. All fields persisted. |
| 19 | **Check step-complete indicators** | Inspect mission tab indicators | Phases visited during this session show completion checkmarks. |

## Accessibility Audit Points

- After step 2 (brief surface) — complex dashboard layout
- After step 4 (triage surface) — interactive board with actions
- After step 13 (signal surface) — form + list combo
- After step 17 (debrief surface) — AAR entry form

## Expected Screenshots

19 screenshots covering every mission phase transition and interaction.

## Key Risks

- Active Duty toggle not persisting (mission tabs missing)
- Triage preference switches causing layout reflow bugs
- Triage actions (ack/escalate/defer) not updating item status
- Signal form submission creating duplicate or malformed entries
- Signal lifecycle transitions (open→ack→resolved) not reflecting in UI
- AAR form losing data on save
- Step-complete indicators not tracking visited phases
- MissionStepHandoff CTAs navigating to wrong phase
