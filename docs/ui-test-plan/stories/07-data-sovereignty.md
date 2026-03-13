# Story 7: Data Sovereignty

> *There is no server. There is no account. There is no password reset. The operative's training data lives on their device, and the app promises to protect it — through automatic backup, manual export, and unattended restoration. If any link in this chain breaks, the operative loses everything they've built. That's not a bug, it's a betrayal.*

## The Promise

Training data automatically backs up to IndexedDB. The operative can export a full snapshot as JSON at any time. If localStorage is cleared, the app silently restores from IndexedDB on next load. If IndexedDB is also gone, the operative can import their exported file and resume exactly where they left off. The operative can also change their archetype or handler at any point — their data is sovereign.

## Emotional Arc

| Stage | What the user sees | What they should feel |
|-------|--------------------|-----------------------|
| Training normally | Nothing visible | Secure — backup happens silently |
| Export data | JSON file downloads | In control — they own a physical copy |
| localStorage wiped | App reloads, data reappears | Relief — auto-backup saved them |
| Manual import | "Restored N store(s)" | Rescued — even worst case is recoverable |
| Change archetype | Picker reopens, identity updates | Free — not locked into a choice |

## Preconditions

- **Persona:** `veteran-operative` — full profile with meaningful data:
  - Archetype set (e.g., `rescue_ranger`), handler set (e.g., `kestrel`)
  - 15+ drill completions, XP across multiple sessions
  - Card progress entries for several modules
  - 5+ day streak
- **Starting URL:** `/mission/debrief` (where DataSafetyPanel lives)

## Architecture

### Storage Layers

```
┌─────────────────────────────┐
│ localStorage (primary)       │  ← Stores read/write here
├─────────────────────────────┤
│ IndexedDB ptb-user-backup    │  ← Auto-mirror, debounced 5s
├─────────────────────────────┤
│ Downloaded JSON file         │  ← Manual export, user-triggered
└─────────────────────────────┘
```

### Backed-Up Keys (4 stores)

| localStorage Key | Store | Max Entries |
|------------------|-------|-------------|
| `ptb:drill-history:v1` | DrillHistoryStore | 100 |
| `ptb:card-progress:v1` | CardProgressStore | 10,000 |
| `userProgress:v1` | UserProgressStore | — |
| `operative:profile:v1` | OperativeProfileStore | — |

### Export Payload Schema

```ts
{
  schemaVersion: 1,
  exportedAt: string,    // ISO timestamp
  appVersion: string,
  stores: {
    "ptb:drill-history:v1": [...],
    "ptb:card-progress:v1": [...],
    "userProgress:v1": {...},
    "operative:profile:v1": {...}
  }
}
```

## Test Checkpoints

### 7.1 — DataSafetyPanel renders on Debrief

```
SEED: veteran-operative persona
Navigate to /mission/debrief
EXPECT visible: [data-testid="data-safety-panel"]
EXPECT visible: heading "Training Data"
EXPECT visible: button "Export Data"
EXPECT visible: button "Import Data"
```

### 7.2 — Export downloads a valid JSON file

```
CLICK: "Export Data" button
CAPTURE: downloaded file (intercept download or read from download path)
PARSE: file as JSON
EXPECT: payload.schemaVersion === 1
EXPECT: payload.exportedAt is a valid ISO date
EXPECT: payload.stores has keys:
  - "ptb:drill-history:v1"
  - "ptb:card-progress:v1"
  - "userProgress:v1"
  - "operative:profile:v1"
EXPECT: payload.stores["operative:profile:v1"].archetypeId === "rescue_ranger"
EXPECT: payload.stores["userProgress:v1"].totalDrillsCompleted >= 15
```

**Why this matters:** If the export file is malformed, empty, or missing stores, the operative's disaster recovery is worthless.

### 7.3 — Verify IndexedDB auto-backup happened

```
AFTER export (which triggers backupNow()):
READ IndexedDB: ptb-user-backup → snapshots
EXPECT: entries for all 4 BACKUP_KEYS
EXPECT: each entry has non-empty data matching localStorage
```

### 7.4 — Clear localStorage → auto-restore on reload

```
EXECUTE: clear all 4 BACKUP_KEYS from localStorage
  localStorage.removeItem('ptb:drill-history:v1')
  localStorage.removeItem('ptb:card-progress:v1')
  localStorage.removeItem('userProgress:v1')
  localStorage.removeItem('operative:profile:v1')
RELOAD page
WAIT: App.tsx restoreIfNeeded() runs
READ localStorage:
EXPECT: all 4 keys are back (restored from IndexedDB)
EXPECT: operative:profile:v1 still has archetypeId === "rescue_ranger"
EXPECT: userProgress:v1 still has totalDrillsCompleted >= 15
```

**Why this matters:** This is the invisible safety net. If localStorage gets cleared (browser cleanup, storage pressure, bugs), the operative's data survives because IndexedDB wasn't cleared. This happens silently — the operative never knows it happened.

### 7.5 — Full wipe → manual import restores everything

```
EXECUTE: clear all 4 localStorage keys AND delete IndexedDB database
RELOAD page
EXPECT: app loads in fresh state (no profile, no progress)
Navigate to a surface that renders DataSafetyPanel (may need to reach debrief)
CLICK: "Import Data"
SELECT: the JSON file captured in checkpoint 7.2
WAIT: status message "Restored N store(s). Reload to apply."
RELOAD page
READ localStorage:
EXPECT: all 4 keys restored from the import file
EXPECT: operative:profile:v1 has archetypeId === "rescue_ranger"
EXPECT: userProgress:v1 has totalDrillsCompleted >= 15
EXPECT: streak, XP, badges all match pre-export values
```

**Why this matters:** This is the nuclear recovery scenario. Everything gone — but the operative has their JSON file. If import doesn't restore correctly, the sovereignty promise is broken.

### 7.6 — Import validates schema (rejects bad files)

```
PREPARE: a malformed JSON file (e.g., { schemaVersion: 99, stores: {} })
CLICK: "Import Data"
SELECT: the malformed file
EXPECT: error message (schema version mismatch or validation failure)
EXPECT: localStorage NOT modified
```

### 7.7 — Change archetype preserves progress

```
Navigate to /mission/stats
EXPECT visible: [data-testid="change-archetype-btn"]
CLICK: "Change Archetype"
EXPECT visible: [data-testid="archetype-overlay"] (archetype picker)
SELECT: a different archetype (e.g., "cyber_sentinel")
CONFIRM selection
EXPECT: OperativeProfileStore.archetypeId updated
EXPECT: UserProgressStore data unchanged (XP, drills, streak preserved)
EXPECT: milestone tier labels update to new archetype's labels
```

**Why this matters:** Changing identity shouldn't destroy progress. The operative invested time earning XP and badges — those belong to them, not to the archetype.

### 7.8 — Change handler preserves progress

```
EXPECT visible: [data-testid="change-handler-btn"]
CLICK: "Change Handler"
EXPECT visible: [data-testid="handler-overlay"] (handler picker)
SELECT: a different handler
CONFIRM selection
EXPECT: OperativeProfileStore.handlerId updated
EXPECT: all other stores unchanged
```

## Failure Modes This Catches

| Failure | Impact |
|---------|--------|
| Export file missing stores | Backup is incomplete — data unrecoverable |
| Export file schema malformed | Import fails — no recovery path |
| IndexedDB backup not triggered | Auto-restore impossible after localStorage clear |
| restoreIfNeeded() doesn't fire on load | Silent recovery broken — data lost on clear |
| Import overwrites with partial data | Some stores restored, others zeroed out |
| Import accepts any JSON without validation | Corrupt/adversarial data injected |
| Archetype change wipes progress | Identity change = data loss — trust destroyed |
| Handler change wipes progress | Same — mentorship change shouldn't erase history |

## Locator Reference

| Element | Locator Strategy |
|---------|------------------|
| Data safety panel | `[data-testid="data-safety-panel"]` |
| Export button | `getByRole('button', { name: /Export Data/i })` |
| Import button | `getByRole('button', { name: /Import Data/i })` |
| Change archetype | `[data-testid="change-archetype-btn"]` |
| Change handler | `[data-testid="change-handler-btn"]` |
| Archetype overlay | `[data-testid="archetype-overlay"]` |
| Handler overlay | `[data-testid="handler-overlay"]` |
| Profile editor | `[data-testid="profile-editor"]` |
| Overlay close | `[data-testid="overlay-close"]` |

## Spec File

`e2e/flows/07-data-sovereignty.spec.ts`

## Estimated Duration

~40–50 seconds (export + clear + restore + import + identity change)

## Dependencies

- Needs Playwright's download interception (`page.waitForEvent('download')`)
- IndexedDB assertions require `page.evaluate()` to query IDB directly
- Import requires `page.setInputFiles()` on the hidden file input

## Relationship to Existing Scripts

This story complements but does **not** overlap with existing offline scripts. Those test SW cache behavior. This tests data layer resilience — a completely different failure domain.
