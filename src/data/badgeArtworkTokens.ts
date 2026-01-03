export type BadgeArtworkTokenId = 'streak' | 'time' | 'completion' | 'difficulty' | 'share' | 'default';

export interface BadgeArtworkToken {
    id: BadgeArtworkTokenId;
    sprite: string; // could map to an SVG/PNG asset or CSS background key
    description: string;
}

const BADGE_ARTWORK_TOKENS: Record<BadgeArtworkTokenId, BadgeArtworkToken> = {
    streak: { id: 'streak', sprite: 'badge-artwork/streak.svg', description: 'Arc rings representing streak momentum' },
    time: { id: 'time', sprite: 'badge-artwork/time.svg', description: 'Clock face with motion blur' },
    completion: { id: 'completion', sprite: 'badge-artwork/completion.svg', description: 'Stacked checkmarks indicating completions' },
    difficulty: { id: 'difficulty', sprite: 'badge-artwork/difficulty.svg', description: 'Lightning bolt over shield indicating advanced difficulty' },
    share: { id: 'share', sprite: 'badge-artwork/share.svg', description: 'Signal beacon for shared cards' },
    default: { id: 'default', sprite: 'badge-artwork/generic.svg', description: 'Generic badge artwork fallback' },
};

export const getBadgeArtworkTokens = (): Record<BadgeArtworkTokenId, BadgeArtworkToken> => BADGE_ARTWORK_TOKENS;

export const getBadgeArtworkToken = (id: BadgeArtworkTokenId): BadgeArtworkToken => BADGE_ARTWORK_TOKENS[id];
