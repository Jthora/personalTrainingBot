/**
 * OperativeProfileStore — persists the user's chosen archetype, handler, and callsign.
 * This is the identity store, separate from UserProgressStore (which tracks XP/streaks/badges).
 */

export interface OperativeProfile {
    archetypeId: string;
    handlerId: string;
    callsign: string;
    enrolledAt: string;
}

const STORE_KEY = 'operative:profile:v1';

type Listener = () => void;
const listeners = new Set<Listener>();
let version = 0;

const notify = () => {
    version += 1;
    listeners.forEach((fn) => fn());
};

const safeParse = (raw: string | null): OperativeProfile | null => {
    if (!raw) return null;
    try {
        const parsed = JSON.parse(raw);
        if (typeof parsed !== 'object' || !parsed) return null;
        if (typeof parsed.archetypeId !== 'string' || !parsed.archetypeId) return null;
        if (typeof parsed.handlerId !== 'string' || !parsed.handlerId) return null;
        return {
            archetypeId: parsed.archetypeId,
            handlerId: parsed.handlerId,
            callsign: typeof parsed.callsign === 'string' ? parsed.callsign : '',
            enrolledAt: typeof parsed.enrolledAt === 'string' ? parsed.enrolledAt : new Date().toISOString(),
        };
    } catch {
        return null;
    }
};

const OperativeProfileStore = {
    get(): OperativeProfile | null {
        if (typeof window === 'undefined') return null;
        try {
            return safeParse(window.localStorage.getItem(STORE_KEY));
        } catch {
            return null;
        }
    },

    set(profile: OperativeProfile): void {
        if (typeof window === 'undefined') return;
        try {
            window.localStorage.setItem(STORE_KEY, JSON.stringify(profile));
        } catch (err) {
            console.warn('[OperativeProfileStore] write failed', err);
        }
        notify();
    },

    /** Update specific fields without replacing the entire profile. */
    patch(fields: Partial<OperativeProfile>): void {
        const current = this.get();
        if (!current) return;
        this.set({ ...current, ...fields });
    },

    reset(): void {
        if (typeof window === 'undefined') return;
        try {
            window.localStorage.removeItem(STORE_KEY);
        } catch {
            // ignore
        }
        notify();
    },

    subscribe(cb: Listener): () => void {
        listeners.add(cb);
        return () => { listeners.delete(cb); };
    },

    getVersion(): number {
        return version;
    },
};

export default OperativeProfileStore;
