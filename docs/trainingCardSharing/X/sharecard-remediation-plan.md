# ShareCard UX Remediation Plan

_Last updated: 2025-10-01_

## 1. Background
The initial X sharing experience shipped with working deep links, ShareCard capture, and summary generation, but a recent critique highlighted several gaps: terminology still references legacy "tweets", the modal clusters too many equal-weight actions, multiline formatting is hard to scan, KaTeX renders can be captured mid-transition, accessibility is limited, and telemetry is absent. This plan consolidates all remediation workstreams needed to polish the experience before broader release.

## 2. Objectives
- Align all copy and behavior with modern X terminology and composer flows.
- Reduce friction when composing, editing, and exporting share assets.
- Guarantee readable, properly formatted post text that stays within 280 characters.
- Harden image capture so math-heavy cards render crisply across browsers.
- Improve accessibility, error messaging, and keyboard support.
- Capture analytics to inform future iterations and confirm feature adoption.

## 3. Workstreams & Key Actions

| Workstream | Outcomes | Primary Tasks | Owners |
| --- | --- | --- | --- |
| Terminology & Platform Alignment | Cohesive branding, updated intent URLs, consistent short-link display. | Rename UI strings, swap intent endpoint to `https://x.com/i/compose/post`, ensure ShareCard footer always shows branded short URL. | Product + Frontend |
| Share Modal UX Improvements | Clear primary path, mobile-friendly layout, editable text. | Re-tier buttons, enable in-place editing with live counter, responsive layout, gate clipboard buttons when unsupported. | Frontend |
| Text Formatting & Content Rules | Posts render cleanly with bullets, URL, hashtags, and preserved punctuation. | Switch to newline-separated bullets, blank line before URL, refine sanitization, smarter hashtag placement, expand unit tests. | Frontend + QA |
| Image Capture Reliability | Stable KaTeX capture and sensible format options. | Observe KaTeX completion before capture, default to PNG with WebP secondary, provide copy fallback guidance, log capture performance. | Frontend |
| Accessibility & Error Handling | Modal passes keyboard and screen-reader checks. | Focus trap, visible focus states, `aria-live` status updates, keyboard shortcuts, structured error messages with retry guidance. | Frontend + Accessibility QA |
| Analytics & Telemetry | Insight into feature usage and failures. | Instrument share actions, emit success/failure metrics, review telemetry post-launch, experiment with guidance tooltip. | Frontend + Data |

## 4. Delivery Roadmap

### Phase A — Terminology & Formatter (Week 1)
- Update copy, intent URL, ShareCard footer handling.
- Implement multiline summary formatting + sanitization fixes.
- Extend unit tests (`shareSummary.test.ts`) for new cases.

### Phase B — Modal UX & Accessibility (Week 2)
- Rework button hierarchy, enable edits, add responsiveness.
- Integrate focus trap, keyboard shortcuts, `aria-live` feedback.
- Add clipboard capability detection and tooltips.

### Phase C — Capture Reliability & Telemetry (Week 3)
- Wait-for-ready KaTeX logic, capture fallbacks, PNG defaulting.
- Performance timers + analytics events + logging hooks.
- Mobile Safari validation and guidance copy.

### Phase D — QA, Docs, Rollout (Week 4)
- Playwright + manual QA sweeps, mobile parity checks.
- Documentation refresh and release notes.
- Feature flag ramp-up, telemetry review after 7 and 14 days.

## 5. Dependencies & Risks
- **Font & KaTeX readiness**: requires reliable detection; mitigation via mutation observer or explicit render promise.
- **Clipboard support variance**: plan for frequent failures on iOS/Safari; provide transparent fallbacks.
- **Telemetry pipeline**: ensure analytics events are supported in production build and privacy review is complete.

## 6. Testing Strategy
- Unit: Expand `shareSummary` coverage (multiline, emojis, edited text), add tests for button gating utilities.
- Integration: Playwright scenario covering edit → copy → intent open, plus capture verification.
- Manual: Accessibility audit (keyboard, screen readers), mobile device share flow, KaTeX-heavy cards visual pass.

## 7. Rollout & Communication
- Release behind feature flag for internal users; gather feedback via support channel.
- Document changes in `docs/trainingCardSharing/X/sharecard-ux-spec.md` and user-facing release notes.
- After telemetry review, remove flag and announce in changelog with example posts/screenshots.

## 8. Open Questions
- Do we allow user-defined hashtags beyond the automatic set?
- Should analytics differentiate between desktop and mobile interactions for the modal?
- Is auto-copying summary on modal open desirable or too aggressive?

Decisions on these questions should be tracked in the progress log once resolved.
