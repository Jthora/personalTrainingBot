# Module Priority Queue

> Work order is determined by: template pollution rate × mission criticality × card count.
> Highest-impact modules first. Finish before moving on.

---

## Priority Queue

| # | Module | Cards | BP-Template | EX-Template | Mission Weight | Sessions |
|---|--------|-------|-------------|-------------|----------------|---------|
| 1 | `counter_psyops` | 720 | 100% | 100% | CRITICAL | 4 |
| 2 | `anti_tcs_idc_cbc` | 555 | 100% | 100% | CRITICAL | 3 |
| 3 | `anti_psn` | 450 | 100% | 100% | CRITICAL | 3 |
| 4 | `self_sovereignty` | 469 | 95% | 100% | CRITICAL | 3 |
| 5 | `equations` | 397 | 88% | 100% | HIGH | 2 |
| 6 | `space_force` | 204 | 100% | 100% | HIGH | 2 |
| 7 | `intelligence` | 181 | 99% | 100% | HIGH | 1 |
| 8 | `psiops` | 146 | 99% | 100% | HIGH | 1 |
| 9 | `cybersecurity` | 143 | 100% | 100% | HIGH | 1 |
| 10 | `dance` | 110 | varies | varies | MEDIUM | 1 |
| 11 | `fitness_training` | 180 | 100% | 0% | MEDIUM | 1 |
| 12 | `martial_arts` | 180 | 100% | 100% | MEDIUM | 1 |
| 13 | `counter_biochem` | 94 | varies | varies | HIGH | 1 |
| 14 | `investigation` | 90 | varies | varies | MEDIUM | 1 |
| 15 | `espionage` | 90 | varies | varies | MEDIUM | 1 |
| 16 | `combat` | 90 | varies | varies | MEDIUM | 1 |
| 17 | `war_strategy` | 90 | varies | varies | HIGH | 1 |
| 18 | `web_three` | 90 | varies | varies | MEDIUM | 1 |
| 19 | `agencies` | 75 | varies | varies | MEDIUM | 1 |
| **TOTAL** | **19 modules** | **4,354** | **98% avg** | **93% avg** | | **~28** |

---

## Priority Rationale

### CRITICAL (Modules 1–4)

These modules are the core Earth Alliance doctrine. Template content here is not just hollow — it is actively misleading. A cadet drilling `counter_psyops` with placeholder bullet points is rehearsing failure patterns.

- **counter_psyops**: 720 cards. Largest module. BITE model, thought-stopping, coercive persuasion, loaded language identification. These must be real.
- **anti_tcs_idc_cbc**: 555 cards. Cult dynamics, thought reform mechanics, exit counseling protocols. Placeholders here teach nothing.
- **anti_psn**: 450 cards. Narcissistic abuse cycles, DARVO, gaslighting recognition. Real language patterns are the entire point.
- **self_sovereignty**: 469 cards. OPSEC, digital hygiene, sovereign identity. The "do not store API keys" principle lives here.

### HIGH (Modules 5–9, 13, 17)

Operationally important. Template content reduces drill value but does not corrupt doctrine the way CRITICAL modules do.

- **equations**: 397 cards. 12% still template-bp. Math content needs precision — AI works well here.
- **space_force, intelligence, psiops, cybersecurity**: Operational training. Value is lower without real examples.

### MEDIUM (Modules 10–12, 14–16, 18–19)

Important but not Earth Alliance doctrine core. Improve after CRITICAL and HIGH are done.

---

## Completion Forecast

At 200 cards/session, 1 session/day:

| Week | Progress |
|------|----------|
| Week 1 | counter_psyops complete (720 cards, 4 sessions) |
| Week 2 | anti_tcs_idc_cbc + anti_psn complete (~1,000 cards, 5 sessions) |
| Week 3 | self_sovereignty + equations complete (~870 cards, 5 sessions) |
| Week 4 | space_force + intelligence + psiops + cybersecurity + dance (~780 cards, 4 sessions) |
| Week 5–6 | Remaining 10 modules (~900 cards, 9 sessions) |
| **Done** | **All 4,354 cards improved** |

Two backends alternated (400/day): ~11 calendar days instead of 22.

---

## What "Done" Means Per Module

A module is complete when:

1. Zero cards have template bullet points (`"Learn about..."`, `"Understand..."`, `"Explore..."`)
2. Zero cards have template exercises (`"Practice this concept"`, `"Apply what you learned"`)
3. Shard JSON committed to `main` branch
4. Checkpoint file shows `processedCount === totalCards`
5. At least one visual review pass by the operator (5–10 cards spot-checked)

Do not mark a module done until all five conditions are met.
