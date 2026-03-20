import { useState, useEffect, useCallback } from 'react';
import OperativeProfileStore from '../store/OperativeProfileStore';
import type { ArchetypeDefinition } from '../data/archetypes';
import type { Handler } from '../data/handlers';
import TrainingModuleCache from '../cache/TrainingModuleCache';
import { trackEvent } from '../utils/telemetry';

/* ── localStorage keys (preserved for backward compat) ── */
const INTAKE_KEY = 'mission:intake:v1';
const GUIDANCE_OVERLAY_KEY = 'mission:guidance-overlay:v1';
const FAST_PATH_KEY = 'mission:fast-path:v1';

export type OnboardingStep = 'guidance' | 'archetype' | 'handler' | 'intake' | 'done';

export interface OnboardingState {
  step: OnboardingStep;
  isOnboarding: boolean;
  pendingArchetype: ArchetypeDefinition | null;
  dismissGuidance: (choice: 'fast-path' | 'choose-focus') => void;
  selectArchetype: (archetype: ArchetypeDefinition) => void;
  skipArchetype: () => void;
  selectHandler: (handler: Handler) => void;
  goBackToArchetype: () => void;
  dismissIntake: () => void;
}

interface UseOnboardingStateOptions {
  /** Route to navigate to on fast-path skip */
  fastPathTarget: string;
  /** Called after fast-path navigate or intake dismiss */
  onNavigate: (path: string) => void;
}

/**
 * Shared onboarding state hook — used by both AppShell and MissionLayout.
 * Reads/writes the same localStorage keys for backward compatibility.
 */
export function useOnboardingState(options: UseOnboardingStateOptions): OnboardingState {
  const { fastPathTarget, onNavigate } = options;

  // ── Derive initial state ──
  const [showGuidanceOverlay, setShowGuidanceOverlay] = useState(false);
  const [needsArchetype, setNeedsArchetype] = useState(false);
  const [showHandlerPicker, setShowHandlerPicker] = useState(false);
  const [showIntake, setShowIntake] = useState(false);
  const [pendingArchetype, setPendingArchetype] = useState<ArchetypeDefinition | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasSeenGuidance = window.localStorage.getItem(GUIDANCE_OVERLAY_KEY) === 'seen';
    const hasSeenIntake = window.localStorage.getItem(INTAKE_KEY) === 'seen';
    const existingProfile = OperativeProfileStore.get();

    setShowGuidanceOverlay(!hasSeenGuidance);
    setNeedsArchetype(!existingProfile);
    setShowIntake(!hasSeenIntake);
    setInitialized(true);

    if (!hasSeenGuidance) {
      trackEvent({
        category: 'ia',
        action: 'tab_view',
        route: fastPathTarget,
        data: { kind: 'onboarding_overlay_shown', step: fastPathTarget },
        source: 'ui',
      });
    }
  }, []);

  // ── Derive current step ──
  let step: OnboardingStep = 'done';
  if (initialized) {
    if (showGuidanceOverlay) {
      step = 'guidance';
    } else if (needsArchetype && !showHandlerPicker) {
      step = 'archetype';
    } else if (showHandlerPicker && pendingArchetype) {
      step = 'handler';
    } else if (showIntake) {
      step = 'intake';
    }
  }

  const isOnboarding = step !== 'done';

  // ── Dispatchers ──

  const dismissGuidance = useCallback((choice: 'fast-path' | 'choose-focus') => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(GUIDANCE_OVERLAY_KEY, 'seen');
    }
    setShowGuidanceOverlay(false);

    if (choice === 'fast-path') {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(INTAKE_KEY, 'seen');
        window.localStorage.setItem(FAST_PATH_KEY, 'active');
      }
      setNeedsArchetype(false);
      setShowHandlerPicker(false);
      setShowIntake(false);
      onNavigate(fastPathTarget);
      trackEvent({
        category: 'ia',
        action: 'tab_view',
        route: fastPathTarget,
        data: { kind: 'onboarding_fast_path', skippedArchetype: true },
        source: 'ui',
      });
    } else {
      trackEvent({
        category: 'ia',
        action: 'tab_view',
        route: fastPathTarget,
        data: { kind: 'onboarding_overlay_dismiss', step: fastPathTarget },
        source: 'ui',
      });
    }
  }, [fastPathTarget, onNavigate]);

  const selectArchetype = useCallback((archetype: ArchetypeDefinition) => {
    setPendingArchetype(archetype);
    setNeedsArchetype(false);
    setShowHandlerPicker(true);
  }, []);

  const skipArchetype = useCallback(() => {
    setNeedsArchetype(false);
    setShowHandlerPicker(false);
  }, []);

  const selectHandler = useCallback((handler: Handler) => {
    if (!pendingArchetype) return;

    OperativeProfileStore.set({
      archetypeId: pendingArchetype.id,
      handlerId: handler.id,
      callsign: '',
      enrolledAt: new Date().toISOString(),
    });

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(FAST_PATH_KEY);
    }

    // Auto-select archetype modules in training cache
    const cache = TrainingModuleCache.getInstance();
    if (cache.isLoaded()) {
      cache.selectModules([...pendingArchetype.coreModules, ...pendingArchetype.secondaryModules]);
    }

    setShowHandlerPicker(false);
    setPendingArchetype(null);

    trackEvent({
      category: 'ia',
      action: 'tab_view',
      route: fastPathTarget,
      data: {
        kind: 'archetype_intake_complete',
        archetypeId: pendingArchetype.id,
        handlerId: handler.id,
      },
      source: 'ui',
    });
  }, [pendingArchetype, fastPathTarget]);

  const goBackToArchetype = useCallback(() => {
    setShowHandlerPicker(false);
    setNeedsArchetype(true);
  }, []);

  const dismissIntake = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(INTAKE_KEY, 'seen');
    }
    setShowIntake(false);
    trackEvent({
      category: 'ia',
      action: 'tab_view',
      route: fastPathTarget,
      data: { kind: 'onboarding_intake_dismiss', step: fastPathTarget },
      source: 'ui',
    });
  }, [fastPathTarget]);

  return {
    step,
    isOnboarding,
    pendingArchetype,
    dismissGuidance,
    selectArchetype,
    skipArchetype,
    selectHandler,
    goBackToArchetype,
    dismissIntake,
  };
}
