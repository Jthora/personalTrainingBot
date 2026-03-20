import { describe, expect, it } from 'vitest';
import dayjs from 'dayjs';
import {
  rotateChallengesIfNeeded,
  applyChallengeProgress,
  claimChallengeReward,
  getPendingChallengeReminders,
} from '../challenges';
import type { ChallengeDefinition } from '../../data/challengeCatalog';
import type { ChallengeInstance } from '../../types/Challenge';

const CATALOG: ChallengeDefinition[] = [
  { id: 'daily_a', title: 'Daily A', description: 'd', timeframe: 'daily', target: 20, unit: 'minutes', rewardXp: 50 },
  { id: 'daily_b', title: 'Daily B', description: 'd', timeframe: 'daily', target: 2, unit: 'missions', rewardXp: 60 },
  { id: 'weekly_a', title: 'Weekly A', description: 'w', timeframe: 'weekly', target: 90, unit: 'minutes', rewardXp: 120 },
  { id: 'weekly_b', title: 'Weekly B', description: 'w', timeframe: 'weekly', target: 5, unit: 'missions', rewardXp: 140 },
];

const TODAY = '2026-03-11';

const makeFresh = (def: ChallengeDefinition, todayIso: string): ChallengeInstance => {
  const start = dayjs(todayIso).startOf(def.timeframe === 'daily' ? 'day' : 'week');
  const end = dayjs(todayIso).endOf(def.timeframe === 'daily' ? 'day' : 'week');
  return {
    id: def.id,
    title: def.title,
    description: def.description,
    rewardXp: def.rewardXp,
    timeframe: def.timeframe,
    unit: def.unit,
    startsAt: start.toISOString(),
    endsAt: end.toISOString(),
    progress: 0,
    target: def.target,
    completed: false,
    claimed: false,
  };
};

describe('challenges', () => {
  describe('rotateChallengesIfNeeded', () => {
    it('spawns daily and weekly challenges from empty state', () => {
      const result = rotateChallengesIfNeeded([], TODAY, CATALOG);
      expect(result.challenges.length).toBe(2);
      const daily = result.challenges.find((c) => c.timeframe === 'daily');
      const weekly = result.challenges.find((c) => c.timeframe === 'weekly');
      expect(daily).toBeDefined();
      expect(weekly).toBeDefined();
    });

    it('keeps active challenges that have not expired', () => {
      const existing = [makeFresh(CATALOG[0], TODAY), makeFresh(CATALOG[2], TODAY)];
      const result = rotateChallengesIfNeeded(existing, TODAY, CATALOG);
      expect(result.challenges).toEqual(existing);
      expect(result.expiredIds).toEqual([]);
    });

    it('replaces expired challenges and records expired IDs', () => {
      const yesterday = dayjs(TODAY).subtract(2, 'day').format('YYYY-MM-DD');
      const expired = [makeFresh(CATALOG[0], yesterday)]; // daily from 2 days ago
      const result = rotateChallengesIfNeeded(expired, TODAY, CATALOG);
      expect(result.expiredIds).toContain(expired[0].id);
      const daily = result.challenges.find((c) => c.timeframe === 'daily');
      expect(daily).toBeDefined();
      // Should rotate to next daily candidate
    });

    it('spawned challenges have valid time windows', () => {
      const result = rotateChallengesIfNeeded([], TODAY, CATALOG);
      const daily = result.challenges.find((c) => c.timeframe === 'daily')!;
      expect(dayjs(daily.startsAt).isSame(dayjs(TODAY).startOf('day'))).toBe(true);
      expect(dayjs(daily.endsAt).isSame(dayjs(TODAY).endOf('day'))).toBe(true);
    });
  });

  describe('applyChallengeProgress', () => {
    it('increments minutes-based challenge progress', () => {
      const challenges = [makeFresh(CATALOG[0], TODAY)]; // daily_a: 20 min target
      const result = applyChallengeProgress(challenges, { minutesDelta: 10, asOfDate: TODAY });
      expect(result[0].progress).toBe(10);
      expect(result[0].completed).toBe(false);
    });

    it('marks challenge completed when target reached', () => {
      const challenges = [makeFresh(CATALOG[0], TODAY)];
      const result = applyChallengeProgress(challenges, { minutesDelta: 25, asOfDate: TODAY });
      expect(result[0].progress).toBe(25);
      expect(result[0].completed).toBe(true);
    });

    it('does not apply progress outside challenge window', () => {
      const challenges = [makeFresh(CATALOG[0], TODAY)];
      const tomorrow = dayjs(TODAY).add(2, 'day').format('YYYY-MM-DD');
      const result = applyChallengeProgress(challenges, { minutesDelta: 10, asOfDate: tomorrow });
      expect(result[0].progress).toBe(0);
    });

    it('increments missions-based challenge progress', () => {
      const challenges = [makeFresh(CATALOG[1], TODAY)]; // daily_b: 2 missions target
      const result = applyChallengeProgress(challenges, { missionsDelta: 1, asOfDate: TODAY });
      expect(result[0].progress).toBe(1);
    });
  });

  describe('claimChallengeReward', () => {
    it('claims completed challenge and awards XP', () => {
      const challenge = { ...makeFresh(CATALOG[0], TODAY), progress: 25, completed: true };
      const result = claimChallengeReward({ challenges: [challenge] }, challenge.id);
      expect(result.claimed).toBe(true);
      expect(result.xpAwarded).toBe(50);
      expect(result.progress.challenges[0].claimed).toBe(true);
    });

    it('refuses to claim incomplete challenge', () => {
      const challenge = makeFresh(CATALOG[0], TODAY);
      const result = claimChallengeReward({ challenges: [challenge] }, challenge.id);
      expect(result.claimed).toBe(false);
      expect(result.xpAwarded).toBe(0);
    });

    it('refuses to claim already-claimed challenge', () => {
      const challenge = { ...makeFresh(CATALOG[0], TODAY), progress: 25, completed: true, claimed: true };
      const result = claimChallengeReward({ challenges: [challenge] }, challenge.id);
      expect(result.claimed).toBe(false);
      expect(result.xpAwarded).toBe(0);
    });

    it('returns unchanged state for unknown ID', () => {
      const challenge = makeFresh(CATALOG[0], TODAY);
      const result = claimChallengeReward({ challenges: [challenge] }, 'unknown');
      expect(result.claimed).toBe(false);
      expect(result.xpAwarded).toBe(0);
    });
  });

  describe('getPendingChallengeReminders', () => {
    it('returns active incomplete challenges within window', () => {
      const challenges = [makeFresh(CATALOG[0], TODAY), makeFresh(CATALOG[2], TODAY)];
      const reminders = getPendingChallengeReminders(challenges, TODAY);
      expect(reminders.length).toBe(2);
    });

    it('excludes completed and claimed challenges', () => {
      const completed = { ...makeFresh(CATALOG[0], TODAY), completed: true };
      const claimed = { ...makeFresh(CATALOG[2], TODAY), claimed: true };
      const reminders = getPendingChallengeReminders([completed, claimed], TODAY);
      expect(reminders.length).toBe(0);
    });
  });
});
