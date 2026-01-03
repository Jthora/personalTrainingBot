import FeatureFlagsStore from '../../store/FeatureFlagsStore';
import { RecapSummary } from '../../types/RecapSummary';
import { recordMetric } from '../metrics';

export type CopySurface = 'recap_toast' | 'recap_modal';
export type VariantGroup = 'control' | 'celebratory' | 'coaching';

export interface CopyVariantMeta {
    surface: CopySurface;
    variantId: string;
    group: VariantGroup;
    fromCache: boolean;
}

export interface CopySelection<T> {
    copy: T;
    meta: CopyVariantMeta;
}

type RecapContext = RecapSummary;

type CopyVariant<T> = {
    id: string;
    group: VariantGroup;
    build: (ctx: RecapContext) => T;
    cooldownMs?: number;
};

type StoredEntry = {
    variantId: string;
    group: VariantGroup;
    servedAt: number;
};

type StoredState = Partial<Record<CopySurface, StoredEntry>>;

type RecapToastCopy = {
    title: string;
    ctaLabel: string;
    dismissLabel: string;
};

type RecapModalCopy = {
    headerTitle: string;
    headerSubtitle: string;
    headline: string;
    subhead: string;
};

const STORAGE_KEY = 'copyVariants:recap:v1';
const SEED_KEY = 'copyVariants:seed';
const SERVE_LOG_SESSION_KEY = 'copyVariants:serves';

const safeStorage = <T extends 'localStorage' | 'sessionStorage'>(target: T) => {
    if (typeof window === 'undefined') return null;
    try {
        const probeKey = `${STORAGE_KEY}:probe`;
        window[target].setItem(probeKey, '1');
        window[target].removeItem(probeKey);
        return window[target];
    } catch (error) {
        console.warn('recapVariants: storage unavailable', { target, error });
        return null;
    }
};

const loadState = (): StoredState => {
    const storage = safeStorage('localStorage');
    if (!storage) return {};
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return {};
    try {
        const parsed = JSON.parse(raw) as StoredState;
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (error) {
        console.warn('recapVariants: failed to parse state, resetting', error);
        storage.removeItem(STORAGE_KEY);
        return {};
    }
};

const persistState = (state: StoredState) => {
    const storage = safeStorage('localStorage');
    if (!storage) return;
    try {
        storage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
        console.warn('recapVariants: failed to persist state', error);
    }
};

const loadServeLog = (): Set<string> => {
    const storage = safeStorage('sessionStorage');
    if (!storage) return new Set();
    const raw = storage.getItem(SERVE_LOG_SESSION_KEY);
    if (!raw) return new Set();
    try {
        const parsed = JSON.parse(raw) as string[];
        return new Set(parsed || []);
    } catch (error) {
        console.warn('recapVariants: failed to parse serve log, resetting', error);
        storage.removeItem(SERVE_LOG_SESSION_KEY);
        return new Set();
    }
};

const persistServeLog = (log: Set<string>) => {
    const storage = safeStorage('sessionStorage');
    if (!storage) return;
    try {
        storage.setItem(SERVE_LOG_SESSION_KEY, JSON.stringify(Array.from(log)));
    } catch (error) {
        console.warn('recapVariants: failed to persist serve log', error);
    }
};

const getSeed = (): string => {
    const storage = safeStorage('localStorage');
    if (!storage) return 'seed';
    const existing = storage.getItem(SEED_KEY);
    if (existing) return existing;
    const generated = Math.random().toString(36).slice(2);
    storage.setItem(SEED_KEY, generated);
    return generated;
};

const hashString = (input: string): number => {
    let hash = 0;
    for (let i = 0; i < input.length; i += 1) {
        hash = (hash << 5) - hash + input.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
};

const resolveCooldownMs = (variantCooldown?: number): number => {
    const flags = FeatureFlagsStore.get();
    const base = variantCooldown ?? 6 * 60 * 60 * 1000; // 6h default
    if (flags.promptFrequency === 'off') return 24 * 60 * 60 * 1000;
    if (flags.promptFrequency === 'reduced') return Math.max(base, 12 * 60 * 60 * 1000);
    return base;
};

const pickVariant = <T>(surface: CopySurface, pool: CopyVariant<T>[], cooldownMs: number): CopyVariant<T> => {
    const seed = getSeed();
    const rotation = Math.floor(Date.now() / cooldownMs);
    const index = hashString(`${seed}:${surface}:${rotation}`) % pool.length;
    return pool[index] ?? pool[0];
};

const logServeOnce = (meta: CopyVariantMeta) => {
    const log = loadServeLog();
    const key = `${meta.surface}:${meta.variantId}`;
    if (!log.has(key)) {
        recordMetric('copy_variant_served', {
            surface: meta.surface,
            variantId: meta.variantId,
            group: meta.group,
            fromCache: meta.fromCache,
        });
        log.add(key);
        persistServeLog(log);
    }
};

const selectVariant = <T>(surface: CopySurface, pool: CopyVariant<T>[], recap: RecapContext): CopySelection<T> => {
    const fallback = pool[0];
    if (!fallback) {
        throw new Error('recapVariants: empty pool for surface');
    }

    if (typeof window === 'undefined') {
        return {
            copy: fallback.build(recap),
            meta: { surface, variantId: fallback.id, group: fallback.group, fromCache: false },
        };
    }

    const state = loadState();
    const entry = state[surface];
    const cooldownMs = resolveCooldownMs(fallback.cooldownMs);
    const now = Date.now();

    if (entry && now - entry.servedAt < cooldownMs) {
        const cached = pool.find(v => v.id === entry.variantId) ?? fallback;
        const meta: CopyVariantMeta = { surface, variantId: cached.id, group: cached.group, fromCache: true };
        logServeOnce(meta);
        return { copy: cached.build(recap), meta };
    }

    const variant = pickVariant(surface, pool, cooldownMs);
    state[surface] = { variantId: variant.id, group: variant.group, servedAt: now };
    persistState(state);
    const meta: CopyVariantMeta = { surface, variantId: variant.id, group: variant.group, fromCache: false };
    logServeOnce(meta);
    return { copy: variant.build(recap), meta };
};

const numberOrZero = (value?: number) => (Number.isFinite(value) ? Number(value) : 0);

const toastVariants: CopyVariant<RecapToastCopy>[] = [
    {
        id: 'toast_control',
        group: 'control',
        build: () => ({
            title: 'Schedule complete',
            ctaLabel: 'View recap',
            dismissLabel: 'Dismiss',
        }),
    },
    {
        id: 'toast_celebratory',
        group: 'celebratory',
        build: (ctx) => {
            const xpGain = Math.max(0, numberOrZero(ctx.xpDelta ?? ctx.xp));
            const streak = numberOrZero(ctx.streakCount);
            return {
                title: xpGain > 0 ? `+${xpGain} XP locked in` : 'Plan wrapped—nicely done',
                ctaLabel: streak >= 5 ? 'Keep the streak' : 'Review gains',
                dismissLabel: 'Later',
            };
        },
    },
    {
        id: 'toast_coaching',
        group: 'coaching',
        build: (ctx) => {
            const minutes = numberOrZero(ctx.minutes);
            const streakLabel = ctx.streakStatus === 'broken'
                ? 'Reset underway'
                : ctx.streakStatus === 'frozen'
                    ? 'Streak paused'
                    : `Streak ${Math.max(1, numberOrZero(ctx.streakCount))}d`;
            return {
                title: minutes >= 30 ? `${streakLabel} — solid block logged` : `${streakLabel} — quick reps saved`,
                ctaLabel: 'See what you earned',
                dismissLabel: 'Skip for now',
            };
        },
    },
];

const modalVariants: CopyVariant<RecapModalCopy>[] = [
    {
        id: 'modal_control',
        group: 'control',
        build: (ctx) => ({
            headerTitle: 'Great work!',
            headerSubtitle: "You wrapped the plan. Here's your recap.",
            headline: ctx.streakStatus === 'broken' ? 'Progress reset' : 'Nice work',
            subhead: `+${Math.max(0, numberOrZero(ctx.xp))} XP · Streak ${Math.max(0, numberOrZero(ctx.streakCount))}d · Level ${Math.max(1, numberOrZero(ctx.level))}`,
        }),
    },
    {
        id: 'modal_celebratory',
        group: 'celebratory',
        build: (ctx) => {
            const xpGain = Math.max(0, numberOrZero(ctx.xpDelta ?? ctx.xp));
            const streak = numberOrZero(ctx.streakCount);
            const level = Math.max(1, numberOrZero(ctx.level));
            return {
                headerTitle: 'Momentum unlocked',
                headerSubtitle: streak >= 5 ? 'Hot streak—keep it rolling.' : 'Solid session. Onward!',
                headline: xpGain >= 50 ? 'Big XP haul' : 'Strong finish',
                subhead: `+${xpGain} XP · Level ${level} · Streak ${streak}d`,
            };
        },
    },
    {
        id: 'modal_coaching',
        group: 'coaching',
        build: (ctx) => {
            const minutes = numberOrZero(ctx.minutes);
            const goalNudge = minutes < 20 ? 'Add a 10-min finisher to close the gap.' : 'Log a stretch or cooldown to bank recovery.';
            return {
                headerTitle: 'Coach recap',
                headerSubtitle: 'Quick pointers to stay on track.',
                headline: minutes >= 30 ? 'Training block logged' : 'Micro session saved',
                subhead: goalNudge,
            };
        },
    },
];

export const selectRecapToastCopy = (recap: RecapSummary): CopySelection<RecapToastCopy> =>
    selectVariant('recap_toast', toastVariants, recap);

export const selectRecapModalCopy = (recap: RecapSummary): CopySelection<RecapModalCopy> =>
    selectVariant('recap_modal', modalVariants, recap);

export const logCopyImpression = (meta: CopyVariantMeta, data?: Record<string, unknown>) => {
    recordMetric('copy_variant_impression', {
        surface: meta.surface,
        variantId: meta.variantId,
        group: meta.group,
        ...data,
    });
};

export const logCopyInteraction = (
    meta: CopyVariantMeta,
    action: 'cta' | 'dismiss' | 'view' | 'share',
    data?: Record<string, unknown>,
) => {
    recordMetric('copy_variant_interaction', {
        surface: meta.surface,
        variantId: meta.variantId,
        group: meta.group,
        action,
        ...data,
    });
};
