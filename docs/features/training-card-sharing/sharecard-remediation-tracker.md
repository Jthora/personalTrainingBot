# ShareCard Remediation Progress Tracker

Use this tracker to coordinate the remediation workstreams outlined in `sharecard-remediation-plan.md`. Update at least twice weekly.

Legend: [ ] not-started · [~] in-progress · [x] done · [!] blocked

---

## Phase A — Terminology & Formatter
_Target window: 2025-10-01 → 2025-10-07_

| Task | Status | Owner | Notes |
| --- | --- | --- | --- |
| Update modal copy to "Post" / "X composer" terminology | [ ] |  |  |
| Swap intent URL to `https://x.com/i/compose/post` with encoded payload | [ ] |  |  |
| Ensure ShareCard footer always displays branded short URL | [ ] |  |  |
| Implement multiline bullet formatting & blank line before URL | [ ] |  |  |
| Refine sanitization to preserve parentheses/backslashes | [ ] |  |  |
| Expand `shareSummary` unit tests for multiline & emoji cases | [ ] |  |  |

## Phase B — Modal UX & Accessibility
_Target window: 2025-10-08 → 2025-10-14_

| Task | Status | Owner | Notes |
| --- | --- | --- | --- |
| Re-tier modal actions (primary vs secondary) | [ ] |  |  |
| Enable editable summary with live character counter | [ ] |  |  |
| Implement responsive/mobile layout adjustments | [ ] |  |  |
| Detect clipboard capabilities & disable unsupported buttons | [ ] |  |  |
| Add focus trap + visible focus states | [ ] |  |  |
| Introduce `aria-live` status announcements & keyboard shortcuts | [ ] |  |  |

## Phase C — Capture Reliability & Telemetry
_Target window: 2025-10-15 → 2025-10-21_

| Task | Status | Owner | Notes |
| --- | --- | --- | --- |
| Wait for KaTeX render completion before capture | [ ] |  |  |
| Default downloads to PNG, make WebP secondary | [ ] |  |  |
| Provide fallback guidance when clipboard image copy fails | [ ] |  |  |
| Instrument capture performance timings | [ ] |  |  |
| Log share action success/failure telemetry | [ ] |  |  |
| Author tooltip / guidance experiment (optional) | [ ] |  |  |

## Phase D — QA, Docs, Rollout
_Target window: 2025-10-22 → 2025-10-28_

| Task | Status | Owner | Notes |
| --- | --- | --- | --- |
| Playwright E2E for edit/share/capture flow | [ ] |  |  |
| Mobile Safari / Chrome manual validation checklist | [ ] |  |  |
| Accessibility audit sign-off | [ ] |  |  |
| Update `sharecard-ux-spec.md` & release notes | [ ] |  |  |
| Enable feature flag for beta cohort & gather feedback | [ ] |  |  |
| Telemetry review after 7 & 14 days, decide on full rollout | [ ] |  |  |

---

## Decision Log
| Date | Decision | Owner | Notes |
| --- | --- | --- | --- |
|  |  |  |  |

## Risks & Mitigations
| Risk | Impact | Mitigation | Status |
| --- | --- | --- | --- |
| KaTeX readiness observer adds noticeable delay | Medium | Benchmark render wait, cap timeout at 500 ms, allow manual override | [ ] |
| Clipboard restrictions on iOS degrade experience | High | Provide long-press guidance + auto-download fallback | [ ] |

## Update History
- _2025-10-01_ — Tracker created; awaiting task assignment.
