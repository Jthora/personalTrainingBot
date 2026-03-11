import { describe, it, expect, vi } from 'vitest';
import {
  emitCelebration,
  subscribeCelebrations,
  detectCelebrations,
  CelebrationEvent,
} from '../celebrationEvents';

describe('celebrationEvents', () => {
  describe('pub/sub', () => {
    it('delivers events to subscribers', () => {
      const cb = vi.fn();
      const unsub = subscribeCelebrations(cb);

      const event: CelebrationEvent = { kind: 'xp-gain', amount: 50, newTotal: 150 };
      emitCelebration(event);

      expect(cb).toHaveBeenCalledWith(event);
      unsub();
    });

    it('unsubscribe stops delivery', () => {
      const cb = vi.fn();
      const unsub = subscribeCelebrations(cb);
      unsub();

      emitCelebration({ kind: 'xp-gain', amount: 10, newTotal: 10 });
      expect(cb).not.toHaveBeenCalled();
    });

    it('delivers to multiple subscribers', () => {
      const cb1 = vi.fn();
      const cb2 = vi.fn();
      const unsub1 = subscribeCelebrations(cb1);
      const unsub2 = subscribeCelebrations(cb2);

      const event: CelebrationEvent = { kind: 'level-up', previousLevel: 1, newLevel: 2 };
      emitCelebration(event);

      expect(cb1).toHaveBeenCalledWith(event);
      expect(cb2).toHaveBeenCalledWith(event);
      unsub1();
      unsub2();
    });
  });

  describe('detectCelebrations', () => {
    const base = { xp: 100, level: 1, badges: ['streak_3'] };

    it('returns empty array when nothing changes', () => {
      expect(detectCelebrations(base, { ...base })).toEqual([]);
    });

    it('detects XP gain', () => {
      const after = { ...base, xp: 200 };
      const events = detectCelebrations(base, after);
      expect(events).toContainEqual({ kind: 'xp-gain', amount: 100, newTotal: 200 });
    });

    it('detects level-up', () => {
      const after = { ...base, xp: 600, level: 2 };
      const events = detectCelebrations(base, after);
      expect(events).toContainEqual({ kind: 'level-up', previousLevel: 1, newLevel: 2 });
    });

    it('detects badge unlocks', () => {
      const after = { ...base, badges: ['streak_3', 'streak_7'] };
      const events = detectCelebrations(base, after);
      expect(events).toContainEqual({ kind: 'badge-unlock', badgeId: 'streak_7' });
    });

    it('detects multiple events at once', () => {
      const after = { xp: 600, level: 2, badges: ['streak_3', 'completion_10'] };
      const events = detectCelebrations(base, after);
      expect(events.length).toBe(3); // xp-gain, level-up, badge-unlock
      expect(events.map((e) => e.kind)).toContain('xp-gain');
      expect(events.map((e) => e.kind)).toContain('level-up');
      expect(events.map((e) => e.kind)).toContain('badge-unlock');
    });

    it('does not emit xp-gain when xp decreases', () => {
      const after = { ...base, xp: 50 };
      const events = detectCelebrations(base, after);
      expect(events.filter((e) => e.kind === 'xp-gain')).toHaveLength(0);
    });
  });
});
