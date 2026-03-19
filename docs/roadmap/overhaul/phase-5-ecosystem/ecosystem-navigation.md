# Ecosystem Navigation

Add an app switcher so operatives can move between Earth Intelligence Network apps.

---

## Current State

- Logo links to `https://archangel.agency/hub` (external, new tab)
- Header nav is 100% internal (`/mission/*` routes)
- Zero links to Starcom, Navcom, Tactical Intel Dashboard, or Mecha Jono
- No awareness of which app the operative is currently in

## Target

A compact **ecosystem app switcher** in the Header that:
- Shows all 5 apps with icons and labels
- Highlights the current app
- Opens sibling apps in the same tab (seamless transition)
- Works offline (shows apps as "unavailable" when offline)

---

## Ecosystem App Registry

```typescript
// src/config/ecosystemApps.ts
export interface EcosystemApp {
  id: string;
  name: string;
  shortName: string;
  url: string;
  icon: string;       // Emoji or icon class
  description: string;
  current?: boolean;   // True for this app
}

export const ECOSYSTEM_APPS: EcosystemApp[] = [
  {
    id: 'ptb',
    name: 'Starcom Academy',
    shortName: 'Academy',
    url: 'https://academy.starcom.app',
    icon: '⚔️',
    description: 'Drill execution & readiness',
    current: true,
  },
  {
    id: 'starcom',
    name: 'Starcom',
    shortName: 'Starcom',
    url: 'https://starcom.app',
    icon: '📡',
    description: 'Communication & coordination',
  },
  {
    id: 'navcom',
    name: 'Navcom',
    shortName: 'Navcom',
    url: 'https://navcom.app',
    icon: '🧭',
    description: 'Navigation & routing',
  },
  {
    id: 'tid',
    name: 'Tactical Intel Dashboard',
    shortName: 'Intel',
    url: 'https://tacticalinteldashboard.archangel.agency',
    icon: '📊',
    description: 'Intelligence analysis',
  },
  {
    id: 'mecha',
    name: 'Mecha Jono',
    shortName: 'Mecha',
    url: 'https://mecha.jono.archangel.agency',
    icon: '🤖',
    description: 'AI companion',
  },
];
```

---

## UI Design: App Switcher Component

### Location

In the Header, next to the logo. On desktop: horizontal pill bar. On mobile: inside the hamburger drawer as a grid.

### Component Structure

```
EcosystemSwitcher/
  EcosystemSwitcher.tsx      — Main switcher component
  EcosystemSwitcher.css      — Styles
  __tests__/
    EcosystemSwitcher.test.tsx
```

### Desktop Layout

```
┌──────────────────────────────────────────────────┐
│ [Logo] ⚔️ Training │ 📡 Starcom │ 🧭 Navcom │ ... │  [hamburger]
│         ▔▔▔▔▔▔▔▔▔▔                                │
└──────────────────────────────────────────────────┘
```

Current app has underline accent. Sibling apps are plain links.

### Mobile Layout (inside drawer)

```
┌─────────────────────┐
│ Earth Intelligence   │
│ Network             │
│                      │
│ ⚔️ Training  (here) │
│ 📡 Starcom          │
│ 🧭 Navcom           │
│ 📊 Intel            │
│ 🤖 Mecha            │
│                      │
│ ─── Mission Nav ──── │
│ Brief  Triage  ...   │
└─────────────────────┘
```

### Offline Handling

When `useNetworkStatus()` reports offline:
- Current app pill is normal (we're already here)
- Sibling app pills are dimmed with tooltip "Offline — cached intel only"
- Links are still clickable (the browser handles offline navigation naturally)

---

## Implementation Steps

### Step 1 — Create ecosystem app config

Create `src/config/ecosystemApps.ts` with the registry above.

### Step 2 — Create EcosystemSwitcher component

```typescript
// src/components/EcosystemSwitcher/EcosystemSwitcher.tsx
import { ECOSYSTEM_APPS } from '../../config/ecosystemApps';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export function EcosystemSwitcher({ layout }: { layout: 'inline' | 'grid' }) {
  const isOnline = useNetworkStatus();
  
  return (
    <nav aria-label="Earth Intelligence Network" className={`ecosystem-switcher ${layout}`}>
      {ECOSYSTEM_APPS.map(app => (
        <a
          key={app.id}
          href={app.url}
          className={`ecosystem-app ${app.current ? 'current' : ''} ${!isOnline && !app.current ? 'dimmed' : ''}`}
          aria-current={app.current ? 'page' : undefined}
          title={app.description}
        >
          <span className="ecosystem-app-icon">{app.icon}</span>
          <span className="ecosystem-app-name">{app.shortName}</span>
        </a>
      ))}
    </nav>
  );
}
```

### Step 3 — Integrate into Header

- Desktop: Add `<EcosystemSwitcher layout="inline" />` next to the logo
- Mobile: Add `<EcosystemSwitcher layout="grid" />` at top of HeaderDrawer, above mission nav

### Step 4 — Update logo link

Change logo from `archangel.agency/hub` to either:
- Keep as-is (hub is the canonical entry point)
- Or link to `archangel.agency` root (less specific)

### Step 5 — Tests

```
✅ renders all 5 ecosystem apps
✅ current app has aria-current="page"
✅ sibling apps link to correct URLs
✅ offline: sibling apps are dimmed
✅ desktop: inline layout
✅ mobile: grid layout
```

---

## Cross-App Identity Handoff (Future)

Once identity is live across multiple apps, add query-parameter-based handoff:

```
https://starcom.app/?import-identity=<base64-encrypted-keypair>
```

Flow:
1. Cadet exports identity from Academy SovereigntyPanel
2. Clicks "Connect to Starcom" → navigates to Starcom with encrypted keypair in URL
3. Starcom reads query param, decrypts (using shared passphrase or challenge), imports identity
4. Cadet is now authenticated in Starcom with the same keypair

This requires:
- A shared encryption scheme (SEA.encrypt with a deterministic passphrase, e.g., derived from pub key)
- Starcom to implement the import handler
- Academy to add "Connect to [App]" buttons in SovereigntyPanel

---

## Verification Gate

- [ ] EcosystemSwitcher component renders in Header
- [ ] All 5 apps listed with correct URLs
- [ ] Current app visually distinguished
- [ ] Offline state dims sibling apps
- [ ] Mobile drawer shows grid layout
- [ ] All tests pass
- [ ] ARIA: `nav` with proper label, `aria-current` on current app
