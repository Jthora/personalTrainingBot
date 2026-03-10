import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimer } from '../useTimer';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useTimer', () => {
  describe('stopwatch mode (no durationSec)', () => {
    it('starts idle with 0 elapsed', () => {
      const { result } = renderHook(() => useTimer());
      expect(result.current.state).toBe('idle');
      expect(result.current.elapsed).toBe(0);
      expect(result.current.remaining).toBe(-1);
    });

    it('counts up after start', () => {
      const { result } = renderHook(() => useTimer());
      act(() => result.current.start());
      expect(result.current.state).toBe('running');

      act(() => { vi.advanceTimersByTime(3000); });
      expect(result.current.elapsed).toBe(3);
      expect(result.current.remaining).toBe(-1);
    });

    it('pauses and resumes', () => {
      const { result } = renderHook(() => useTimer());
      act(() => result.current.start());
      act(() => { vi.advanceTimersByTime(2000); });
      expect(result.current.elapsed).toBe(2);

      act(() => result.current.pause());
      expect(result.current.state).toBe('paused');
      act(() => { vi.advanceTimersByTime(5000); });
      expect(result.current.elapsed).toBe(2); // unchanged

      act(() => result.current.resume());
      expect(result.current.state).toBe('running');
      act(() => { vi.advanceTimersByTime(1000); });
      expect(result.current.elapsed).toBe(3);
    });

    it('reset returns to idle', () => {
      const { result } = renderHook(() => useTimer());
      act(() => result.current.start());
      act(() => { vi.advanceTimersByTime(4000); });
      act(() => result.current.reset());
      expect(result.current.state).toBe('idle');
      expect(result.current.elapsed).toBe(0);
    });
  });

  describe('countdown mode', () => {
    it('counts down and fires onComplete', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() => useTimer({ durationSec: 5, onComplete }));
      act(() => result.current.start());

      act(() => { vi.advanceTimersByTime(3000); });
      expect(result.current.remaining).toBe(2);
      expect(result.current.elapsed).toBe(3);

      act(() => { vi.advanceTimersByTime(2000); });
      // Allow microtask for completion callback
      act(() => { vi.advanceTimersByTime(0); });

      expect(result.current.state).toBe('complete');
      expect(result.current.remaining).toBe(0);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('fires onComplete only once', () => {
      const onComplete = vi.fn();
      const { result } = renderHook(() => useTimer({ durationSec: 2, onComplete }));
      act(() => result.current.start());
      act(() => { vi.advanceTimersByTime(5000); });
      act(() => { vi.advanceTimersByTime(0); });
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('remaining never goes below 0', () => {
      const { result } = renderHook(() => useTimer({ durationSec: 2 }));
      act(() => result.current.start());
      act(() => { vi.advanceTimersByTime(10000); });
      expect(result.current.remaining).toBe(0);
    });
  });

  describe('autoStart', () => {
    it('starts running immediately', () => {
      const { result } = renderHook(() => useTimer({ autoStart: true }));
      expect(result.current.state).toBe('running');
      act(() => { vi.advanceTimersByTime(2000); });
      expect(result.current.elapsed).toBe(2);
    });
  });

  describe('edge cases', () => {
    it('pause does nothing when idle', () => {
      const { result } = renderHook(() => useTimer());
      act(() => result.current.pause());
      expect(result.current.state).toBe('idle');
    });

    it('resume does nothing when idle', () => {
      const { result } = renderHook(() => useTimer());
      act(() => result.current.resume());
      expect(result.current.state).toBe('idle');
    });

    it('start resets elapsed if called while running', () => {
      const { result } = renderHook(() => useTimer());
      act(() => result.current.start());
      act(() => { vi.advanceTimersByTime(3000); });
      expect(result.current.elapsed).toBe(3);
      act(() => result.current.start());
      expect(result.current.elapsed).toBe(0);
    });
  });
});
