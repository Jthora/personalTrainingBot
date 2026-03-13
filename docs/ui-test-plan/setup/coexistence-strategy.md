# Script Coexistence Strategy

> *The existing 11 headless scripts are fast (~5s each), battle-tested, and already in CI. The new Playwright Test stories are slower (~30–90s each) and unproven. Don't kill what works to adopt what's shiny.*

## The Two Tiers

| Tier | Tool | Speed | Purpose |
|------|------|-------|---------|
| **Gate** | Existing Puppeteer/Playwright scripts (`smoke:headless`) | ~60s total for 11 scripts | Fast CI gate: deep-links, offline SW, payload budgets, encoding, telemetry |
| **Depth** | `@playwright/test` stories (`test:e2e`) | ~5–8 min for all stories | User promise verification: emotional arcs, SR round-trips, progression |

## CI Pipeline Order

```
npm run typecheck          # ~3s
npm run test               # ~15s (1,200 vitest unit tests)
npm run smoke:headless     # ~60s (11 existing scripts — KEEP)
npm run test:e2e           # ~5–8 min (new Playwright stories)
```

The existing `smoke:headless` scripts run BEFORE the E2E stories. If smoke fails, E2E doesn't run — saving 5+ minutes of CI time.

## Overlap Map

| Existing Script | Overlapping Story | Decision |
|-----------------|-------------------|----------|
| `runPsiOperativeScenario.ts` | Story 04 (Mission Loop) | **Keep both.** Script is a 5s smoke check. Story 04 is a 40s deep verification with AAR, handler card, and dual-CTA assertions. |
| `checkOfflineSW.ts` | Story 08 (Offline Operative) | **Keep both.** Script tests a single shard cache-hit. Story 08 tests full offline drill+quiz+routing. |
| `checkOfflineCriticalPath.ts` | Story 08 (Offline Operative) | **Keep both.** Script tests 7 routes render. Story 08 adds content verification + quiz + state persistence. |
| `checkOfflineRecovery.ts` | Story 08 (Offline Operative) | **Keep both.** Script tests cache corruption + recovery. Story 08 doesn't test corruption. |
| `checkOfflineIndicator.ts` | Story 08 §8.4 | **Retire after Story 08 is green 30+ CI runs.** Story 08 fully covers indicator text change. |
| `checkDeepLinks*.ts` | No overlap | **Keep.** No story tests deep-link integrity. |
| `checkPayloadBudgets.ts` | No overlap | **Keep.** Budget enforcement is a different concern. |
| `checkEncodings.ts` | No overlap | **Keep.** |
| `checkPrecacheSize.ts` | Story 08 §8.3 (partial) | **Keep both.** Budget checking ≠ cache inventory verification. |
| `checkSwCachePaths.ts` | Story 08 §8.3 (partial) | **Keep both.** |
| `checkTelemetrySchemaDrift.ts` | No overlap | **Keep.** |

## Retirement Criteria

A script may be retired when ALL of these are true:
1. The story that covers its assertions has been green for 30+ consecutive CI runs
2. The story runs in under 2× the script's execution time
3. No unique assertions in the script that the story doesn't cover
4. The team has explicitly decided in a PR review

**Current retirement candidate:** `checkOfflineIndicator.ts` (once Story 08 is stable)

## Migration Path

**Phase 1 (now):** Write stories. Run both tiers in CI.  
**Phase 2 (after 30 green runs per story):** Evaluate each script against the overlap map. Propose retirements as individual PRs.  
**Phase 3 (steady state):** Scripts that survived are permanent. They test things stories don't (budgets, encoding, telemetry drift).
