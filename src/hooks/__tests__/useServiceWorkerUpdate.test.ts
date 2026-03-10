import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useServiceWorkerUpdate } from '../useServiceWorkerUpdate';

let controllerChangeListener: (() => void) | null = null;
let readyResolve: ((reg: { waiting: ServiceWorker | null }) => void) | null = null;

beforeEach(() => {
  controllerChangeListener = null;
  readyResolve = null;

  const swContainer = {
    addEventListener: vi.fn((_evt: string, cb: () => void) => {
      controllerChangeListener = cb;
    }),
    removeEventListener: vi.fn(),
    ready: new Promise<{ waiting: ServiceWorker | null }>((resolve) => {
      readyResolve = resolve;
    }),
  };

  Object.defineProperty(navigator, 'serviceWorker', {
    value: swContainer,
    writable: true,
    configurable: true,
  });
});

describe('useServiceWorkerUpdate', () => {
  it('starts with updateAvailable false', () => {
    const { result } = renderHook(() => useServiceWorkerUpdate());
    expect(result.current.updateAvailable).toBe(false);
  });

  it('sets updateAvailable when controllerchange fires', () => {
    const { result } = renderHook(() => useServiceWorkerUpdate());

    act(() => {
      controllerChangeListener?.();
    });
    expect(result.current.updateAvailable).toBe(true);
  });

  it('sets updateAvailable when a waiting SW exists on ready', async () => {
    const { result } = renderHook(() => useServiceWorkerUpdate());

    await act(async () => {
      readyResolve?.({ waiting: {} as ServiceWorker });
    });
    expect(result.current.updateAvailable).toBe(true);
  });

  it('applyUpdate calls location.reload', () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: reloadMock },
      writable: true,
      configurable: true,
    });

    const { result } = renderHook(() => useServiceWorkerUpdate());
    result.current.applyUpdate();
    expect(reloadMock).toHaveBeenCalled();
  });
});
