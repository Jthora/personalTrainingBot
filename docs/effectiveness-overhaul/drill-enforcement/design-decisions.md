# Drill Enforcement — Design Decisions

These are UX questions that need answers before writing code. Each has a recommended
approach, but they represent real tradeoffs that affect user experience.

---

## Decision 1: What counts as "engaged enough" to unlock a checkbox?

### Options

| Level | Requirement | Pros | Cons |
|-------|-------------|------|------|
| **A. Panel opened** | Card content expanded at least once | Minimal friction, easy to implement | User can open-and-immediately-close |
| **B. Scroll-to-bottom** | Content panel scrolled to end | Proves visual exposure | Annoying for short cards, hard to detect reliably |
| **C. Exercise attempted** | At least one exercise reveal/interaction | Forces meaningful engagement | Blocks users who genuinely know the material |
| **D. Time threshold** | Step open for ≥ N seconds | Approximates reading time | Punishes fast readers, feels arbitrary |

### Recommendation: **A (Panel opened)** for v1

Start with the lowest-friction gate. The default-expanded change means users see
content without any extra action — the gate only matters if they collapse and try to
check without re-expanding. Upgrade to C in a future iteration if data shows users
are still gaming completions.

---

## Decision 2: What's the minimum engagement time threshold?

### Options

| Formula | Example (8 steps) | Rationale |
|---------|-------------------|-----------|
| `steps × 10s` | 80 seconds | Very lenient — catches only the most egregious speed-runs |
| `steps × 15s` | 120 seconds | Moderate — assumes 15 seconds to scan each card |
| `steps × 30s` | 240 seconds | Strict — assumes reading + exercise interaction |
| No threshold | — | Engagement is already gated by expansion/assessment |

### Recommendation: **`steps × 15s`**

This catches the "tap all checkboxes in 5 seconds" case without punishing users who
have seen the material before and are doing a genuine quick review. The warning prompt
is a speed bump, not a hard block — users can still proceed after acknowledging.

---

## Decision 3: Should there be a "mastery fast-path"?

If someone genuinely knows the material, forcing them through a slow drill is punishing
expertise. Options:

| Approach | Description |
|----------|-------------|
| **No fast-path** | Everyone goes through the same flow. Simple, but frustrating for advanced users. |
| **Quiz-gated skip** | Take a quiz first; if score ≥ 80%, mark the drill complete without step-by-step. |
| **Self-reported mastery** | "I already know this" button records a mastery claim, but at lower SR quality (2 instead of 4-5). This means the card comes back sooner for verification. |
| **Adaptive pacing** | Steps auto-collapse for cards with high SR scores; expand for weak/new cards. |

### Recommendation: **Self-reported mastery** for v1, **adaptive pacing** for v2

Self-reported mastery is cheap to implement (one button, lower SR quality) and
honest about the tradeoff: skip the drill, but the system will test you sooner.
Adaptive pacing is the ideal end-state but requires per-card SR score lookups
during drill rendering, which is more complex.

---

## Decision 4: What happens when a user tries to leave mid-drill?

Currently: Nothing. The drill state persists in `DrillRunStore` and the user can
return later. The timer keeps running.

### Options

| Approach | Description |
|----------|-------------|
| **Do nothing** (current) | Drill persists, timer tracks total wall-clock time. |
| **Pause on leave** | Auto-pause timer when navigating away. Resume on return. |
| **Warn on leave** | "You have an active drill — pause or abandon?" |
| **Auto-abandon after N minutes** | If user doesn't return within 30 minutes, clear the drill. |

### Recommendation: **Pause on leave**

The timer is a stopwatch, not a countdown — it measures engagement time. Measuring
wall-clock time (including bathroom breaks) produces bad data. Auto-pause on route
change, auto-resume on return. This is a `useEffect` cleanup function in DrillRunner
watching `location.pathname`.

---

## Decision 5: How to handle existing drill history?

Users already have drill completions recorded without self-assessment (the field is
`undefined` in `DrillHistoryStore`). Making assessment required means:

| Approach | Description |
|----------|-------------|
| **Ignore legacy** | Old records keep `undefined` assessment. Stats show "N/A" for old drills. New drills require it. |
| **Backfill with default** | Set all legacy assessments to 3 (neutral). Stats are consistent but contain fabricated data. |
| **Display separately** | Show "pre-enforcement" and "post-enforcement" periods in stats. |

### Recommendation: **Ignore legacy**

The assessment data for old drills was meaningless anyway (it was optional and mostly
skipped). Don't fabricate data. The stats surface already handles `undefined` assessment
gracefully (`avgAssessment != null` guard in `DrillHistoryStore.statsForDrill()`).

---

## Decision 6: Should drill-level SR quality remain or switch to per-card?

Currently, all cards in a drill receive the same SR quality score. The audit identified
this as "coarse."

| Approach | Description |
|----------|-------------|
| **Keep drill-level** | All cards get the self-assessment rating. Simple, but a 5-rating on a drill where you struggled with 2 cards over-rates those cards. |
| **Per-card from interactions** | Each card gets quality derived from: was it expanded, were exercises attempted, time spent. Accurate but complex. |
| **Hybrid** | Base = self-assessment, adjust ±1 per card based on interaction signals. |

### Recommendation: **Hybrid**

The self-assessment is a useful baseline signal — "how hard was this drill overall?"
Adjust per-card: cards where exercises were attempted get +0 (baseline). Cards where
content was not expanded or exercises were skipped get -1. Cards where the user spent
significant time get +0 (no bonus for being slow). This gives a 3-point spread
(assessment-1 to assessment+0) without being overly complex.
