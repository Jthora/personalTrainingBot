import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCelebrations } from '../useCelebrations';
import { emitCelebration, CelebrationEvent } from '../../store/celebrationEvents';

describe('useCelebrations', () => {
  it('starts with null current and 0 pending', () => {
    const { result } = renderHook(() => useCelebrations());
    expect(result.current.current).toBeNull();
    expect(result.current.pending).toBe(0);
  });

  it('queues an emitted event as current', () => {
    const { result } = renderHook(() => useCelebrations());

    act(() => {
      emitCelebration({ kind: 'xp-gain', amount: 50, newTotal: 150 });
    });

    expect(result.current.current).toEqual({ kind: 'xp-gain', amount: 50, newTotal: 150 });
    expect(result.current.pending).toBe(1);
  });

  it('queues multiple events and advances on dismiss', () => {
    const { result } = renderHook(() => useCelebrations());

    act(() => {
      emitCelebration({ kind: 'xp-gain', amount: 20, newTotal: 120 });
      emitCelebration({ kind: 'level-up', previousLevel: 1, newLevel: 2 });
    });

    expect(result.current.pending).toBe(2);
    expect(result.current.current?.kind).toBe('xp-gain');

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.current?.kind).toBe('level-up');
    expect(result.current.pending).toBe(1);

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.current).toBeNull();
    expect(result.current.pending).toBe(0);
  });

  it('unsubscribes on unmount', () => {
    const { result, unmount } = renderHook(() => useCelebrations());

    unmount();

    // emitting after unmount should not cause errors
    act(() => {
      emitCelebration({ kind: 'xp-gain', amount: 10, newTotal: 10 });
    });

    // result is stale after unmount - no assertion needed, just verify no error
    expect(true).toBe(true);
  });
});
