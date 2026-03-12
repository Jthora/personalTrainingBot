# Troubleshooting Guide

## Installation & Build

### Node.js Version Mismatch
**Symptom:** Build fails with version-related errors.

```bash
node --version   # Must be 18+
nvm install 18 && nvm use 18
```

### Package Installation Failures
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Compilation Errors
```bash
# Run type checking independently of the build
npx tsc --noEmit
```

Common causes:
- Missing type imports (check `src/types/` for available types)
- Incorrect import paths after file moves
- Feature-flagged code referencing types from disabled modules

### Path Generation Failures
The build generates path mappings before compilation. If these fail:

```bash
npm run generate-module-paths
npm run generate-submodule-paths
npm run generate-carddeck-paths
npm run generate-workout-category-paths
npm run generate-workout-subcategory-paths
```

### Memory Issues During Build
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

---

## Runtime Issues

### Training Data Not Loading
**Symptom:** Blank triage board, no modules visible.

1. Open DevTools → Network tab → look for failed requests to `/training_modules_manifest.json` or `/training_modules_shards/*.json`
2. Verify the data was generated: `ls public/training_modules_shards/`
3. Regenerate if missing: `npm run generate-training-data-combined`
4. Check `TrainingModuleCache.getInstance().isLoaded()` in the console

### Mission Flow Not Advancing
**Symptom:** Stuck on a mission surface (Brief, Triage, Case, etc.).

1. Check the console for errors in `MissionEntityStore` or `lifecycle.ts`
2. Inspect mission state: open DevTools console and run:
   ```javascript
   JSON.parse(localStorage.getItem('userProgress:v1'))
   ```
3. Check the mission schedule store for corrupted data:
   ```javascript
   // Look at the raw schedule
   localStorage.getItem('missionSchedule')
   ```
4. Clear mission state and restart:
   ```javascript
   localStorage.removeItem('missionSchedule');
   location.reload();
   ```

### Drills Not Appearing in Triage
**Symptom:** Triage surface shows empty or limited drill options.

1. Check drill filters are not overly restrictive:
   ```javascript
   JSON.parse(localStorage.getItem('drillFilters:v1'))
   ```
2. Reset to defaults:
   ```javascript
   localStorage.removeItem('drillFilters:v1');
   location.reload();
   ```
3. Verify `DrillCategoryCache` loaded successfully:
   ```javascript
   DrillCategoryCache.getInstance().getWorkoutCategories().length
   ```

### Handler Not Displaying Correctly
**Symptom:** Missing handler theme, no motivational quotes, default colours.

1. Check handler selection in operative profile:
   ```javascript
   JSON.parse(localStorage.getItem('operative:profile:v1'))
   ```
2. Verify handler data loaded:
   ```javascript
   TrainingHandlerCache.getInstance().getHandlerData('tiger_fitness_god')
   ```
3. Check CSS custom properties are being set — inspect the root element for `--handler-primary` and `--handler-accent`

---

## Offline & PWA Issues

### Service Worker Not Registering
**Symptom:** No offline capability, no install prompt.

- SW only registers in **production** builds (`npm run build && npm run preview`)
- Check DevTools → Application → Service Workers
- The SW requires HTTPS (or localhost)

### Stale Content After Update
**Symptom:** Old UI persists after a new deploy.

1. Check if the SW update notification appears — `UpdateNotification` component handles this
2. Force update via DevTools → Application → Service Workers → "Update"
3. Hard refresh: `Ctrl+Shift+R` / `Cmd+Shift+R`
4. Clear all caches via DevTools → Application → Storage → "Clear site data"

### Offline Data Not Available
**Symptom:** App shows blank content when offline.

1. Verify the SW precache includes critical assets — run `npm run check:precache-size`
2. Check SW cache contents in DevTools → Application → Cache Storage
3. The manifest and shards should be cached after first successful online load

---

## Identity & Sync Issues

### Gun.js Identity Not Generating
**Symptom:** No operative identity, sovereignty panel empty.

1. Check localStorage for the identity key:
   ```javascript
   localStorage.getItem('ptb:gun-identity')
   ```
2. If null, the SEA keypair generation may have failed — check console for Gun.js errors
3. Regenerate identity by clearing and reloading:
   ```javascript
   localStorage.removeItem('ptb:gun-identity');
   location.reload();
   ```

### Profile Not Persisting
**Symptom:** Callsign, archetype, or handler resets on reload.

1. Check the operative profile store:
   ```javascript
   JSON.parse(localStorage.getItem('operative:profile:v1'))
   ```
2. Look for storage quota issues — large telemetry queues can fill localStorage
3. Check for private/incognito mode — storage may be cleared on close

### QR Code Import Failing
**Symptom:** Scanning a QR code doesn't restore identity.

- Verify the QR contains a valid Gun.js SEA keypair JSON
- The scanning device must have camera permissions enabled
- Check that the exported data hasn't been truncated (QR codes have size limits)

---

## Performance Issues

### Slow Initial Load
**Symptom:** Long loading screen on first visit.

1. Check network tab for large payloads — module shards can be substantial
2. Run payload budget checks: `npm run check:payload-budgets`
3. The IndexedDB cache (`loadingCacheV2` feature flag) can speed up repeat visits
4. Check if development mode is accidentally enabled

### UI Jank During Drills
**Symptom:** Laggy timer, stuttering animations during Case surface.

1. Profile with DevTools → Performance tab
2. Check for excessive re-renders — the `DrillRunStore` subscribe pattern should prevent cascading updates
3. Look for large component trees re-rendering on timer ticks
4. Performance marks are instrumented — look for `ptb:` prefixed marks in the Performance timeline

### Memory Growth
**Symptom:** App slows down over extended use.

1. Check DevTools → Memory → Heap snapshot
2. Common causes: un-unsubscribed store listeners, growing telemetry queues
3. Flush telemetry queue: `DrillRunStore.flushQueue()`

---

## Data Issues

### Corrupted localStorage
**Symptom:** App crashes on load or shows unexpected behaviour.

Nuclear option — clear all app state:
```javascript
Object.keys(localStorage)
  .filter(k => k.startsWith('ptb:') || k.startsWith('userProgress') || k.startsWith('drillFilters') || k.startsWith('trainingSelection') || k.startsWith('missionSchedule') || k.startsWith('customMissionSchedule') || k.startsWith('operative:') || k.startsWith('difficultySettings') || k.startsWith('featureFlags') || k.startsWith('missionKit'))
  .forEach(k => localStorage.removeItem(k));
location.reload();
```

### Feature Flags Misbehaving
**Symptom:** Features appear or disappear unexpectedly.

1. Check current flags:
   ```javascript
   JSON.parse(localStorage.getItem('featureFlags:v1'))
   ```
2. Check config-level flags: inspect `src/config/featureFlags.ts` for hardcoded overrides
3. Flags merge in order: defaults → config → user progress → localStorage overrides
4. Reset to defaults:
   ```javascript
   localStorage.removeItem('featureFlags:v1');
   location.reload();
   ```

---

## Testing Issues

### Tests Failing
```bash
# Run all tests
npm test

# Run with verbose output
npx vitest run --reporter=verbose

# Run a specific test file
npx vitest run src/store/__tests__/DrillHistoryStore.test.ts

# Run tests matching a pattern
npx vitest run -t "should track drill completion"
```

### Test Environment Setup
Tests use `vitest` with `jsdom`. The setup file `vitest.setup.ts` configures:
- localStorage mock
- DOM environment
- Global test utilities

If tests fail with environment errors, check `vitest.config.ts` and `vitest.setup.ts`.

---

## Quality Gate Scripts

These scripts run pre-deploy checks. If any fail, investigate before deploying:

| Script | What It Checks |
|---|---|
| `npm run check:deeplinks` | All deep link routes resolve correctly |
| `npm run check:deeplinks-offline` | Deep links work offline |
| `npm run check:payload-budgets` | Bundle sizes within budget |
| `npm run check:mission-route-budgets` | Mission route payloads within limits |
| `npm run check:precache-size` | SW precache not oversized |
| `npm run check:encodings` | Assets properly compressed |
| `npm run check:sw-offline` | Service worker enables offline access |
| `npm run check:offline-indicator` | Offline indicator appears correctly |
| `npm run smoke:headless` | Headless smoke test passes |

---

## Getting Help

- Check [development.md](development.md) for local setup and conventions
- Check [api.md](api.md) for store and cache APIs
- Check [components.md](components.md) for component architecture
- Check [cache-system.md](cache-system.md) for data loading and caching
