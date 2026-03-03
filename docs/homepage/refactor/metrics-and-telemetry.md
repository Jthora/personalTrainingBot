# Metrics and Telemetry

## Focused usefulness
- Track tab switches (which sections are actually used).
- Track Start/Resume from Plan and time-to-training from load.
- Track cardSlug opens (from /c/:slug) and whether focus succeeds.
- Track Regenerate plan usage.

## Perf guardrails
- Monitor LCP/TTI for Plan and Cards after refactor.
- Watch bundle size deltas for new tab shell.

## Reliability
- Log slug resolution failures and fallback rate.
- Log cache warm timing for CardProvider vs schedule load for Plan.
