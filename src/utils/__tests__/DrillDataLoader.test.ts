import { describe, it, expect, vi, beforeEach } from 'vitest';
import DrillDataLoader from '../DrillDataLoader';

// Mock dependencies
vi.mock('../drillCategoryPaths', () => ({
  drillCategoryPaths: {
    cat1: () => Promise.resolve({
      default: {
        name: 'Category One',
        description: 'First category',
        subcategories: { sub1: 'Sub Category One' },
      },
    }),
  },
}));

vi.mock('../drillSubCategoryPaths', () => ({
  drillSubCategoryPaths: {
    cat1_sub1: () => Promise.resolve({
      default: {
        name: 'Sub One',
        description: 'First subcategory',
        drill_groups: [
          {
            name: 'Group Alpha',
            description: 'Alpha group',
            drills: [
              { name: 'Drill A', description: 'First drill', duration: '10m', intensity: 'low', difficulty_range: [1, 5] },
              { name: 'Drill B', description: 'Second drill', duration: '15m', intensity: 'high', difficulty_range: [3, 8] },
            ],
          },
        ],
      },
    }),
  },
}));

vi.mock('../../config/featureFlags', () => ({
  isFeatureEnabled: vi.fn(() => false),
}));

vi.mock('../cache/indexedDbCache', () => ({
  withCache: vi.fn(),
}));

describe('DrillDataLoader', () => {
  let loader: DrillDataLoader;

  beforeEach(() => {
    loader = new DrillDataLoader();
  });

  it('loadAllData returns drill categories with subcategories and drills', async () => {
    const onProgress = vi.fn();
    const categories = await loader.loadAllData(onProgress);

    expect(categories).toHaveLength(1);
    expect(categories[0].name).toBe('Category One');
    expect(categories[0].subCategories).toHaveLength(1);
    expect(categories[0].subCategories[0].name).toBe('Sub One');
    expect(categories[0].subCategories[0].drillGroups).toHaveLength(1);
    expect(categories[0].subCategories[0].drillGroups[0].drills).toHaveLength(2);
    expect(onProgress).toHaveBeenCalled();
  });

  it('calls onPartialFailure when subcategory loader fails', async () => {
    const { drillSubCategoryPaths } = await import('../drillSubCategoryPaths');
    (drillSubCategoryPaths as any).cat1_sub1 = () => Promise.reject(new Error('network error'));

    const onProgress = vi.fn();
    const onPartialFailure = vi.fn();
    const categories = await loader.loadAllData(onProgress, onPartialFailure);

    expect(categories).toHaveLength(1);
    expect(onPartialFailure).toHaveBeenCalledWith(expect.stringContaining('sub1'));
    // Fallback subcategory created
    expect(categories[0].subCategories[0].name).toBe('Unknown Subcategory');
  });

  it('returns empty array when category loader throws', async () => {
    const { drillCategoryPaths } = await import('../drillCategoryPaths');
    (drillCategoryPaths as any).cat1 = () => Promise.reject(new Error('fatal'));

    const onProgress = vi.fn();
    const onPartialFailure = vi.fn();
    const categories = await loader.loadAllData(onProgress, onPartialFailure);

    expect(categories).toHaveLength(1);
    expect(categories[0].name).toBe('Unknown Category');
    expect(onPartialFailure).toHaveBeenCalled();
  });

  it('handles invalid category data gracefully', async () => {
    const { drillCategoryPaths } = await import('../drillCategoryPaths');
    (drillCategoryPaths as any).cat1 = () => Promise.resolve({ default: { name: 123 } });

    const onProgress = vi.fn();
    const onPartialFailure = vi.fn();
    const categories = await loader.loadAllData(onProgress, onPartialFailure);

    expect(categories).toHaveLength(1);
    expect(categories[0].name).toBe('Unknown Category');
  });

  it('resolves ES module default exports', async () => {
    const { drillCategoryPaths } = await import('../drillCategoryPaths');
    (drillCategoryPaths as any).cat1 = () => Promise.resolve({
      default: { name: 'Wrapped', description: 'desc', subcategories: {} },
    });

    const categories = await loader.loadAllData(vi.fn());
    expect(categories[0].name).toBe('Wrapped');
  });

  it('loadAllData returns empty array on top-level failure', async () => {
    const { drillCategoryPaths } = await import('../drillCategoryPaths');
    // Remove all category paths to simulate total failure
    const origKeys = Object.keys(drillCategoryPaths);
    origKeys.forEach(k => delete (drillCategoryPaths as any)[k]);

    const categories = await loader.loadAllData(vi.fn());
    expect(categories).toEqual([]);
  });
});
