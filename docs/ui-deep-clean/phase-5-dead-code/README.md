# Phase 5 — Dead Code Purge

> Remove dead components, dead exports, orphaned assets, and dead CSS definitions.
>
> **Tasks**: ~25 | **Risk**: Low | **Dependencies**: Phase 4 (missionCutover removal requires route consolidation)
>
> **Goal**: Reduce codebase surface area. Every file should have at least one live consumer.

---

## Task Checklist

### Step 5.1 — Dead Components (3 tasks)

| Target | Files | Consumers | Evidence |
|--------|-------|-----------|----------|
| `src/components/AssistantCard/` | 1 file (AssistantCard.tsx) | 0 imports | Extracted component never wired in — MissionShell uses inline version |
| `src/components/StepTools/` | 1 file (StepTools.tsx) | 0 imports | Same — MissionShell uses inline step tools |
| `src/assets/react.svg` | 1 file | 0 imports | Vite scaffold leftover |

- [ ] `P5-001` Delete `src/components/AssistantCard/` directory
- [ ] `P5-002` Delete `src/components/StepTools/` directory
- [ ] `P5-003` Delete `src/assets/react.svg`

### Step 5.2 — Dead Exports in missionCutover.ts (5 tasks)

The file has 3 production + 3 test consumers. The file itself must stay (exports `missionRoutePaths`, `MissionRoutePath` type), but specific exports are dead:

| Export | Status | Callers |
|--------|--------|---------|
| `isMissionRouteEnabled()` | Dead | Always returns `true`, only called in own tests |
| `toHomeFallbackPath()` | Dead | Zero callers in production code |
| `missionHomeFallbacks` | Dead | Zero references outside own file |
| `getDefaultRootPath()` | Semi-dead | Used in Routes.tsx, but always returns `/train` |
| `missionRoutePaths` | **Live** | Used in navConfig.ts, missionTelemetryContracts.ts |
| `MissionRoutePath` type | **Live** | Used in navConfig.ts, missionTelemetryContracts.ts |

- [ ] `P5-004` Remove `isMissionRouteEnabled()` export
- [ ] `P5-005` Remove `toHomeFallbackPath()` export
- [ ] `P5-006` Remove `missionHomeFallbacks` export
- [ ] `P5-007` Remove `getDefaultRootPath()` — inline `'/train'` in Routes.tsx
- [ ] `P5-008` Delete or update test files:
  - `src/routes/__tests__/missionCutover.test.ts` — remove tests for deleted exports
  - `src/routes/__tests__/missionCutoverExtended.test.ts` — remove tests for deleted exports
  - `src/routes/__tests__/missionRouteOwnership.test.ts` — verify if still needed

### Step 5.3 — Dead CSS Definitions (7 tasks)

From `src/styles/theme.css`:

| Variable | Line | Consumers | Status |
|----------|------|-----------|--------|
| `--primary-bg-color` | L144 | 0 | Dead — delete |
| `--secondary-bg-color` | L145 | 0 | Dead — delete |
| `--primary-text-color` | L146 | 0 | Dead — delete |
| `--secondary-text-color` | L147 | 0 | Dead — delete |
| `--border-color` | L148 | 0 | Dead — delete |
| `--padding` | L152 | 0 | Dead — delete |
| `--border-radius` | L153 | 0 | Dead — delete |

- [ ] `P5-009` Delete `--primary-bg-color` from theme.css
- [ ] `P5-010` Delete `--secondary-bg-color` from theme.css
- [ ] `P5-011` Delete `--primary-text-color` from theme.css
- [ ] `P5-012` Delete `--secondary-text-color` from theme.css
- [ ] `P5-013` Delete `--border-color` from theme.css
- [ ] `P5-014` Delete `--padding` from theme.css
- [ ] `P5-015` Delete `--border-radius` from theme.css

### Step 5.4 — Dead Legacy Redirects (5 tasks)

After Phase 4 route consolidation, remove redirects that are no longer needed:

- [ ] `P5-016` Remove `/profile-old` → `/profile` redirect (internal, no external links)
- [ ] `P5-017` Audit remaining 10 redirects — determine which have external SEO/bookmark value
- [ ] `P5-018` Add `<!-- REMOVE AFTER 2025-12-01 -->` comments to time-boxed redirects
- [ ] `P5-019` Remove `404.html` SPA fallback if Vercel handles SPA routing (check vercel.json)
- [ ] `P5-020` Verify `_redirects` and `vercel.json` don't reference dead routes

### Step 5.5 — Dead CSS Class Audit (3 tasks)

- [ ] `P5-021` Rename `MissionFlow.module.css` → `MissionSurfaces.module.css` (no `MissionFlow.tsx` exists; used by 13 files as shared surface styles)
- [ ] `P5-022` Run PurgeCSS or manual audit on MissionFlow.module.css — `.assistantCard` class (L191) may be dead once AssistantCard.tsx is deleted
- [ ] `P5-023` Audit `.stepTools` class in MissionFlow.module.css — may be dead once StepTools.tsx is deleted (but MissionShell uses it inline)

### Step 5.6 — Verification

- [ ] `P5-V01` `npm test` → all unit tests pass (after removing dead test files)
- [ ] `P5-V02` `npm run test:beta` → all beta E2E tests pass
- [ ] `P5-V03` `npx vite build` → no import resolution errors
- [ ] `P5-V04` `grep -r "AssistantCard\|StepTools\|react.svg" src/` → 0 results
