import { describe, it, expect } from 'vitest';
import { headerNavItems, resolveHeaderNavItems } from '../Header/navConfig';

describe('navConfig', () => {
  it('headerNavItems contains 6 core items', () => {
    expect(headerNavItems).toHaveLength(6);
    expect(headerNavItems.map((i) => i.label)).toEqual([
      'Brief', 'Triage', 'Case', 'Signal', 'Checklist', 'Debrief',
    ]);
  });

  it('resolveHeaderNavItems returns 8 items including Stats and Plan', () => {
    const resolved = resolveHeaderNavItems();
    expect(resolved).toHaveLength(8);
    expect(resolved.find((i) => i.label === 'Stats')).toBeTruthy();
    expect(resolved.find((i) => i.label === 'Plan')).toBeTruthy();
    resolved.forEach((item) => {
      expect(item.navigatePath).toBe(item.path);
      expect(item.activePaths).toEqual([item.path]);
    });
  });
});
