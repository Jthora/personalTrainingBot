import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOnboardingState } from '../useOnboardingState';

// ── Mocks ──
vi.mock('../../store/OperativeProfileStore', () => ({
  default: { get: vi.fn(() => null), set: vi.fn() },
}));
const mockCacheInstance = {
  selectModules: vi.fn(),
  isLoaded: vi.fn(() => true),
};
vi.mock('../../cache/TrainingModuleCache', () => ({
  default: {
    getInstance: vi.fn(() => mockCacheInstance),
  },
}));
const trackEvent = vi.fn();
vi.mock('../../utils/telemetry', () => ({ trackEvent: (...args: unknown[]) => trackEvent(...args) }));

// Re-import mocks for assertions
import OperativeProfileStore from '../../store/OperativeProfileStore';

const baseOptions = {
  fastPathTarget: '/train',
  onNavigate: vi.fn(),
};

describe('useOnboardingState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    baseOptions.onNavigate = vi.fn();
    // Default: no existing profile → first-run user
    (OperativeProfileStore.get as ReturnType<typeof vi.fn>).mockReturnValue(null);
  });

  // ── P3-034: localStorage key backward compatibility ──

  it('reads mission:guidance-overlay:v1 key', () => {
    window.localStorage.setItem('mission:guidance-overlay:v1', 'seen');
    window.localStorage.setItem('mission:intake:v1', 'seen');
    (OperativeProfileStore.get as ReturnType<typeof vi.fn>).mockReturnValue({ archetypeId: 'x', handlerId: 'h' });
    const { result } = renderHook(() => useOnboardingState(baseOptions));
    expect(result.current.step).toBe('done');
    expect(result.current.isOnboarding).toBe(false);
  });

  it('reads mission:intake:v1 key', () => {
    window.localStorage.setItem('mission:guidance-overlay:v1', 'seen');
    // intake NOT seen → should be onboarding
    (OperativeProfileStore.get as ReturnType<typeof vi.fn>).mockReturnValue({ archetypeId: 'x', handlerId: 'h' });
    const { result } = renderHook(() => useOnboardingState(baseOptions));
    expect(result.current.step).toBe('intake');
  });

  // ── First-run user flow ──

  it('shows guidance overlay for first-run user', () => {
    const { result } = renderHook(() => useOnboardingState(baseOptions));
    expect(result.current.step).toBe('guidance');
    expect(result.current.isOnboarding).toBe(true);
  });

  it('fires onboarding_overlay_shown telemetry on first mount', () => {
    renderHook(() => useOnboardingState(baseOptions));
    expect(trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ kind: 'onboarding_overlay_shown' }),
      }),
    );
  });

  // ── Fast-path skip ──

  it('fast-path sets all 3 localStorage keys and navigates', () => {
    const { result } = renderHook(() => useOnboardingState(baseOptions));
    act(() => result.current.dismissGuidance('fast-path'));

    expect(window.localStorage.getItem('mission:guidance-overlay:v1')).toBe('seen');
    expect(window.localStorage.getItem('mission:intake:v1')).toBe('seen');
    expect(window.localStorage.getItem('mission:fast-path:v1')).toBe('active');
    expect(baseOptions.onNavigate).toHaveBeenCalledWith('/train');
    expect(result.current.step).toBe('done');
  });

  it('fast-path fires onboarding_fast_path telemetry', () => {
    const { result } = renderHook(() => useOnboardingState(baseOptions));
    act(() => result.current.dismissGuidance('fast-path'));

    expect(trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ kind: 'onboarding_fast_path', skippedArchetype: true }),
      }),
    );
  });

  // ── Choose-focus flow ──

  it('choose-focus transitions to archetype step', () => {
    const { result } = renderHook(() => useOnboardingState(baseOptions));
    act(() => result.current.dismissGuidance('choose-focus'));
    expect(result.current.step).toBe('archetype');
    expect(window.localStorage.getItem('mission:guidance-overlay:v1')).toBe('seen');
  });

  it('choose-focus fires onboarding_overlay_dismiss telemetry', () => {
    const { result } = renderHook(() => useOnboardingState(baseOptions));
    act(() => result.current.dismissGuidance('choose-focus'));

    expect(trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ kind: 'onboarding_overlay_dismiss' }),
      }),
    );
  });

  // ── Archetype → Handler ──

  it('selectArchetype transitions to handler step', () => {
    const { result } = renderHook(() => useOnboardingState(baseOptions));
    act(() => result.current.dismissGuidance('choose-focus'));
    act(() => result.current.selectArchetype({ id: 'a1', recommendedHandler: 'h1', coreModules: ['m1'], secondaryModules: ['m2'] } as any));

    expect(result.current.step).toBe('handler');
    expect(result.current.pendingArchetype?.id).toBe('a1');
  });

  it('skipArchetype bypasses handler and goes to intake', () => {
    const { result } = renderHook(() => useOnboardingState(baseOptions));
    act(() => result.current.dismissGuidance('choose-focus'));
    act(() => result.current.skipArchetype());

    expect(result.current.step).toBe('intake');
  });

  // ── Handler selection ──

  it('selectHandler saves profile and fires archetype_intake_complete', () => {
    const { result } = renderHook(() => useOnboardingState(baseOptions));
    act(() => result.current.dismissGuidance('choose-focus'));
    act(() => result.current.selectArchetype({ id: 'a1', recommendedHandler: 'h1', coreModules: ['m1'], secondaryModules: ['m2'] } as any));
    act(() => result.current.selectHandler({ id: 'h1' } as any));

    expect(OperativeProfileStore.set).toHaveBeenCalledWith(
      expect.objectContaining({ archetypeId: 'a1', handlerId: 'h1' }),
    );
    expect(trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ kind: 'archetype_intake_complete', archetypeId: 'a1', handlerId: 'h1' }),
      }),
    );
    // After handler selection, should proceed to intake
    expect(result.current.step).toBe('intake');
  });

  it('selectHandler clears fast-path flag', () => {
    window.localStorage.setItem('mission:fast-path:v1', 'active');
    const { result } = renderHook(() => useOnboardingState(baseOptions));
    act(() => result.current.dismissGuidance('choose-focus'));
    act(() => result.current.selectArchetype({ id: 'a1', recommendedHandler: 'h1', coreModules: ['m1'], secondaryModules: ['m2'] } as any));
    act(() => result.current.selectHandler({ id: 'h1' } as any));

    expect(window.localStorage.getItem('mission:fast-path:v1')).toBeNull();
  });

  it('selectHandler auto-selects archetype modules in cache', () => {
    const { result } = renderHook(() => useOnboardingState(baseOptions));
    act(() => result.current.dismissGuidance('choose-focus'));
    act(() => result.current.selectArchetype({ id: 'a1', recommendedHandler: 'h1', coreModules: ['m1'], secondaryModules: ['m2'] } as any));
    act(() => result.current.selectHandler({ id: 'h1' } as any));

    expect(mockCacheInstance.selectModules).toHaveBeenCalledWith(['m1', 'm2']);
  });

  // ── goBackToArchetype ──

  it('goBackToArchetype returns to archetype step', () => {
    const { result } = renderHook(() => useOnboardingState(baseOptions));
    act(() => result.current.dismissGuidance('choose-focus'));
    act(() => result.current.selectArchetype({ id: 'a1', recommendedHandler: 'h1', coreModules: ['m1'], secondaryModules: ['m2'] } as any));
    expect(result.current.step).toBe('handler');

    act(() => result.current.goBackToArchetype());
    expect(result.current.step).toBe('archetype');
  });

  // ── Intake ──

  it('dismissIntake writes localStorage and fires telemetry', () => {
    // Set up: returning user (has profile), guidance seen, intake NOT seen
    (OperativeProfileStore.get as ReturnType<typeof vi.fn>).mockReturnValue({ archetypeId: 'x', handlerId: 'h' });
    window.localStorage.setItem('mission:guidance-overlay:v1', 'seen');

    const { result } = renderHook(() => useOnboardingState(baseOptions));
    expect(result.current.step).toBe('intake');

    act(() => result.current.dismissIntake());
    expect(window.localStorage.getItem('mission:intake:v1')).toBe('seen');
    expect(result.current.step).toBe('done');
    expect(trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ kind: 'onboarding_intake_dismiss' }),
      }),
    );
  });

  // ── Returning user (profile exists) ──

  it('skips archetype for returning user with profile', () => {
    (OperativeProfileStore.get as ReturnType<typeof vi.fn>).mockReturnValue({ archetypeId: 'x', handlerId: 'h' });
    window.localStorage.setItem('mission:guidance-overlay:v1', 'seen');
    window.localStorage.setItem('mission:intake:v1', 'seen');

    const { result } = renderHook(() => useOnboardingState(baseOptions));
    expect(result.current.step).toBe('done');
    expect(result.current.isOnboarding).toBe(false);
  });
});
