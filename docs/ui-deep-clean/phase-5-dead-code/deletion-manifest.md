# Deletion Manifest

> Complete list of files, exports, and definitions to delete, with safety verification.

---

## Files to Delete

| # | Path | Size | Reason | Pre-check |
|---|------|------|--------|-----------|
| 1 | `src/components/AssistantCard/AssistantCard.tsx` | ~70 lines | Zero imports | `grep -r "AssistantCard" src/ --include="*.tsx" --include="*.ts"` → 0 |
| 2 | `src/components/StepTools/StepTools.tsx` | ~120 lines | Zero imports | `grep -r "from.*StepTools" src/` → 0 |
| 3 | `src/assets/react.svg` | SVG | Vite scaffold leftover | `grep -r "react.svg" src/` → 0 |

### Conditional Deletions (After Phase 4)

| # | Path | Reason | Depends On |
|---|------|--------|-----------|
| 4 | `src/routes/missionCutover.ts` | Dead after route consolidation | Phase 4 Step 4.5 |
| 5 | `src/routes/__tests__/missionCutover.test.ts` | Tests dead exports | Phase 4 Step 4.5 |
| 6 | `src/routes/__tests__/missionCutoverExtended.test.ts` | Tests dead exports | Phase 4 Step 4.5 |
| 7 | `src/pages/MissionFlow/MissionShell.tsx` | Replaced by unified shell | Phase 4 Step 4.3 |

> **Note**: Items 4-7 require Phase 4 (shell unification) to be complete first.
> The live exports `missionRoutePaths` and `MissionRoutePath` must be relocated to
> `src/routes/routePaths.ts` or similar before deleting missionCutover.ts.

---

## Exports to Remove (from files that stay)

| File | Export | Status |
|------|--------|--------|
| `src/routes/missionCutover.ts` | `isMissionRouteEnabled()` | Dead — always returns `true` |
| `src/routes/missionCutover.ts` | `toHomeFallbackPath()` | Dead — zero callers |
| `src/routes/missionCutover.ts` | `missionHomeFallbacks` | Dead — zero references |
| `src/routes/missionCutover.ts` | `getDefaultRootPath()` | Dead when shellV2 flag removed |

---

## CSS Definitions to Remove

### From `src/styles/theme.css`

```css
/* ── Legacy compat ── (DELETE THIS BLOCK) */
--primary-bg-color: var(--surface-base);       /* L144 — 0 consumers */
--secondary-bg-color: var(--surface-elevated); /* L145 — 0 consumers */
--primary-text-color: var(--text-primary);     /* L146 — 0 consumers */
--secondary-text-color: var(--accent-glow);    /* L147 — 0 consumers */
--border-color: var(--accent-border);          /* L148 — 0 consumers */
--padding: 0px;                                /* L152 — 0 consumers */
--border-radius: 5px;                          /* L153 — 0 consumers */
```

### From `src/styles/theme.css` (After Phase 2 migration)

```css
/* Legacy aliases — DELETE after all consumers migrated */
--handler-accent: var(--accent);           /* L27 */
--handler-accent-strong: var(--accent-strong); /* L28 */
--handler-accent-soft: var(--accent-soft);    /* L29 */
--handler-glow: var(--accent-glow);          /* L30 */
--handler-border: var(--accent-border);      /* L31 */
--panel-bg: var(--surface-card);              /* L55 */
--mission-type-h1: var(--type-h1);           /* L80 */
--mission-type-h2: var(--type-h2);           /* L81 */
--mission-type-h3: var(--type-h3);           /* L82 */
--mission-type-body: var(--type-body);       /* L83 */
--mission-type-caption: var(--type-caption); /* L84 */
```

---

## CSS Classes Potentially Dead After Component Deletion

| File | Class | Consumer | Status After Deletion |
|------|-------|----------|----------------------|
| `MissionFlow.module.css` | `.assistantCard` (L191) | AssistantCard.tsx (deleted) + MissionShell.tsx (inline) | Check MissionShell usage |
| `MissionFlow.module.css` | `.stepTools` (L96) | StepTools.tsx (deleted) + MissionShell.tsx (inline) | Check MissionShell usage |

---

## Safety Verification Script

Run before and after deletions:

```bash
#!/bin/bash
# Pre-flight: verify no live references to targets
echo "=== Dead component references ==="
grep -rn "AssistantCard\|from.*StepTools\|react\.svg" src/ --include="*.tsx" --include="*.ts"

echo "=== Dead export references ==="
grep -rn "isMissionRouteEnabled\|toHomeFallbackPath\|missionHomeFallbacks" src/ --include="*.tsx" --include="*.ts" | grep -v "missionCutover"

echo "=== Dead CSS alias consumers ==="
grep -rn "var(--primary-bg-color)\|var(--secondary-bg-color)\|var(--primary-text-color)\|var(--secondary-text-color)\|var(--padding)\|var(--border-radius)" src/ --include="*.css"

echo "=== Build check ==="
npx vite build 2>&1 | tail -5

echo "=== Test check ==="
npx vitest run --reporter=verbose 2>&1 | tail -10
```
