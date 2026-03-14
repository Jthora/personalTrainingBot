import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock featureFlags before importing SUT
vi.mock('../../config/featureFlags', () => ({
  isFeatureEnabled: vi.fn(),
}));

import { resolveShellRoute } from '../../utils/resolveShellRoute';
import { isFeatureEnabled } from '../../config/featureFlags';

const mockFlag = vi.mocked(isFeatureEnabled);

describe('resolveShellRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('shellV2 disabled', () => {
    beforeEach(() => mockFlag.mockReturnValue(false));

    it('passes through mission paths unchanged', () => {
      expect(resolveShellRoute('/mission/checklist')).toBe('/mission/checklist');
    });

    it('passes through query strings unchanged', () => {
      expect(resolveShellRoute('/mission/quiz?mode=review')).toBe('/mission/quiz?mode=review');
    });
  });

  describe('shellV2 enabled', () => {
    beforeEach(() => mockFlag.mockReturnValue(true));

    it.each([
      ['/mission/checklist', '/train'],
      ['/mission/training', '/train'],
      ['/mission/stats', '/progress'],
      ['/mission/signal', '/review'],
      ['/mission/debrief', '/profile'],
      ['/mission/plan', '/train'],
    ])('maps %s → %s', (input, expected) => {
      expect(resolveShellRoute(input)).toBe(expected);
    });

    it('preserves query strings through mapping', () => {
      expect(resolveShellRoute('/mission/quiz?mode=review')).toBe('/train?mode=review');
    });

    it('passes through unknown paths unchanged', () => {
      expect(resolveShellRoute('/unknown/thing')).toBe('/unknown/thing');
    });
  });
});
