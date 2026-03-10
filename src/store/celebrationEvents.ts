/**
 * Celebration event types emitted when XP/level/badge changes are detected.
 */

export interface LevelUpEvent {
  kind: 'level-up';
  previousLevel: number;
  newLevel: number;
}

export interface BadgeUnlockEvent {
  kind: 'badge-unlock';
  badgeId: string;
}

export interface XPGainEvent {
  kind: 'xp-gain';
  amount: number;
  newTotal: number;
}

export type CelebrationEvent = LevelUpEvent | BadgeUnlockEvent | XPGainEvent;

type CelebrationListener = (event: CelebrationEvent) => void;

const listeners = new Set<CelebrationListener>();

/**
 * Emit a celebration event to all registered listeners.
 */
export const emitCelebration = (event: CelebrationEvent): void => {
  listeners.forEach((fn) => fn(event));
};

/**
 * Subscribe to celebration events. Returns an unsubscribe function.
 */
export const subscribeCelebrations = (cb: CelebrationListener): (() => void) => {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
};

/**
 * Detect celebration-worthy changes between two progress snapshots.
 * Returns an array of events to emit (can be empty).
 */
export const detectCelebrations = (
  before: { xp: number; level: number; badges: string[] },
  after: { xp: number; level: number; badges: string[] },
): CelebrationEvent[] => {
  const events: CelebrationEvent[] = [];

  const xpDelta = after.xp - before.xp;
  if (xpDelta > 0) {
    events.push({ kind: 'xp-gain', amount: xpDelta, newTotal: after.xp });
  }

  if (after.level > before.level) {
    events.push({ kind: 'level-up', previousLevel: before.level, newLevel: after.level });
  }

  const newBadges = after.badges.filter((b) => !before.badges.includes(b));
  for (const badgeId of newBadges) {
    events.push({ kind: 'badge-unlock', badgeId });
  }

  return events;
};
