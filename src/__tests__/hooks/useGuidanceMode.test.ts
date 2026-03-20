import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGuidanceMode } from '../../hooks/useGuidanceMode';

vi.mock('../../utils/telemetry', () => ({
  trackEvent: vi.fn(),
}));

describe('useGuidanceMode', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it('defaults to assist', () => {
    const { result } = renderHook(() => useGuidanceMode('/mission/brief'));
    expect(result.current.mode).toBe('assist');
  });

  it('updates to ops', () => {
    const { result } = renderHook(() => useGuidanceMode('/mission/brief'));
    act(() => result.current.update('ops'));
    expect(result.current.mode).toBe('ops');
  });

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useGuidanceMode('/mission/brief'));
    act(() => result.current.update('ops'));
    expect(window.localStorage.getItem('mission:guidance-mode:v1')).toBe('ops');
  });

  it('hydrates from localStorage', () => {
    window.localStorage.setItem('mission:guidance-mode:v1', 'ops');
    const { result } = renderHook(() => useGuidanceMode('/mission/brief'));
    expect(result.current.mode).toBe('ops');
  });

  it('fires telemetry on update', async () => {
    const { trackEvent } = await import('../../utils/telemetry');
    const { result } = renderHook(() => useGuidanceMode('/mission/brief'));
    act(() => result.current.update('ops'));
    expect(trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'ia',
        action: 'tab_view',
        data: expect.objectContaining({ kind: 'guidance_mode_change', mode: 'ops' }),
      }),
    );
  });
});
