import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useShellKeyboardShortcuts } from '../../hooks/useShellKeyboardShortcuts';

vi.mock('../../utils/telemetry', () => ({
  trackEvent: vi.fn(),
}));

describe('useShellKeyboardShortcuts', () => {
  let onToggle: ReturnType<typeof vi.fn>;
  let onClose: ReturnType<typeof vi.fn>;
  let onNav: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onToggle = vi.fn();
    onClose = vi.fn();
    onNav = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const fire = (key: string, modifiers: Partial<KeyboardEventInit> = {}) => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, ...modifiers });
    window.dispatchEvent(event);
  };

  it('⌘K toggles palette', () => {
    renderHook(() =>
      useShellKeyboardShortcuts({ onTogglePalette: onToggle, onClosePalette: onClose }),
    );
    fire('k', { metaKey: true });
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('Ctrl+K toggles palette', () => {
    renderHook(() =>
      useShellKeyboardShortcuts({ onTogglePalette: onToggle, onClosePalette: onClose }),
    );
    fire('k', { ctrlKey: true });
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('Escape closes palette', () => {
    renderHook(() =>
      useShellKeyboardShortcuts({ onTogglePalette: onToggle, onClosePalette: onClose }),
    );
    fire('Escape');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('⌘1 navigates to first tab when tabs provided', () => {
    const tabs = [{ path: '/train' }, { path: '/review' }];
    renderHook(() =>
      useShellKeyboardShortcuts({
        tabs,
        onTogglePalette: onToggle,
        onClosePalette: onClose,
        onNavigate: onNav,
      }),
    );
    fire('1', { metaKey: true });
    expect(onNav).toHaveBeenCalledWith('/train');
  });

  it('⌘2 navigates to second tab', () => {
    const tabs = [{ path: '/train' }, { path: '/review' }];
    renderHook(() =>
      useShellKeyboardShortcuts({
        tabs,
        onTogglePalette: onToggle,
        onClosePalette: onClose,
        onNavigate: onNav,
      }),
    );
    fire('2', { metaKey: true });
    expect(onNav).toHaveBeenCalledWith('/review');
  });

  it('digit without tabs does nothing', () => {
    renderHook(() =>
      useShellKeyboardShortcuts({ onTogglePalette: onToggle, onClosePalette: onClose }),
    );
    fire('1', { metaKey: true });
    expect(onToggle).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('digit out of range does nothing', () => {
    const tabs = [{ path: '/train' }];
    renderHook(() =>
      useShellKeyboardShortcuts({
        tabs,
        onTogglePalette: onToggle,
        onClosePalette: onClose,
        onNavigate: onNav,
      }),
    );
    fire('5', { metaKey: true });
    expect(onNav).not.toHaveBeenCalled();
  });
});
