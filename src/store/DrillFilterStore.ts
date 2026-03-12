import { createStore, type Listener } from './createStore';

export type DurationBucket = 'any' | '10' | '20' | '30' | '30_plus';

export type DrillFilters = {
    search: string;
    duration: DurationBucket;
    equipment: string[];
    themes: string[];
    difficultyMin: number;
    difficultyMax: number;
};

const getDefaultFilters = (): DrillFilters => ({
    search: '',
    duration: 'any',
    equipment: [],
    themes: [],
    difficultyMin: 1,
    difficultyMax: 10,
});

const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every(entry => typeof entry === 'string');

const mergeWithDefaults = (candidate: Partial<DrillFilters>): DrillFilters => {
    const defaults = getDefaultFilters();
    return {
        search: typeof candidate.search === 'string' ? candidate.search : defaults.search,
        duration: candidate.duration ?? defaults.duration,
        equipment: Array.isArray(candidate.equipment) ? candidate.equipment : defaults.equipment,
        themes: Array.isArray(candidate.themes) ? candidate.themes : defaults.themes,
        difficultyMin: typeof candidate.difficultyMin === 'number' ? candidate.difficultyMin : defaults.difficultyMin,
        difficultyMax: typeof candidate.difficultyMax === 'number' ? candidate.difficultyMax : defaults.difficultyMax,
    };
};

const store = createStore<DrillFilters>({
    key: 'drillFilters:v1',
    defaultValue: getDefaultFilters(),
    validate: (raw): DrillFilters | null => {
        if (!raw || typeof raw !== 'object') return null;
        const candidate = raw as Partial<DrillFilters>;
        const durationValid = candidate.duration === undefined || ['any', '10', '20', '30', '30_plus'].includes(candidate.duration as string);
        const difficultyValid = (candidate.difficultyMin === undefined || typeof candidate.difficultyMin === 'number')
            && (candidate.difficultyMax === undefined || typeof candidate.difficultyMax === 'number');
        if (!(typeof candidate.search === 'string' && durationValid && (!candidate.equipment || isStringArray(candidate.equipment)) && (!candidate.themes || isStringArray(candidate.themes)) && difficultyValid)) {
            return null;
        }
        return mergeWithDefaults(candidate);
    },
});

const DrillFilterStore = {
    getFiltersSync(): DrillFilters {
        return store.get();
    },
    async getFilters(): Promise<DrillFilters> {
        return store.get();
    },
    saveFilters(filters: DrillFilters) {
        store.set(filters);
    },
    clearFilters() {
        store.reset();
    },
    addListener(listener: Listener<DrillFilters>): () => void {
        return store.subscribe(listener);
    },
};

export default DrillFilterStore;
