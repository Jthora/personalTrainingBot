import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStepCompletion } from '../../hooks/useStepCompletion';

vi.mock('../../utils/telemetry', () => ({
  trackEvent: vi.fn(),
}));

describe('useStepCompletion', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it('starts with empty completedSteps', () => {
    const { result } = renderHook(() => useStepCompletion());
    expect(result.current.completedSteps).toEqual({});
  });

  it('toggle marks step as completed', () => {
    const { result } = renderHook(() => useStepCompletion());
    act(() => result.current.toggle('/mission/brief'));
    expect(result.current.isCompleted('/mission/brief')).toBe(true);
  });

  it('toggle again marks step as not completed', () => {
    const { result } = renderHook(() => useStepCompletion());
    act(() => result.current.toggle('/mission/brief'));
    act(() => result.current.toggle('/mission/brief'));
    expect(result.current.isCompleted('/mission/brief')).toBe(false);
  });

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useStepCompletion());
    act(() => result.current.toggle('/mission/triage'));
    const stored = JSON.parse(window.localStorage.getItem('mission:step-complete:v1')!);
    expect(stored['/mission/triage']).toBe(true);
  });

  it('hydrates from localStorage on mount', () => {
    window.localStorage.setItem('mission:step-complete:v1', JSON.stringify({ '/mission/case': true }));
    const { result } = renderHook(() => useStepCompletion());
    expect(result.current.isCompleted('/mission/case')).toBe(true);
  });

  it('fires telemetry on toggle', async () => {
    const { trackEvent } = await import('../../utils/telemetry');
    const { result } = renderHook(() => useStepCompletion());
    act(() => result.current.toggle('/mission/brief'));
    expect(trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'ia',
        action: 'tab_view',
        data: expect.objectContaining({ kind: 'step_complete_toggle' }),
      }),
    );
  });
});
