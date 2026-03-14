# Phase 2.3 — Domain Audit & Expansion Planning

> Generated from `artifacts/content-validation-report.json` and `artifacts/template-detection-report.json`
> Date: 2026-03-14

## Executive Summary

- **19 modules**, **663 decks**, **4,354 cards**
- **Overall avg score: 3.5/10** (target: 6.0+)
- **97% of cards** score below 6/10
- **3,224 templated exercises** (27.5% of 11,732 total)
- All detected templates match `selfcheck_template` pattern

## Module Rankings (Worst → Best)

| Rank | Module | Cards | Avg Score | Below 6 | Templates | Priority |
|------|--------|-------|-----------|---------|-----------|----------|
| 1 | Counter PsyOps | 720 | 2.9 | 720 (100%) | 720 | Tier 1 |
| 2 | Dance Training | 110 | 3.0 | 110 (100%) | 110 | Tier 2 |
| 3 | Intelligence | 181 | 3.0 | 181 (100%) | 181 | Tier 1 |
| 4 | Martial Arts Training | 180 | 3.1 | 180 (100%) | 180 | Tier 2 |
| 5 | TCS/IDC/CBC | 555 | 3.2 | 555 (100%) | 555 | Tier 1 |
| 6 | Cybersecurity | 143 | 3.2 | 142 (99%) | 143 | Tier 1 |
| 7 | Field Conditioning | 180 | 3.2 | 180 (100%) | 180 | Tier 2 |
| 8 | Combat | 90 | 3.3 | 90 (100%) | 90 | Tier 2 |
| 9 | PsiOps | 146 | 3.3 | 146 (100%) | 146 | Tier 1 |
| 10 | Self Sovereignty | 469 | 3.3 | 469 (100%) | 469 | Tier 1 |
| 11 | Anti-PSN | 450 | 3.6 | 450 (100%) | 450 | Tier 2 |
| 12 | Web3 | 90 | 3.9 | 90 (100%) | 0 | Tier 3 |
| 13 | Counter BioChem | 94 | 4.1 | 94 (100%) | 0 | Tier 3 |
| 14 | Espionage | 90 | 4.2 | 90 (100%) | 0 | Tier 3 |
| 15 | Investigation | 90 | 4.3 | 90 (100%) | 0 | Tier 3 |
| 16 | War Strategy | 90 | 4.3 | 90 (100%) | 0 | Tier 3 |
| 17 | Agencies | 75 | 4.6 | 75 (100%) | 0 | Tier 3 |
| 18 | Equations | 397 | 4.6 | 390 (98%) | 0 | Tier 3 |
| 19 | Space Force Command | 204 | 5.4 | 77 (38%) | 0 | Tier 3 |

## Tier 1 — Critical (Score < 3.5, high template %)

### Counter PsyOps (2.9/10, 720 cards, 720 templates)
- **Issues**: Every exercise is templated (`selfcheck_template`). Largest module by card count.
- **Plan**: Rewrite all self-check exercises with domain-specific checklists. Add recall/apply/scenario exercises. Needs complete exercise overhaul.
- **Effort**: ~40 hours

### Intelligence (3.0/10, 181 cards, 181 templates)
- **Issues**: All exercises templated. Short bulletpoints, missing summaryText.
- **Plan**: Replace templated exercises, expand bulletpoints to 15+ words, add summaryText.
- **Effort**: ~12 hours

### TCS/IDC/CBC (3.2/10, 555 cards, 555 templates)
- **Issues**: Second largest module. All exercises templated.
- **Plan**: Batch rewrite exercises. Consider splitting into sub-modules for manageability.
- **Effort**: ~30 hours

### Cybersecurity (3.2/10, 143 cards, 143 templates)
- **Issues**: All exercises templated. Core module that should be highest quality.
- **Plan**: Priority pilot module for content pipeline. Full exercise rewrite + scenario exercises.
- **Effort**: ~10 hours

### PsiOps (3.3/10, 146 cards, 146 templates)
- **Issues**: All exercises templated.
- **Plan**: Domain-specific exercise rewrite.
- **Effort**: ~10 hours

### Self Sovereignty (3.3/10, 469 cards, 469 templates)
- **Issues**: Large module, all exercises templated.
- **Plan**: Batch rewrite. Consider splitting into sub-modules.
- **Effort**: ~25 hours

## Tier 2 — Medium Priority (Score 3.0-3.6, some templates)

### Dance Training (3.0/10, 110 cards, 110 templates)
- Rewrite exercises with movement/technique-specific checklists. ~8 hours.

### Martial Arts Training (3.1/10, 180 cards, 180 templates)
- Rewrite exercises with technique/form-specific drills. ~12 hours.

### Field Conditioning (3.2/10, 180 cards, 180 templates)
- Rewrite exercises with fitness/conditioning-specific tasks. ~12 hours.

### Combat (3.3/10, 90 cards, 90 templates)
- Rewrite exercises with tactical scenario exercises. ~6 hours.

### Anti-PSN (3.6/10, 450 cards, 450 templates)
- Large module. Batch rewrite exercises. ~25 hours.

## Tier 3 — Better Baseline (Score 3.9-5.4, no templates)

These modules have no templated exercises but still score below 6.0 due to:
- Short descriptions (< 2 sentences)
- Insufficient bulletpoints (< 4)
- Few key terms (< 3)
- Missing summaryText
- Shallow expectedOutcome

### Web3 (3.9) / Counter BioChem (4.1) / Espionage (4.2) / Investigation (4.3) / War Strategy (4.3)
- Need bulletpoint expansion, key term additions, summaryText. ~5 hours each.

### Agencies (4.6) / Equations (4.6)
- Closest to passing. Mostly need summaryText and deeper bulletpoints. ~3 hours each.

### Space Force Command (5.4) ⭐ Best Module
- **62% of cards already pass 6/10**. Only 77 cards need remediation.
- Minor fixes: expand short bulletpoints, add missing summaryText. ~2 hours.

## Restructuring Analysis (Tasks 136-137)

### Candidates for Splitting (> 200 cards)
| Module | Cards | Recommendation |
|--------|-------|---------------|
| Counter PsyOps | 720 | Split into 4-5 sub-modules by technique type |
| TCS/IDC/CBC | 555 | Already segmented by topic (TCS, IDC, CBC) |
| Self Sovereignty | 469 | Split into 3 sub-modules by domain |
| Anti-PSN | 450 | Split into 3 sub-modules (PSN identification, defense, recovery) |
| Equations | 397 | Split by math domain (algebra, calculus, statistics, etc.) |
| Space Force Command | 204 | Acceptable size, no split needed |

### No Tiny Modules Found
All modules have ≥ 75 cards. No merging needed.

## Remediation Priority Order

1. **Space Force Command** — 2 hours, gets first module to passing
2. **Cybersecurity** — 10 hours, pilot for content pipeline
3. **Agencies / Equations** — 3 hours each, quick wins
4. **Investigation / War Strategy / Espionage** — 5 hours each
5. **Intelligence / PsiOps** — 10-12 hours each
6. **Counter PsyOps / TCS/IDC/CBC / Self Sovereignty** — 25-40 hours each (batch via pipeline)

**Total estimated remediation: ~230 hours** (primarily exercise rewrites)
