import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInstallPrompt } from '../useInstallPrompt';

describe('useInstallPrompt', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    matchMediaMock = vi.fn().mockReturnValue({ matches: false });
    Object.defineProperty(window, 'matchMedia', { value: matchMediaMock, writable: true });
  });

  it('starts with canInstall false and isInstalled false', () => {
    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.canInstall).toBe(false);
    expect(result.current.isInstalled).toBe(false);
  });

  it('detects standalone mode as installed', () => {
    matchMediaMock.mockReturnValue({ matches: true });
    const { result } = renderHook(() => useInstallPrompt());
    expect(result.current.isInstalled).toBe(true);
    expect(result.current.canInstall).toBe(false);
  });

  it('captures beforeinstallprompt and sets canInstall', () => {
    const { result } = renderHook(() => useInstallPrompt());

    act(() => {
      const event = new Event('beforeinstallprompt');
      (event as any).prompt = vi.fn();
      (event as any).userChoice = Promise.resolve({ outcome: 'accepted' });
      window.dispatchEvent(event);
    });

    expect(result.current.canInstall).toBe(true);
  });

  it('promptInstall calls prompt and returns true on accepted', async () => {
    const promptFn = vi.fn();
    const { result } = renderHook(() => useInstallPrompt());

    act(() => {
      const event = new Event('beforeinstallprompt');
      (event as any).prompt = promptFn;
      (event as any).userChoice = Promise.resolve({ outcome: 'accepted' });
      window.dispatchEvent(event);
    });

    let accepted: boolean = false;
    await act(async () => {
      accepted = await result.current.promptInstall();
    });

    expect(promptFn).toHaveBeenCalled();
    expect(accepted).toBe(true);
    expect(result.current.canInstall).toBe(false);
  });

  it('sets isInstalled on appinstalled event', () => {
    const { result } = renderHook(() => useInstallPrompt());

    act(() => {
      window.dispatchEvent(new Event('appinstalled'));
    });

    expect(result.current.isInstalled).toBe(true);
    expect(result.current.canInstall).toBe(false);
  });
});
