export type BadgeVisualTokenId = 'common' | 'rare' | 'epic';

export interface BadgeVisualToken {
    id: BadgeVisualTokenId;
    background: string; // e.g., gradient or solid color
    border: string;
    glow: string;
    text: string;
    accent: string;
    artwork: string; // could be a gradient name, SVG asset path, or CSS variable
}

const BADGE_VISUAL_TOKENS: Record<BadgeVisualTokenId, BadgeVisualToken> = {
    common: {
        id: 'common',
        background: 'linear-gradient(135deg, #0D1A2A 0%, #0F2236 100%)',
        border: '#3A4B63',
        glow: 'rgba(90, 127, 255, 0.2)',
        text: '#E3ECFF',
        accent: '#8FAFFF',
        artwork: 'badge-art:common:starfield',
    },
    rare: {
        id: 'rare',
        background: 'linear-gradient(135deg, #10243A 0%, #1A3554 100%)',
        border: '#5A7FFF',
        glow: 'rgba(90, 127, 255, 0.35)',
        text: '#F2F5FF',
        accent: '#B3C8FF',
        artwork: 'badge-art:rare:aurora',
    },
    epic: {
        id: 'epic',
        background: 'linear-gradient(135deg, #1A0F2E 0%, #281046 100%)',
        border: '#C46BFF',
        glow: 'rgba(196, 107, 255, 0.45)',
        text: '#FDF1FF',
        accent: '#FFD18F',
        artwork: 'badge-art:epic:nebula',
    },
};

export const getBadgeVisualTokens = (): Record<BadgeVisualTokenId, BadgeVisualToken> => BADGE_VISUAL_TOKENS;

export const getBadgeVisualToken = (id: BadgeVisualTokenId): BadgeVisualToken => BADGE_VISUAL_TOKENS[id];
