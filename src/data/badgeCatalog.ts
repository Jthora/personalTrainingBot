export type BadgeRarity = 'common' | 'rare' | 'epic';

// Rarity is for visuals only; unlock logic should not depend on it.
export interface BadgeDefinition {
    id: string;
    name: string;
    description: string;
    rarity: BadgeRarity;
    icon?: string;
    tierGroup?: string; // shared identifier for tiered badges (e.g., streak, completions)
    tier?: number; // 1-based tier index within the group
    maxTier?: number; // total tiers available in the group (for UI affordances)
    colorTokenId?: string; // maps to badge visual tokens; defaults to rarity
    artworkTokenId?: string; // maps to badge artwork token; optional override per badge
}

const BADGE_CATALOG: BadgeDefinition[] = [
    { id: 'streak_3', name: 'Warm Streak', description: 'Complete 3 consecutive mission days', rarity: 'common', icon: '🔥', tierGroup: 'streak', tier: 1, maxTier: 3, artworkTokenId: 'streak' },
    { id: 'streak_7', name: 'Persistent Operative', description: 'Complete 7 consecutive mission days', rarity: 'rare', icon: '🛡️', tierGroup: 'streak', tier: 2, maxTier: 3, artworkTokenId: 'streak' },
    { id: 'streak_30', name: 'Iron Protocol', description: 'Complete 30 consecutive mission days', rarity: 'epic', icon: '🏆', tierGroup: 'streak', tier: 3, maxTier: 3, artworkTokenId: 'streak' },
    { id: 'minutes_60', name: 'Deep Cover', description: 'Log 60 minutes of operations in a single day', rarity: 'common', icon: '⏱️', artworkTokenId: 'time' },
    { id: 'minutes_300', name: 'Extended Op', description: 'Log 300 minutes of operations in a single week', rarity: 'rare', icon: '✈️', artworkTokenId: 'time' },
    { id: 'completion_10', name: 'Field Initiate', description: 'Complete 10 mission drills', rarity: 'common', icon: '✅', tierGroup: 'completions', tier: 1, maxTier: 3, artworkTokenId: 'completion' },
    { id: 'completion_50', name: 'Signal Analyst', description: 'Complete 50 mission drills', rarity: 'rare', icon: '🧭', tierGroup: 'completions', tier: 2, maxTier: 3, artworkTokenId: 'completion' },
    { id: 'completion_100', name: 'Ace Operative', description: 'Complete 100 mission drills', rarity: 'epic', icon: '🎖️', tierGroup: 'completions', tier: 3, maxTier: 3, artworkTokenId: 'completion' },
    { id: 'difficulty_advance', name: 'Clearance Escalation', description: 'Finish a drill on advanced difficulty', rarity: 'rare', icon: '⚡', artworkTokenId: 'difficulty' },
    { id: 'share_card', name: 'Signal Beacon', description: 'Share a training intel card', rarity: 'common', icon: '📡', artworkTokenId: 'share' },
];

export const getBadgeCatalog = (): BadgeDefinition[] => {
    try {
        return BADGE_CATALOG;
    } catch (error) {
        console.warn('badgeCatalog: returning empty catalog due to error', error);
        return [];
    }
};

export const findBadge = (id: string): BadgeDefinition | undefined => getBadgeCatalog().find(b => b.id === id);
