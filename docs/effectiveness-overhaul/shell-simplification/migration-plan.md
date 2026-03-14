# Shell Simplification — Migration Plan

## Overview

Changing the navigation structure affects existing users who have localStorage data
tied to the current route paths. This document covers backwards compatibility.

---

## 1. localStorage Keys Affected

| Key | Current Value | Migration |
|-----|---------------|-----------|
| `mission:step-complete:v1` | `Record<'/mission/brief' \| ... , boolean>` | **Drop.** Step completion tracking is a mission-mode concept. No migration needed — Mission Mode gets a fresh start. |
| `mission:intake:v1` | `'seen'` | **Keep.** The flag is path-independent. Users who dismissed intake shouldn't see it again. |
| `mission:fast-path:v1` | `'active'` | **Keep.** Path-independent. |
| `mission:guidance-mode:v1` | `'assist' \| 'ops'` | **Migrate** to `ptb:guidance-mode:v1`. Mission Mode uses the old key. Default mode uses the new key. |
| `mission:guidance-overlay:v1` | `'seen'` | **Keep.** Path-independent. |
| `ptb:mission-flow-context` | `{ operationId, caseId, signalId, updatedAt }` | **Keep.** Used exclusively by Mission Mode — unchanged. |
| `ptb:mission-flow-checkpoint` | `{ path: '/mission/...', updatedAt }` | **Migrate.** On first load of new AppShell, map old checkpoint paths to new: `/mission/training` → `/train`, `/mission/checklist` → `/train/drill`, `/mission/stats` → `/progress`. Unknown paths → `/train`. |

### Migration Script

Run once on first load of AppShell (check via `ptb:nav-migrated:v1`):

```typescript
const migrateNavStorage = () => {
  if (localStorage.getItem('ptb:nav-migrated:v1') === 'done') return;

  // Migrate checkpoint
  const raw = localStorage.getItem('ptb:mission-flow-checkpoint');
  if (raw) {
    try {
      const checkpoint = JSON.parse(raw) as { path: string; updatedAt: number };
      const pathMap: Record<string, string> = {
        '/mission/training': '/train',
        '/mission/checklist': '/train/drill',
        '/mission/quiz': '/train/quiz',
        '/mission/stats': '/progress',
        '/mission/plan': '/train',
        '/mission/brief': '/train',  // Default mode doesn't have Brief
        '/mission/triage': '/train',
        '/mission/case': '/train',
        '/mission/signal': '/train',
        '/mission/debrief': '/profile/journal',
      };
      const newPath = pathMap[checkpoint.path] ?? '/train';
      localStorage.setItem('ptb:app-checkpoint:v1', JSON.stringify({
        path: newPath,
        updatedAt: checkpoint.updatedAt,
      }));
    } catch {
      // Ignore corrupt data
    }
  }

  // Migrate guidance mode
  const mode = localStorage.getItem('mission:guidance-mode:v1');
  if (mode) {
    localStorage.setItem('ptb:guidance-mode:v1', mode);
  }

  localStorage.setItem('ptb:nav-migrated:v1', 'done');
};
```

---

## 2. URL Backwards Compatibility

### Bookmarks and Shared Links

Users may have bookmarked `/mission/training` or `/mission/stats`. All old paths
need `<Navigate replace />` redirects in `Routes.tsx`:

| Old Path | New Path |
|----------|----------|
| `/mission/training` | `/train` |
| `/mission/checklist` | `/train/drill` |
| `/mission/quiz` | `/train/quiz` |
| `/mission/stats` | `/progress` |
| `/mission/plan` | `/train` |
| `/mission/brief` | `/train` (or `/mission/brief` if Mission Mode active) |
| `/mission/triage` | `/train` (or `/mission/triage` if Mission Mode active) |
| `/mission/case` | `/train` (or `/mission/case` if Mission Mode active) |
| `/mission/signal` | `/train` (or `/mission/signal` if Mission Mode active) |
| `/mission/debrief` | `/profile/journal` (or `/mission/debrief` if Mission Mode active) |

**Important:** If Mission Mode is active, `/mission/*` paths should NOT redirect.
The redirect logic needs to check the Mission Mode flag:

```tsx
const MissionRedirect: React.FC<{ to: string; missionPath: string }> = ({ to, missionPath }) => {
  const missionMode = localStorage.getItem('ptb:mission-mode') === 'enabled';
  if (missionMode) {
    // Render the mission surface (already defined in route tree)
    return null; // Let the nested route handle it
  }
  return <Navigate to={to} replace />;
};
```

**Simpler approach:** Always define mission routes. If Mission Mode is off, they still
work if directly navigated to — they just don't appear in the tab bar. This avoids
complex conditional redirects.

### Recommendation: Always-accessible mission routes

Keep all `/mission/*` routes functional regardless of Mission Mode toggle. The toggle
only controls **tab bar visibility**, not route accessibility. This means:
- Bookmarks to `/mission/brief` always work
- Mission Mode toggle only shows/hides mission tabs in nav
- No redirects needed for mission paths
- Redirects only needed for paths that truly moved: `/mission/training` → `/train`,
  `/mission/checklist` → `/train/drill`, etc.

---

## 3. Service Worker / PWA Considerations

The PWA has a `manifest.webmanifest` and `sw.js`. Check:

**`public/manifest.webmanifest`:**
- `start_url` — if set to `/mission/brief`, update to `/train`
- `scope` — if set to `/mission/`, update to `/`

**`public/sw.js`:**
- Precache paths — if it precaches specific route HTML, update paths
- Navigation fallback — should serve `index.html` for all routes (SPA)

**`vercel.json`:**
- Rewrite rules — if routing is configured for `/mission/*`, extend to new paths

---

## 4. Deep Link / E2E Test Updates

### E2E Fixture: seed.ts

The seed helpers currently navigate using `page.goto('/mission/training')` etc.
All seed navigation helpers need path updates.

### Spec Files

| Spec | References to `/mission/*` | Updates Needed |
|------|---------------------------|----------------|
| 00-smoke-gate.spec.ts | `/mission/brief`, route checks | Update expected URLs |
| 01-first-contact.spec.ts | `/mission/training`, onboarding flow | Update navigation targets |
| 02-impatient-recruit.spec.ts | `/mission/checklist`, drill flow | `/train/drill` |
| 03-daily-cycle.spec.ts | Multiple mission routes | Full path update |
| 04-mission-loop.spec.ts | All mission cycle routes | Conditional on Mission Mode toggle in test |
| 05-knowledge-retention.spec.ts | Quiz route | `/train/quiz` |
| 06-proving-yourself.spec.ts | Stats, profile routes | `/progress`, `/profile` |

**Approach:** Create a route mapping constant in `e2e/fixtures/`:
```typescript
export const routes = {
  train: '/train',
  trainDrill: '/train/drill',
  trainQuiz: '/train/quiz',
  review: '/review',
  progress: '/progress',
  profile: '/profile',
  // Legacy (Mission Mode)
  missionBrief: '/mission/brief',
  missionTriage: '/mission/triage',
  // ...
} as const;
```

All specs import from `routes` instead of hardcoding paths.

---

## 5. Telemetry Data Continuity

Existing telemetry events in the database reference `/mission/*` route paths.
Dashboard queries that filter by route path will break if paths change.

**Options:**

| Approach | Description |
|----------|-------------|
| **Keep old paths in telemetry** | New routes emit events with old `/mission/*` paths for continuity. Confusing. |
| **Map old→new in dashboards** | Telemetry uses new paths; dashboard queries updated to `OR` old and new. |
| **Emit both** | Include `legacyRoute` field alongside new `route` field. |

**Recommendation: Map in dashboards.** Telemetry should reflect the actual route.
Add a one-time migration note to the telemetry audit report documenting the path
change date. Dashboard queries (if any exist — the audit noted telemetry has zero
consumers, so this may be moot) add path aliases.

---

## 6. Rollback Plan

If the shell simplification causes unexpected issues:

1. `AppShell` and `MissionShell` coexist — switching the default layout back to
   `MissionShell` in `Routes.tsx` is a one-line change
2. Legacy redirects ensure no broken URLs
3. localStorage migration is one-way but non-destructive (old keys preserved)

**Feature flag approach:** Gate the shell change behind a localStorage flag
(`ptb:shell-v2`) so it can be toggled per-user during testing:

```tsx
const ShellLayout = () => {
  const useNewShell = localStorage.getItem('ptb:shell-v2') !== 'disabled';
  return useNewShell ? <AppShell /> : <MissionShell />;
};
```

Remove the flag once stable (2-4 weeks after launch).
