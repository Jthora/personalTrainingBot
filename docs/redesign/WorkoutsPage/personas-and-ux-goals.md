# Personas and UX Goals

## Primary Personas
- **Time-pressed athlete**
	- Goals: Find a suitable workout fast, adjust duration/intensity, add to schedule.
	- Context: Mobile on-the-go; sometimes desktop at work; limited time windows.
	- Constraints: Unstable network; one-handed use; prefers defaults that “just work.”
	- Success signals: <2 minutes to schedule; minimal taps; clear confirmation.
- **Planner/organizer**
	- Goals: Build a weekly plan, compare options, ensure balanced load and recovery.
	- Context: Desktop/tablet; evenings; higher tolerance for detail.
	- Constraints: Needs visibility of volume/intensity; wants batch operations.
	- Success signals: Can assemble week in <10 minutes; confident with preview data.
- **New trainee**
	- Goals: Discover beginner-friendly workouts, avoid injury, follow guidance.
	- Context: Mobile; may have accessibility needs; needs clear labeling.
	- Constraints: Low familiarity with terms; needs reassurance and coach cues.
	- Success signals: Finds “safe” workout quickly; understands requirements and steps.

## Secondary Personas
- **Coach/mentor**
	- Goals: Recommend workouts, share links, ensure trainee adherence.
	- Needs: Easy sharing/export; clarity on prerequisites and equipment.
- **Returning user**
	- Goals: Re-run favorites; adjust minor parameters; track changes.
	- Needs: History, quick actions, confidence nothing major changed unexpectedly.

## Anti-Personas (Explicit Exclusions)
- Bulk data administrators; A/B experimenters altering content library (not supported here).
- Power users needing CSV exports or API-level access (handled elsewhere if ever).

## Scenarios & Top Tasks
- Find a workout matching time, intensity, equipment, and goal.
- Filter/sort by duration, difficulty, equipment, coach, category.
- Preview details (steps, required equipment, estimated effort) before scheduling.
- Add workout to a specific day/time; adjust or remove it later.
- View alternatives if a workout is unavailable or too hard.
- Recover from errors or offline/slow network gracefully.

## Contexts of Use
- Mobile with intermittent connectivity; small screens; thumb reach considerations.
- Desktop with larger screens; multitasking; side-by-side layouts.
- Tablet in the gym; potential glare; need high contrast and large tap targets.

## Pain Points (Current)
- Hard to scan lists; visual clutter and inconsistent spacing.
- Filters unclear or buried; no immediate feedback on applied filters.
- Preview/details not aligned with Training/Schedules UX; cognitive dissonance.
- Poor empty/error states; users get stuck without guidance.
- Keyboard and screen reader paths incomplete or missing focus indicators.

## Opportunities
- Clear, coach-themed hierarchy that matches Home/Training/Schedules.
- Inline feedback for filters and selections; visible applied filters.
- Strong empty/loading/error patterns that keep users moving forward.
- Faster selection with better defaults and recent/favorites surfacing.
- Accessible patterns: focus rings, ARIA labels, consistent headings/landmarks.

## UX Principles (Guiding)
- Clarity: Make state and next actions obvious; show applied filters and selections.
- Speed: Minimize steps to schedule; reduce context switches; keep interactions snappy.
- Progressive disclosure: Show essentials first; reveal detail on intent.
- Consistency: Align with coach themes and patterns used in adjacent pages.
- Accessibility-first: Keyboard parity, contrast, focus visibility, SR-friendly semantics.
- Forgiveness: Easy undo/confirm patterns; clear recovery for errors and slow states.

## Accessibility & Inclusivity Considerations
- Keyboard-only workflows for all core tasks.
- Clear focus states and logical tab order across sidebar and main content.
- High-contrast text and controls; avoid color-only indicators.
- Descriptive labels for screen readers on list items, filters, and actions.
- Support reduced motion; avoid auto-playing animations.
- Large tap targets for touch; spacing to prevent accidental taps.

## Success Metrics (UX/Behavioral)
- Task completion time (find + schedule) improves by ≥25% vs current baseline.
- Drop-off/abandonment on key flows reduced; track funnel.
- Error encounter rate (user-visible) <1% of sessions.
- Keyboard path completion without mouse ≥95% success on tested flows.
- CSAT/quick-pulse ratings for Workouts meet/exceed target.
- Increased repeat usage (return rate) and “add to schedule” completions per user.

## Measurement Plan
- Instrument telemetry events for filter apply/clear, selection, preview open, add/remove.
- Capture latency for data load and interaction; alert on regressions.
- Run moderated/unmoderated usability tests for primary personas across devices.
- Track accessibility checks (axe, manual SR) and log issues/closures.

## Open Questions (to be resolved)
- Do we need personalization (recent/favorites) in MVP or phase 2?
- Are coach tips inline or via a helper component? What’s the scope?
- Any constraints on schedule editing frequency or conflicts we must expose?

## Acceptance Signals per Persona
- Time-pressed athlete: Can schedule within 3 taps/clicks after filtering.
- Planner: Can see a week context and batch-add without losing state.
- New trainee: Can identify “beginner-safe” workouts without jargon or surprises.
