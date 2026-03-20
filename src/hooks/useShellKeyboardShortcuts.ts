import { useEffect } from 'react';
import { trackEvent } from '../utils/telemetry';

interface ShellKeyboardOptions {
  /** Tab list for ⌘1-9 navigation (only used in AppShell-style shells) */
  tabs?: Array<{ path: string }>;
  /** Called when ⌘K is pressed — should toggle palette visibility */
  onTogglePalette: () => void;
  /** Called on Escape — should close the palette */
  onClosePalette: () => void;
  /** Called when ⌘digit selects a tab */
  onNavigate?: (path: string) => void;
}

/**
 * Shared keyboard shortcuts for both AppShell and MissionShell:
 * - ⌘/Ctrl + K → toggle action palette
 * - Escape → close palette
 * - ⌘/Ctrl + 1-9 → jump to tab (when tabs provided)
 */
export const useShellKeyboardShortcuts = ({
  tabs,
  onTogglePalette,
  onClosePalette,
  onNavigate,
}: ShellKeyboardOptions): void => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey)) {
        if (event.key === 'Escape') onClosePalette();
        return;
      }

      const key = event.key.toLowerCase();

      if (key === 'k') {
        event.preventDefault();
        onTogglePalette();
        return;
      }

      if (tabs && onNavigate) {
        const digit = parseInt(key, 10);
        if (digit >= 1 && digit <= tabs.length) {
          event.preventDefault();
          const target = tabs[digit - 1];
          trackEvent({
            category: 'ia',
            action: 'tab_view',
            route: target.path,
            data: { source: 'keyboard', shortcut: `⌘${digit}` },
            source: 'ui',
          });
          onNavigate(target.path);
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [tabs, onTogglePalette, onClosePalette, onNavigate]);
};
