# Stream B: coach → handler Renames

Every identifier that needs renaming from legacy "coach" vocabulary to mission-aligned "handler" vocabulary.

---

## src/cache/TrainingHandlerCache.ts (104 lines)

| Line | Current | New |
|------|---------|-----|
| 16 | `private defaultCoach: string = "tiger_fitness_god"` | `private defaultHandler: string = "tiger_fitness_god"` |
| 33 | `'coachCatalog'` (IndexedDB cache key) | `'handlerCatalog'` — **WARNING: cache key change, see note below** |
| 35 | `TTL_MS.coachCatalog` | `TTL_MS.handlerCatalog` (requires update in cache/constants.ts) |
| 36 | `` `coachCatalog-${appVersion}` `` | `` `handlerCatalog-${appVersion}` `` |
| 38 | `console.info('coachCache: ${msg}')` | `console.info('handlerCache: ${msg}')` |
| 64 | `this.dataLoader.loadCoachSpeech()` | `this.dataLoader.loadHandlerSpeech()` |
| 69 | `handler: string = this.defaultCoach` | `handler: string = this.defaultHandler` |
| 73 | `handler: string = this.defaultCoach` | `handler: string = this.defaultHandler` |
| 77 | `handler: string = this.defaultCoach` | `handler: string = this.defaultHandler` |
| 81 | `handler: string = this.defaultCoach` | `handler: string = this.defaultHandler` |

---

## src/context/HandlerSelectionContextState.ts (6 lines)

| Line | Current | New |
|------|---------|-----|
| 4 | `coachId: string` | `handlerId: string` |
| 5 | `setCoachId: (coachId: string) => void` | `setHandlerId: (handlerId: string) => void` |

---

## src/context/HandlerSelectionContext.tsx (~65 lines)

| Line | Current | New |
|------|---------|-----|
| 15 | `const [coachId, setCoachIdState] = useState<string>(defaultHandlerId)` | `const [handlerId, setHandlerIdState] = useState<string>(defaultHandlerId)` |
| 16 | `const coachReadyMarkedRef = useRef(false)` | `const handlerReadyMarkedRef = useRef(false)` |
| 27 | `setCoachIdState(profile.handlerId)` | `setHandlerIdState(profile.handlerId)` |
| 28 | `if (!coachReadyMarkedRef.current)` | `if (!handlerReadyMarkedRef.current)` |
| 29 | `mark('load:coach_ready')` | `mark('load:handler_ready')` |
| 30 | `coachReadyMarkedRef.current = true` | `handlerReadyMarkedRef.current = true` |
| 36 | `const storedCoach = window.localStorage.getItem('selectedHandler')` | `const storedHandler = window.localStorage.getItem('selectedHandler')` |
| 37 | `if (storedCoach)` | `if (storedHandler)` |
| 38 | `setCoachIdState(storedCoach)` | `setHandlerIdState(storedHandler)` |
| 42 | `if (!coachReadyMarkedRef.current)` | `if (!handlerReadyMarkedRef.current)` |
| 43 | `mark('load:coach_ready')` | `mark('load:handler_ready')` |
| 44 | `coachReadyMarkedRef.current = true` | `handlerReadyMarkedRef.current = true` |
| 50 | `window.localStorage.setItem('selectedHandler', coachId)` | `window.localStorage.setItem('selectedHandler', handlerId)` |
| 52 | `syncHandlerModuleSelection(coachId)` | `syncHandlerModuleSelection(handlerId)` |
| 53 | `applyHandlerPaletteToRoot(coachId)` | `applyHandlerPaletteToRoot(handlerId)` |
| 54 | `}, [coachId])` | `}, [handlerId])` |
| 56 | `const setCoachId = (id: string) =>` | `const setHandlerId = (id: string) =>` |
| 57 | `setCoachIdState(id)` | `setHandlerIdState(id)` |
| 61 | `value={{ coachId, setCoachId }}` | `value={{ handlerId, setHandlerId }}` |

**Downstream consumers:** Any component that reads `coachId` or calls `setCoachId` from `HandlerSelectionContext` must be updated.

```bash
grep -rn 'coachId\|setCoachId' src --include='*.ts' --include='*.tsx' | grep -v __tests__
```

---

## src/utils/HandlerDataLoader.ts

| Line | Current | New |
|------|---------|-----|
| 4 | `import coachSpeech from "../data/training_handler_data/handler_speech.json"` | Variable name: `import handlerSpeech from ...` |
| 24 | `coachSpeechData` | `handlerSpeechData` |
| 26 | `this.loadCoachSpeech()` | `this.loadHandlerSpeech()` |
| 31 | `this.handlerData = coachSpeechData` | `this.handlerData = handlerSpeechData` |
| 66 | `public async loadCoachSpeech()` | `public async loadHandlerSpeech()` |
| 71 | `this.handlerData = coachSpeech.coaches` | `this.handlerData = handlerSpeech.coaches` |

**Note:** The JSON file at `training_handler_data/handler_speech.json` has a `coaches` key internally. This is data-level — the JSON file content is out of scope for Phase 0 but should be updated in a future data cleanup pass.

---

## src/data/handlerModuleMapping.ts

| Line | Current | New |
|------|---------|-----|
| 11 | `export const getCoachDefaultModules = (coachId: string)` | `export const getHandlerDefaultModules = (handlerId: string)` |
| 12 | `return handlerModuleMapping[coachId]` | `return handlerModuleMapping[handlerId]` |

---

## src/utils/handlerModulePreferences.ts

| Line | Current | New |
|------|---------|-----|
| 2 | `import { getCoachDefaultModules }` | `import { getHandlerDefaultModules }` |
| 7 | `const OVERRIDES_STORAGE_KEY = 'coachModuleOverrides'` | Keep as-is — localStorage key, preserved for backward compat |
| 9 | `type CoachModuleOverrides = Record<string, string[]>` | `type HandlerModuleOverrides = Record<string, string[]>` |
| 13 | `const readOverrides = (): CoachModuleOverrides =>` | `const readOverrides = (): HandlerModuleOverrides =>` |
| 23 | `const parsed = JSON.parse(raw) as CoachModuleOverrides` | `const parsed = JSON.parse(raw) as HandlerModuleOverrides` |
| 31 | `const writeOverrides = (overrides: CoachModuleOverrides) =>` | `const writeOverrides = (overrides: HandlerModuleOverrides) =>` |
| 43 | `export const getHandlerOverrideModules = (coachId: string)` | `(handlerId: string)` |
| 45 | `return overrides[coachId]` | `return overrides[handlerId]` |
| 48 | `export const saveHandlerOverrideModules = (coachId: string, ...)` | `(handlerId: string, ...)` |
| 51 | `overrides[coachId] = uniqueIds` | `overrides[handlerId] = uniqueIds` |

---

## src/utils/cache/constants.ts

| Line | Current | New |
|------|---------|-----|
| 3 | `'coachCatalog'` in CACHE_STORES array | `'handlerCatalog'` |
| 9 | `coachCatalog: 12 * 60 * 60 * 1000` in TTL_MS | `handlerCatalog: 12 * 60 * 60 * 1000` |

**WARNING:** This changes an IndexedDB store name. Existing cached data under `coachCatalog` will be orphaned. Options:
1. Accept one-time re-fetch (low impact — it's just handler personality data)
2. Add migration code that reads old key and writes to new key

Recommendation: Accept the re-fetch. Handler data is small and loads fast.

---

## vite.config.ts

| Line | Current | New |
|------|---------|-----|
| ~5 | `{ name: 'coaches', patterns: [/src\/components\/Coach/i, /src\/data\/coaches/i, /src\/data\/coachModuleMapping/i] }` | `{ name: 'handlers', patterns: [/src\/components\/Handler/i, /src\/data\/handlers/i, /src\/data\/handlerModuleMapping/i] }` |

---

## Downstream Context Consumers

After renaming `coachId` → `handlerId` in the context, find all consumers:

```bash
grep -rn 'useContext(HandlerSelectionContext)\|coachId\|setCoachId' src --include='*.tsx' --include='*.ts' | grep -v __tests__ | grep -v HandlerSelectionContext
```

Each consuming component needs its destructuring updated from `{ coachId, setCoachId }` to `{ handlerId, setHandlerId }`.

---

## Performance Marks

The performance mark `'load:coach_ready'` changes to `'load:handler_ready'`. If any reporting/analysis scripts reference this mark name, they need updating too:

```bash
grep -rn 'coach_ready' src scripts artifacts
```
