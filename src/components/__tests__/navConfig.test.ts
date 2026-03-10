import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockIsFeatureEnabled = vi.hoisted(() => vi.fn(() => false));

vi.mock('../../config/featureFlags', () => ({
  isFeatureEnabled: mockIsFeatureEnabled,
}));

import { headerNavItems, resolveHeaderNavItems } from '../Header/navConfig';

beforeEach(() => {
  mockIsFeatureEnabled.mockReset().mockReturnValue(false);
});

describe('navConfig', () => {
  it('headerNavItems contains 6 core items', () => {
    expect(headerNavItems).toHaveLength(6);
    expect(headerNavItems.map((i) => i.label)).toEqual([
      'Brief', 'Triage', 'Case', 'Signal', 'Checklist', 'Debrief',
    ]);
  });

  it('resolveHeaderNavItems returns 6 items when no feature flags are enabled', () => {
    const resolved = resolveHeaderNavItems();
    expect(resolved).toHaveLength(6);
    resolved.forEach((item) => {
      expect(item.navigatePath).toBe(item.path);
      expect(item.activePaths).toEqual([item.path]);
    });
  });

  it('resolveHeaderNavItems includes Stats when statsSurface is enabled', () => {
    mockIsFeatureEnabled.mockImplementation((key: string) => key === 'statsSurface');
    const resolved = resolveHeaderNavItems();
    expect(resolved).toHaveLength(7);
    expect(resolved.find((i) => i.label === 'Stats')).toBeTruthy();
  });

  it('resolveHeaderNavItems includes Plan when planSurface is enabled', () => {
    mockIsFeatureEnabled.mockImplementation((key: string) => key === 'planSurface');
    const resolved = resolveHeaderNavItems();
    expect(resolved).toHaveLength(7);
    expect(resolved.find((i) => i.label === 'Plan')).toBeTruthy();
  });

  it('resolveHeaderNavItems includes both Stats and Plan when both flags are on', () => {
    mockIsFeatureEnabled.mockReturnValue(true);
    const resolved = resolveHeaderNavItems();
    expect(resolved).toHaveLength(8);
    expect(resolved.find((i) => i.label === 'Stats')).toBeTruthy();
    expect(resolved.find((i) => i.label === 'Plan')).toBeTruthy();
  });
});
