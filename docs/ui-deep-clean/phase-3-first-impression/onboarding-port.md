# Onboarding Port — MissionShell → Shared Component

> Extract the onboarding flow from the 654-line MissionShell monolith into reusable components
> so AppShell v2 users get the same first-run experience.

---

## Problem Statement

- `shellV2` is `true` in all environments — AppShell v2 is the production default
- New users land on `/train` → `AppShell.tsx` → `TrainingSurface` with no profile setup
- The onboarding flow (archetype picker, handler picker, guidance overlay, intake panel) only exists inside `MissionShell.tsx` (lines 126-490)
- AppShell has zero onboarding — no profile check, no redirect, no introduction

---

## Current Onboarding Architecture (MissionShell)

### State Variables (all in MissionShell.tsx)

| Variable | Type | Storage | Purpose |
|----------|------|---------|---------|
| `showIntake` | `boolean` | `mission:intake:v1` (localStorage) | Show intake panel |
| `completedSteps` | `Record<string, boolean>` | `mission:step-complete:v1` | Track step completions |
| `guidanceMode` | `'assist' \| 'ops'` | `mission:guidance-mode:v1` | SOP hint verbosity |
| `showGuidanceOverlay` | `boolean` | `mission:guidance-overlay:v1` | First-run welcome overlay |
| `showArchetypePicker` | `boolean` | In-memory | Show archetype selection |
| `showHandlerPicker` | `boolean` | In-memory | Show handler selection |
| `pendingArchetype` | `Archetype \| null` | In-memory | Pending until handler confirms |

### Flow Sequence

```
Entry (new user, no profile)
  ├─ showGuidanceOverlay = true (never seen guidance overlay)
  │   ├─ "Start Training Now" → jumpToTraining() → fast-path, skip all
  │   └─ "Choose Your Focus First" → dismiss overlay
  │       ├─ showArchetypePicker = true (if archetypeEnabled && !profile)
  │       │   ├─ onSelect(archetype) → pendingArchetype = archetype, showHandlerPicker = true
  │       │   └─ onSkip → showArchetypePicker = false, showHandlerPicker = false
  │       │       └─ showIntake = true (if not seen)
  │       └─ showHandlerPicker = true
  │           ├─ onSelect(handler) → save profile, clear all gates
  │           └─ onBack → return to archetype picker
  └─ showIntake = true (if not seen intake)
      └─ onDismiss → navigate('/mission/brief')
```

### Profile Save on Handler Selection (MissionShell L460-480)

```ts
OperativeProfileStore.set({
  archetypeId: pendingArchetype?.id ?? 'adaptable-operator',
  handlerId: handler.id,
  callsign: '',
  enrolledAt: new Date().toISOString()
});
// + auto-select archetype core+secondary modules in TrainingModuleCache
// + emit telemetry: archetype_intake_complete
```

### Telemetry Events

| Event | Where | Context |
|-------|-------|---------|
| `onboarding_overlay_shown` | L263 | Guidance overlay rendered |
| `onboarding_overlay_dismiss` | L273 | User chose "Choose Focus" |
| `onboarding_fast_path` | L393 | User chose "Start Training Now" |
| `onboarding_intake_dismiss` | L283 | Intake panel dismissed |
| `archetype_intake_complete` | L472 | Profile saved after handler selection |

---

## Proposed Architecture

### New Files

```
src/components/Onboarding/
├── OnboardingFlow.tsx          # Orchestrator: manages state machine + renders steps
├── GuidanceOverlay.tsx         # Welcome screen with two CTAs
├── ArchetypeStep.tsx           # Wraps <ArchetypePicker> with onboarding callbacks
├── HandlerStep.tsx             # Wraps <HandlerPicker> with profile save logic
├── IntakeStep.tsx              # Wraps <MissionIntakePanel> with dismiss logic
├── OnboardingFlow.module.css   # Shared onboarding styles
└── __tests__/
    └── OnboardingFlow.test.tsx

src/hooks/
└── useOnboardingState.ts       # Custom hook: reads/writes localStorage keys, derives isOnboarding
```

### `useOnboardingState` Hook

```ts
interface OnboardingState {
  isOnboarding: boolean;
  showGuidanceOverlay: boolean;
  showArchetypePicker: boolean;
  showHandlerPicker: boolean;
  showIntake: boolean;
  pendingArchetype: Archetype | null;
  // dispatchers
  dismissGuidance: (choice: 'fast-path' | 'choose-focus') => void;
  selectArchetype: (archetype: Archetype) => void;
  skipArchetype: () => void;
  selectHandler: (handler: Handler) => void;
  goBackToArchetype: () => void;
  dismissIntake: () => void;
}
```

### `OnboardingFlow` Component

```tsx
// Props:
interface OnboardingFlowProps {
  onComplete: () => void;  // Called when all onboarding gates cleared
  fastPathTarget?: string; // Default: '/train' or '/mission/training' based on shell
}

// Renders sequentially:
// 1. GuidanceOverlay → if showGuidanceOverlay
// 2. ArchetypePicker → if showArchetypePicker
// 3. HandlerPicker   → if showHandlerPicker
// 4. IntakePanel     → if showIntake
// 5. null            → onboarding complete, call onComplete()
```

### Integration Points

#### AppShell.tsx (new)

```tsx
const profile = OperativeProfileStore.get();
const { isOnboarding } = useOnboardingState();

if (isOnboarding || !profile) {
  return <OnboardingFlow onComplete={() => navigate('/train')} fastPathTarget="/train" />;
}
// ... existing AppShell render
```

#### MissionShell.tsx (refactored)

```tsx
const { isOnboarding } = useOnboardingState();

if (isOnboarding) {
  return <OnboardingFlow onComplete={() => navigate('/mission/brief')} fastPathTarget="/mission/training" />;
}
// ... existing MissionShell render (minus 350 lines of inlined onboarding)
```

---

## localStorage Key Compatibility

These keys MUST be preserved for backward compatibility with existing users:

| Key | Current Writer | New Writer |
|-----|---------------|-----------|
| `mission:intake:v1` | MissionShell L192 | `useOnboardingState` |
| `mission:guidance-overlay:v1` | MissionShell L198 | `useOnboardingState` |
| `mission:fast-path:v1` | MissionShell L380 | `useOnboardingState` |
| `mission:step-complete:v1` | MissionShell L222 | stays in MissionShell (not onboarding) |
| `mission:guidance-mode:v1` | MissionShell L248 | stays in MissionShell (not onboarding) |

---

## Risk Mitigation

1. **Feature flag**: Add `onboardingV2` flag (default `false`) — switch on per-environment
2. **Backward compat**: Read same localStorage keys — returning users unaffected
3. **Rollback**: If onboardingV2 is `false`, MissionShell uses its existing inline flow, AppShell has no onboarding (current behavior)
4. **Testing**: Run beta E2E suite after integration — scenarios 01-04 test onboarding paths
