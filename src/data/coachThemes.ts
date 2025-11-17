export type CoachPalette = {
    accent: string;
    accentStrong: string;
    accentSoft: string;
    glow: string;
    background: string;
    surface: string;
    surfaceRaised: string;
    surfaceCard: string;
    text: string;
    textMuted: string;
    border: string;
};

const palette = (
    partial: Partial<CoachPalette>,
    defaults: CoachPalette
): CoachPalette => ({
    ...defaults,
    ...partial,
});

const basePalette: CoachPalette = {
    accent: '#5A7FFF',
    accentStrong: '#2B4ACF',
    accentSoft: 'rgba(90, 127, 255, 0.25)',
    glow: '#8FAFFF',
    background: '#050913',
    surface: '#0D1324',
    surfaceRaised: '#151C33',
    surfaceCard: '#1D253E',
    text: '#F4F7FF',
    textMuted: 'rgba(244, 247, 255, 0.7)',
    border: 'rgba(143, 175, 255, 0.35)',
};

export const coachPalettes: Record<string, CoachPalette> = {
    default: basePalette,
    tiger_fitness_god: palette({
        accent: '#FF5F1F',
        accentStrong: '#CC4C19',
        accentSoft: 'rgba(255, 95, 31, 0.25)',
        glow: '#FFB38A',
        background: '#120802',
        surface: '#1E0F05',
        surfaceRaised: '#2A1608',
        surfaceCard: '#341C0B',
        text: '#FFF4EE',
        textMuted: 'rgba(255, 244, 238, 0.7)',
        border: 'rgba(255, 95, 31, 0.35)'
    }, basePalette),
    jono_thora: palette({
        accent: '#00E7FF',
        accentStrong: '#00AFC4',
        accentSoft: 'rgba(0, 231, 255, 0.25)',
        glow: '#8BF9FF',
        background: '#030F18',
        surface: '#051C28',
        surfaceRaised: '#082836',
        surfaceCard: '#0B3241',
        text: '#E5FBFF',
        textMuted: 'rgba(229, 251, 255, 0.75)',
        border: 'rgba(0, 231, 255, 0.35)'
    }, basePalette),
    tara_van_dekar: palette({
        accent: '#FF4DA6',
        accentStrong: '#CC3E84',
        accentSoft: 'rgba(255, 77, 166, 0.25)',
        glow: '#FF9FD1',
        background: '#140714',
        surface: '#1F0B20',
        surfaceRaised: '#2A102B',
        surfaceCard: '#341535',
        text: '#FFE6F2',
        textMuted: 'rgba(255, 230, 242, 0.75)',
        border: 'rgba(255, 77, 166, 0.35)'
    }, basePalette),
    agent_simon: palette({
        accent: '#22BB22',
        accentStrong: '#1A8F1A',
        accentSoft: 'rgba(34, 187, 34, 0.25)',
        glow: '#85FF85',
        background: '#020F06',
        surface: '#07170B',
        surfaceRaised: '#0B2111',
        surfaceCard: '#0F2B17',
        text: '#EBFFE9',
        textMuted: 'rgba(235, 255, 233, 0.7)',
        border: 'rgba(34, 187, 34, 0.35)'
    }, basePalette),
    star_commander_raynor: palette({
        accent: '#5A7FFF',
        accentStrong: '#3B5DCF',
        accentSoft: 'rgba(90, 127, 255, 0.2)',
        glow: '#8FAFFF',
        background: '#040709',
        surface: '#0A0F1A',
        surfaceRaised: '#101A2B',
        surfaceCard: '#172238',
        text: '#E3ECFF',
        textMuted: 'rgba(227, 236, 255, 0.75)',
        border: 'rgba(90, 127, 255, 0.4)'
    }, basePalette),
};

export const getCoachPalette = (coachId: string): CoachPalette => {
    return coachPalettes[coachId] ?? coachPalettes.default;
};

export const applyCoachPaletteToRoot = (coachId: string): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const paletteToApply = getCoachPalette(coachId);
    const root = document.documentElement;

    root.style.setProperty('--coach-accent', paletteToApply.accent);
    root.style.setProperty('--coach-accent-strong', paletteToApply.accentStrong);
    root.style.setProperty('--coach-accent-soft', paletteToApply.accentSoft);
    root.style.setProperty('--coach-glow', paletteToApply.glow);
    root.style.setProperty('--surface-base', paletteToApply.background);
    root.style.setProperty('--surface-muted', paletteToApply.surface);
    root.style.setProperty('--surface-elevated', paletteToApply.surfaceRaised);
    root.style.setProperty('--surface-card', paletteToApply.surfaceCard);
    root.style.setProperty('--text-primary', paletteToApply.text);
    root.style.setProperty('--text-muted', paletteToApply.textMuted);
    root.style.setProperty('--coach-border', paletteToApply.border);

    // Maintain legacy variables for existing CSS
    root.style.setProperty('--primary-bg-color', paletteToApply.background);
    root.style.setProperty('--secondary-bg-color', paletteToApply.surfaceRaised);
    root.style.setProperty('--primary-text-color', paletteToApply.text);
    root.style.setProperty('--secondary-text-color', paletteToApply.glow);
    root.style.setProperty('--border-color', paletteToApply.border);
};
