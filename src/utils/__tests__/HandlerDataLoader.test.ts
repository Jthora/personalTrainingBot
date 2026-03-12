import { describe, it, expect, vi, beforeEach } from 'vitest';
import HandlerDataLoader from '../HandlerDataLoader';

describe('HandlerDataLoader', () => {
  let loader: HandlerDataLoader;

  beforeEach(() => {
    vi.useFakeTimers();
    loader = new HandlerDataLoader();
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('loadAllData returns a complete HandlerDataBundle', async () => {
    const promise = loader.loadAllData();
    await vi.advanceTimersByTimeAsync(600);
    const result = await promise;
    expect(result).toHaveProperty('handlerData');
    expect(result).toHaveProperty('ranks');
    expect(result).toHaveProperty('difficultyLevels');
    expect(result).toHaveProperty('trainingChallenges');
    expect(Array.isArray(result.ranks)).toBe(true);
    expect(Array.isArray(result.difficultyLevels)).toBe(true);
  });

  it('getRanks maps JSON to DrillRank objects', () => {
    const ranks = loader.getRanks();
    expect(Array.isArray(ranks)).toBe(true);
    if (ranks.length > 0) {
      expect(ranks[0]).toHaveProperty('name');
      expect(ranks[0]).toHaveProperty('description');
    }
  });

  it('getDifficultyLevels maps JSON to DrillDifficultyLevel objects', () => {
    const levels = loader.getDifficultyLevels();
    expect(Array.isArray(levels)).toBe(true);
    if (levels.length > 0) {
      expect(levels[0]).toHaveProperty('name');
      expect(levels[0]).toHaveProperty('level');
    }
  });

  it('getHandlerData returns empty before load', () => {
    expect(loader.getHandlerData()).toEqual({});
  });
});
