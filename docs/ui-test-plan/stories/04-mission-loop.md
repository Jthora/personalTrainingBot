# Story 4: The Mission Loop

> *The 6-step mission cycle — Brief → Triage → Case → Signal → Checklist → Debrief — is not a navigation feature. It is doctrine. It mirrors the operational workflow the Earth Alliance will eventually execute across the ecosystem. If this loop feels broken or confusing, the entire training methodology collapses.*

## The Promise

The mission cycle is coherent, complete, and closes cleanly. Each step tells the operative WHY it matters, WHAT it requires, and WHEN they're ready to proceed. The cycle ends with structured reflection and restarts with intention.

## Emotional Arc

| Stage | What the user sees | What they should feel |
|-------|--------------------|-----------------------|
| Brief | "Why this step matters" — establishing operational intent | Focused — mission is framed |
| Triage | Priority assessment, signal sorting | Analytical — processing information |
| Case | Evidence and artifact work | Investigative — building a picture |
| Signal | Broadcasting findings, filling signal form | Active — contributing intelligence |
| Checklist | Action items, drill execution | Executing — doing the work |
| Debrief | After-action review, lessons learned | Reflective — closing the loop |
| Cycle restart | "Start Next Mission Brief" | Disciplined — the loop repeats |

## Preconditions

- **Persona:** `psi-operative` (full profile, no step-complete history)
- **Seed:** Mission flow context (operation ID, case ID, signal ID)
- **Starting URL:** `/mission/brief`

## Navigation Model — Two CTA Systems

Each mission step has **two** forward-navigation buttons. Tests must distinguish them:

| System | Template | Example from Brief | Source |
|--------|----------|--------------------|--------|
| **Shell tab-bar button** | `Continue to {tabLabel}` | `Continue to Triage` | MissionShell bottom bar — uses short tab label |
| **Handoff CTA** | Varies per surface | `Proceed to Triage` | MissionStepHandoff card — uses doctrine-specific label |

### Handoff CTA labels (exact strings from source)

| Surface | Handoff CTA label |
|---------|-------------------|
| BriefSurface | `Proceed to Triage` |
| TriageSurface | `Proceed to Case Analysis` |
| CaseSurface | `Proceed to Signal Operations` |
| SignalSurface | `Proceed to Action Checklist` |
| ChecklistSurface | `Proceed to Debrief` |
| DebriefSurface | `Start Next Mission Brief` |

The **handoff CTAs** follow doctrine order and carry operational intent. The **shell buttons** follow tab-bar order. This story tests via handoff CTAs because they represent the doctrine contract.

## Test Checkpoints

### 4.1 — Brief surface renders with step handoff

```
Navigate to /mission/brief (with mission context query params)
EXPECT visible: "Current Step:" with Brief step info
EXPECT visible: "Next Step:" with Triage step info
EXPECT visible: "Why this step matters" section
EXPECT visible: "Inputs required" section
EXPECT visible: "Ready-to-proceed criteria" section
EXPECT visible: handoff CTA "Proceed to Triage"
EXPECT visible: shell button "Continue to Triage"
```

**Why this matters:** The handoff sections are what make this a *doctrine* cycle rather than just tabs. Without them, it's just a multi-step form. Both navigation buttons must be present.

### 4.2 — Brief → Triage transition (via handoff CTA)

```
CLICK: "Mark Step Complete" or "✓ Step Complete"
CLICK: "Proceed to Triage" (handoff CTA)
EXPECT URL: /mission/triage
EXPECT visible: "Why this step matters" for Triage
```

### 4.3 — Triage → Case transition

```
CLICK: "Mark Step Complete" or "✓ Step Complete"
CLICK: "Proceed to Case Analysis" (handoff CTA)
EXPECT URL: /mission/case
EXPECT visible: "Inputs required" for Case
```

### 4.4 — Case → Signal transition

```
CLICK: "Mark Step Complete" or "✓ Step Complete"
CLICK: "Proceed to Signal Operations" (handoff CTA)
EXPECT URL: /mission/signal
```

### 4.5 — Signal form interaction

```
FILL: signal title input ("Scenario Signal")
FILL: signal detail textarea ("Generated during E2E mission loop test.")
CLICK: "Add signal"
CLICK: "Mark Step Complete" or "✓ Step Complete"
CLICK: "Proceed to Action Checklist" (handoff CTA)
EXPECT URL: /mission/checklist
```

**Why this matters:** Signal is the only step with a required form interaction. If the signal form breaks, operatives can't record intelligence.

### 4.6 — Checklist → Debrief transition

```
EXPECT visible: "Action Checklist" or checklist title
CLICK: "Mark Step Complete" or "✓ Step Complete"
CLICK: "Proceed to Debrief" (handoff CTA)
EXPECT URL: /mission/debrief
```

### 4.7 — Debrief has structured AAR and closure

```
EXPECT visible: "Closure Summary" or "After-Action Review"
EXPECT visible: "Save locally" button
EXPECT visible: "Export JSON" button
CLICK: "Save locally"
CLICK: "Export JSON"
```

### 4.8 — Cycle closes and can restart

```
EXPECT visible: "Start Next Mission Brief" or equivalent restart CTA
CLICK: restart CTA
EXPECT URL: /mission/brief
```

### 4.9 — Handler assistant card appears with in-character guidance

```
AT any mission step:
EXPECT visible: handler/assistant guidance card ("Operator Assistant" or similar)
```

**Why this matters:** The handler is the operative's mentor. If the assistant card vanishes during the cycle, the operative feels alone.

## Relationship to Existing Script

This story **complements** `scripts/runPsiOperativeScenario.ts`, which tests the same 6-step cycle with fast, minimal assertions (~5s). This story adds depth:

- Verification that handoff messaging renders at each step
- Both navigation mechanisms (shell tab button + handoff CTA)
- AAR interaction (save + export)
- Handler assistant card visibility
- Cycle restart

**Coexistence strategy:** Keep the existing script as a fast CI smoke gate (~5s). This story runs as a deeper verification (~30–40s). Retire the existing script only if it becomes a maintenance burden AND this story has been green for 30+ CI runs.

## Failure Modes This Catches

| Failure | Impact |
|---------|--------|
| Step handoff sections empty or missing | Doctrine degrades to tabs — why each step matters is invisible |
| Step transition navigates wrong | Cycle order broken — triage before brief? |
| Signal form not interactive | Operatives can't record intelligence |
| AAR save/export broken | Debrief data is lost — lessons not captured |
| Cycle can't restart | Operatives stuck after debrief — no next loop |
| Handler card missing during cycle | Mentorship feels absent |

## Locator Reference

| Element | Locator Strategy |
|---------|------------------|
| Step badge | `getByText(/Current Step:/i)` |
| Next step | `getByText(/Next Step:/i)` |
| Why it matters | `getByText(/Why this step matters/i)` |
| Inputs required | `getByText(/Inputs required/i)` |
| Mark complete | `getByRole('button', { name: /Mark Step Complete|✓ Step Complete/i })` |
| Handoff CTA | `getByRole('button', { name: /Proceed to Triage/i })` (varies per surface — see table above) |
| Shell tab button | `getByRole('button', { name: /Continue to Triage/i })` (uses short tab label) |
| Signal title input | `locator('input[placeholder="Signal title"]')` |
| Signal detail textarea | `locator('textarea[placeholder*="What changed"]')` |
| Save locally | `getByRole('button', { name: /Save locally/i })` |
| Export JSON | `getByRole('button', { name: /Export JSON/i })` |

## Spec File

`e2e/flows/04-mission-loop.spec.ts`

## Estimated Duration

~30–40 seconds (full 6-step cycle with interactions)
