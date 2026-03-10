import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useIsMobile from '../useIsMobile';

let matchMediaListeners: Map<string, Set<() => void>>;
let matchMediaMatches: Map<string, boolean>;

beforeEach(() => {
  matchMediaListeners = new Map();
  matchMediaMatches = new Map();

  vi.stubGlobal('matchMedia', (query: string) => {
    if (!matchMediaListeners.has(query)) matchMediaListeners.set(query, new Set());
    const mql = {
      get matches() {
        return matchMediaMatches.get(query) ?? false;
      },
      media: query,
      addEventListener(_: string, cb: () => void) {
        matchMediaListeners.get(query)!.add(cb);
      },
      removeEventListener(_: string, cb: () => void) {
        matchMediaListeners.get(query)!.delete(cb);
      },
    };
    return mql;
  });
});

const fire = (query: string) => {
  matchMediaListeners.get(query)?.forEach((fn) => fn());
};

describe('useIsMobile', () => {
  it('returns false when viewport exceeds breakpoint', () => {
    matchMediaMatches.set('(max-width: 768px)', false);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('returns true when viewport is at or below breakpoint', () => {
    matchMediaMatches.set('(max-width: 768px)', true);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('responds to matchMedia change events', () => {
    matchMediaMatches.set('(max-width: 768px)', false);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    act(() => {
      matchMediaMatches.set('(max-width: 768px)', true);
      fire('(max-width: 768px)');
    });
    expect(result.current).toBe(true);
  });

  it('accepts a custom breakpoint', () => {
    matchMediaMatches.set('(max-width: 500px)', true);
    const { result } = renderHook(() => useIsMobile(500));
    expect(result.current).toBe(true);
  });
});
