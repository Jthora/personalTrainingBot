import React from 'react';
import { useCelebrations } from '../../hooks/useCelebrations';
import LevelUpModal from '../LevelUpModal/LevelUpModal';
import BadgeToast from '../BadgeToast/BadgeToast';
import XPTicker from '../XPTicker/XPTicker';

/**
 * CelebrationLayer — renders celebration UI for the current event in the queue.
 * Mount this once near the app root (inside the feature-flag gate).
 * Events are consumed sequentially: dismiss/timeout advances to the next.
 */
const CelebrationLayer: React.FC = () => {
  const { current, dismiss } = useCelebrations();

  if (!current) return null;

  switch (current.kind) {
    case 'level-up':
      return (
        <LevelUpModal
          previousLevel={current.previousLevel}
          newLevel={current.newLevel}
          onDismiss={dismiss}
        />
      );
    case 'badge-unlock':
      return (
        <BadgeToast
          badgeId={current.badgeId}
          onDismiss={dismiss}
        />
      );
    case 'xp-gain':
      return (
        <XPTicker
          amount={current.amount}
          onDone={dismiss}
        />
      );
    default:
      return null;
  }
};

export default CelebrationLayer;
