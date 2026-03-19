import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import CacheIndicator from '../CacheIndicator';

const getStatus = () => screen.getByRole('status', { hidden: true });
const isHidden = (el: HTMLElement) => el.className.includes('hidden');

describe('CacheIndicator', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('is hidden by default', () => {
    render(<CacheIndicator />);
    expect(isHidden(getStatus())).toBe(true);
  });

  it('shows message on ptb-cache-status event', () => {
    render(<CacheIndicator />);
    act(() => {
      window.dispatchEvent(
        new CustomEvent('ptb-cache-status', {
          detail: { store: 'schedules', key: 'k', source: 'cache' },
        }),
      );
    });
    const el = getStatus();
    expect(isHidden(el)).toBe(false);
    expect(el.textContent).toMatch(/Cached data in use/i);
  });

  it('auto-hides after 4 seconds', () => {
    render(<CacheIndicator />);
    act(() => {
      window.dispatchEvent(
        new CustomEvent('ptb-cache-status', {
          detail: { store: 'schedules', key: 'k', source: 'cache' },
        }),
      );
    });
    expect(isHidden(getStatus())).toBe(false);

    act(() => {
      vi.advanceTimersByTime(4001);
    });
    expect(isHidden(getStatus())).toBe(true);
  });

  it('hides immediately when source is network', () => {
    render(<CacheIndicator />);
    act(() => {
      window.dispatchEvent(
        new CustomEvent('ptb-cache-status', {
          detail: { store: 'data', key: 'k', source: 'cache' },
        }),
      );
    });
    expect(isHidden(getStatus())).toBe(false);

    act(() => {
      window.dispatchEvent(
        new CustomEvent('ptb-cache-status', {
          detail: { store: 'data', key: 'k', source: 'network' },
        }),
      );
    });
    expect(isHidden(getStatus())).toBe(true);
  });
});
