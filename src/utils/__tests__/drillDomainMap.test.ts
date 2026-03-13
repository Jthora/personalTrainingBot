import { describe, it, expect, vi, beforeEach } from 'vitest';
import { resolveDomainForDrillCategory, buildDrillDomainMap } from '../drillDomainMap';

const mockCache = new Map<string, any>();

vi.mock('../../cache/DrillCategoryCache', () => ({
  default: {
    getInstance: vi.fn(() => ({ cache: mockCache })),
  },
}));

const makeDrill = (id: string) => ({ id, name: id, description: '', duration: '10min', intensity: 'moderate', difficulty_range: [1, 3] });

beforeEach(() => {
  mockCache.clear();
  mockCache.set('fitness', {
    id: 'fitness',
    name: 'Fitness',
    subCategories: [
      {
        id: 'sub-cardio',
        name: 'Cardio',
        drillGroups: [
          { id: 'grp-1', name: 'Running', drills: [makeDrill('morning_jog'), makeDrill('interval_sprint')] },
        ],
      },
    ],
  });
  mockCache.set('combat', {
    id: 'combat',
    name: 'Combat',
    subCategories: [
      {
        id: 'sub-striking',
        name: 'Striking',
        drillGroups: [
          { id: 'grp-2', name: 'Boxing', drills: [makeDrill('jab_cross_combo')] },
        ],
      },
    ],
  });
});

describe('drillDomainMap', () => {
  it('resolves drill ID to its parent category (domain) ID', () => {
    expect(resolveDomainForDrillCategory('morning_jog')).toBe('fitness');
    expect(resolveDomainForDrillCategory('interval_sprint')).toBe('fitness');
    expect(resolveDomainForDrillCategory('jab_cross_combo')).toBe('combat');
  });

  it('returns undefined for unknown drill ID', () => {
    expect(resolveDomainForDrillCategory('nonexistent_drill')).toBeUndefined();
  });

  it('buildDrillDomainMap returns complete map', () => {
    const map = buildDrillDomainMap();
    expect(map.size).toBe(3);
    expect(map.get('morning_jog')).toBe('fitness');
    expect(map.get('interval_sprint')).toBe('fitness');
    expect(map.get('jab_cross_combo')).toBe('combat');
  });
});
