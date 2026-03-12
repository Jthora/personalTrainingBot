/**
 * OperativeProfileStore — persists the user's chosen archetype, handler, and callsign.
 * This is the identity store, separate from UserProgressStore (which tracks XP/streaks/badges).
 */

import { createStore } from './createStore';

export interface OperativeProfile {
    archetypeId: string;
    handlerId: string;
    callsign: string;
    enrolledAt: string;
}

const store = createStore<OperativeProfile | null>({
    key: 'operative:profile:v1',
    defaultValue: null,
    validate: (raw): OperativeProfile | null => {
        if (typeof raw !== 'object' || !raw) return null;
        const p = raw as Record<string, unknown>;
        if (typeof p.archetypeId !== 'string' || !p.archetypeId) return null;
        if (typeof p.handlerId !== 'string' || !p.handlerId) return null;
        return {
            archetypeId: p.archetypeId,
            handlerId: p.handlerId,
            callsign: typeof p.callsign === 'string' ? p.callsign : '',
            enrolledAt: typeof p.enrolledAt === 'string' ? p.enrolledAt : new Date().toISOString(),
        };
    },
});

// Stateless listener adapter (backward compat: existing consumers use () => void)
type StatelessListener = () => void;
const statelessListeners = new Set<StatelessListener>();
let version = 0;

store.subscribe(() => {
    version += 1;
    statelessListeners.forEach((fn) => fn());
});

const OperativeProfileStore = {
    get(): OperativeProfile | null {
        return store.get();
    },

    set(profile: OperativeProfile): void {
        store.set(profile);
    },

    /** Update specific fields without replacing the entire profile. */
    patch(fields: Partial<OperativeProfile>): void {
        const current = this.get();
        if (!current) return;
        this.set({ ...current, ...fields });
    },

    reset(): void {
        store.reset();
    },

    subscribe(cb: StatelessListener): () => void {
        statelessListeners.add(cb);
        return () => { statelessListeners.delete(cb); };
    },

    getVersion(): number {
        return version;
    },
};

export default OperativeProfileStore;
