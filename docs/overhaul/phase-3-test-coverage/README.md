# Phase 3 — Test Coverage

> Fill the gaps so every future phase can refactor with confidence.

## Current State

| Metric | Value |
|--------|-------|
| Statement coverage | **25.53%** (1,999 / 7,829) |
| Branch coverage | 64.70% (407 / 629) |
| Function coverage | 54.12% (197 / 364) |
| Test files | 100 |
| Untested components | 19 of 48 |
| Untested stores | 10 of 22 |
| Untested pages | 9 of 11 |

## Target

| Metric | Target |
|--------|--------|
| Statement coverage | **≥ 55%** (+30 pp, achievable from focused work) |
| Untested components | **≤ 5** (test 14+) |
| Untested stores | **0** (test all 10) |
| Critical utils coverage | **≥ 60%** (`telemetry.ts`, `taskScheduler.ts`) |

## Strategy

### Priority order
1. **Stores first** — stores are pure logic, highest ROI per line of test
2. **High-priority components** — user-critical surfaces with complex logic
3. **Critical utilities** — `telemetry.ts`, `taskScheduler.ts`
4. **Medium-priority components** — fill remaining gaps
5. **Pages** — `MissionShell.tsx` is highest priority

### Test approach
- Stores: test public API (`get`, `set`, `subscribe`, side effects), mock `localStorage`
- Components: render tests with `@testing-library/react`, mock stores and hooks
- Utils: unit tests with mocked dependencies

## Execution Order

| Step | File(s) | Est. Tests | Doc |
|------|---------|-----------|-----|
| 1 | 10 untested stores | ~60 tests | [store-tests.md](store-tests.md) |
| 2 | 6 high-priority components | ~40 tests | [component-tests.md](component-tests.md) |
| 3 | 2 critical utilities | ~20 tests | [utility-tests.md](utility-tests.md) |
| 4 | 8 medium-priority components | ~30 tests | [component-tests.md](component-tests.md) |
| 5 | 5 low-priority components | ~10 tests | [component-tests.md](component-tests.md) |
| 6 | MissionShell + pages | ~20 tests | [component-tests.md](component-tests.md) |
| **Total** | | **~180 tests** | |

## Prerequisites

- Phase 0 (terminology renames) complete — test file paths have changed
- Phase 1 (store factory) ideally complete — test the factory, not the old boilerplate

## Done Definition

- [ ] Zero untested stores
- [ ] ≤ 5 untested component directories
- [ ] Statement coverage ≥ 55%
- [ ] CI green, no flaky tests
- [ ] All HIGH-priority items from [component-tests.md](component-tests.md) have passing suites

## Files

| Document | Purpose |
|----------|---------|
| [store-tests.md](store-tests.md) | Test plans for all 10 untested stores |
| [component-tests.md](component-tests.md) | Test plans for all 19 untested components + pages |
| [utility-tests.md](utility-tests.md) | Test plans for critical untested utilities |
