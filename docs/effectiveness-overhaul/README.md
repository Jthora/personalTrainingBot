# Effectiveness Overhaul

> **Baseline Score: 4.8/10** → **Target: 7.0+**
>
> Audit date: 2026-03-13 · Commit baseline: `003ddc5`

## The Problem

The Training Console has world-class plumbing — SM-2 spaced repetition, a 4-type quiz
generator, 19-module architecture, offline PWA, telemetry, badges, operative identity —
wrapped around placeholder content. The [refined-approach](../roadmap/refined-approach.md)
document already diagnosed this: **"systems outran the content."**

A user who signs up to learn cybersecurity today will:

1. Navigate a confusing 10-tab ops-themed shell to find Training
2. Select a cybersecurity deck with 2-3 cards
3. See collapsed steps they can checkbox-skip in under 5 seconds
4. Get XP and a "drill complete" reward indistinguishable from deep engagement
5. Take a quiz that tests recognition of 3-word fragments like "Syslog analysis"
6. See a progress bar rise regardless of actual comprehension

**The quiz path is the only honest learning gate in the entire system.** Everything else
is honor-system with incentives to skip.

## Scoring Breakdown

| Dimension | Current | Target | Weight | Weighted Now | Weighted Target |
|-----------|---------|--------|--------|-------------|----------------|
| Onboarding | 7/10 | 9/10 | 10% | 0.70 | 0.90 |
| **Drill Execution** | **3/10** | **7/10** | **25%** | **0.75** | **1.75** |
| Quiz System | 7/10 | 8/10 | 20% | 1.40 | 1.60 |
| Spaced Repetition | 6/10 | 7/10 | 15% | 0.90 | 1.05 |
| **Content Quality** | **2/10** | **5/10** | **20%** | **0.40** | **1.00** |
| Progress Tracking | 8/10 | 8/10 | 5% | 0.40 | 0.40 |
| Reflection/AAR | 5/10 | 6/10 | 5% | 0.25 | 0.30 |
| **Total** | | | | **4.80** | **7.00** |

## Three Actions

| # | Action | Effort | Impact | Folder |
|---|--------|--------|--------|--------|
| 1 | **Drill Enforcement** — Stop the system from rewarding fake engagement | 2-3 weeks | 3→7 drills | [drill-enforcement/](drill-enforcement/) |
| 2 | **Content Pipeline** — Deepen the 19-discipline curriculum | 3-6 months | 2→5 content | [content-pipeline/](content-pipeline/) |
| 3 | **Shell Simplification** — Collapse 10-tab ops shell to 4 clean tabs | 3-4 weeks | 7→9 onboarding | [shell-simplification/](shell-simplification/) |

## Sequencing

```
Week 1-3:   ┌─ Drill Enforcement (pure code, immediate signal integrity)
            └─ Quiz Explanations (schema + auto-derive from card data)

Week 3-7:   ┌─ Shell Simplification (routes, telemetry, tests)
            └─ Content Pipeline Tooling (validation scripts, card editor)

Month 2-8:  └─ Content Authoring (the long pole — 19 domains, 1,100+ new cards)
```

**Drill enforcement and quiz explanations ship first** because they're pure code and
immediately stop the system from lying about what users have learned.

**Shell simplification runs parallel to content tooling** because neither depends on the
other and the shell work improves first impressions.

**Content authoring is the long pole.** It requires domain expertise across 19 fields,
a content quality rubric, and probably a decision about AI-assist vs. manual authoring.
The code changes (schema, tooling, validation) are ~2 weeks; the content itself is months.

## Dependencies

```
drill-enforcement  →  (none — standalone)
content-pipeline   →  quiz explanation schema (adds `explanation` field to QuizQuestion)
shell-simplification → (none — standalone, but benefits from content improvements)
```

## Success Criteria

- [ ] No drill can complete without card content being expanded
- [ ] Self-assessment is required, not optional
- [ ] Quiz wrong answers show explanation derived from card data
- [ ] Zero thin decks (< 5 cards) remain in any module
- [ ] Zero templated "list the key points" exercises remain
- [ ] Navigation uses ≤ 4 primary tabs
- [ ] All 1,200+ unit tests pass after changes
- [ ] All 126+ E2E tests pass after changes (updated for new behavior)
