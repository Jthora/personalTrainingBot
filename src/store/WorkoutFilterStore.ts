export type DurationBucket = 'any' | '10' | '20' | '30' | '30_plus';

export type WorkoutFilters = {
    search: string;
    duration: DurationBucket;
    equipment: string[];
    themes: string[];
    difficultyMin: number;
    difficultyMax: number;
};

const STORAGE_VERSION = 'v1';
const STORAGE_KEY = `workoutFilters:${STORAGE_VERSION}`;

type FilterListener = (filters: WorkoutFilters) => void;
const filterListeners = new Set<FilterListener>();

const notifyFilterChange = (filters: WorkoutFilters) => {
    filterListeners.forEach(listener => {
        try {
            listener(filters);
        } catch (error) {
            console.warn('WorkoutFilterStore: listener failed', error);
        }
    });
};

const getDefaultFilters = (): WorkoutFilters => ({
    search: '',
    duration: 'any',
    equipment: [],
    themes: [],
    difficultyMin: 1,
    difficultyMax: 10,
});

const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every(entry => typeof entry === 'string');

const isFiltersShape = (value: unknown): value is WorkoutFilters => {
    if (!value || typeof value !== 'object') return false;
    const candidate = value as Partial<WorkoutFilters>;
    const durationValid = candidate.duration === undefined || ['any', '10', '20', '30', '30_plus'].includes(candidate.duration as string);
    const difficultyValid = (candidate.difficultyMin === undefined || typeof candidate.difficultyMin === 'number')
        && (candidate.difficultyMax === undefined || typeof candidate.difficultyMax === 'number');
    return typeof candidate.search === 'string'
        && durationValid
        && (!candidate.equipment || isStringArray(candidate.equipment))
        && (!candidate.themes || isStringArray(candidate.themes))
        && difficultyValid;
};

const mergeWithDefaults = (candidate: Partial<WorkoutFilters>): WorkoutFilters => {
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

const WorkoutFilterStore = {
    getFiltersSync(): WorkoutFilters {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return getDefaultFilters();
            const parsed = JSON.parse(raw) as unknown;
            if (!isFiltersShape(parsed)) {
                console.warn('WorkoutFilterStore: stored filters have invalid shape; resetting to defaults.');
                this.saveFilters(getDefaultFilters());
                return getDefaultFilters();
            }
            return mergeWithDefaults(parsed);
        } catch (error) {
            console.error('WorkoutFilterStore: failed to read filters; using defaults.', error);
            return getDefaultFilters();
        }
    },
    async getFilters(): Promise<WorkoutFilters> {
        return this.getFiltersSync();
    },
    saveFilters(filters: WorkoutFilters) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
            notifyFilterChange(filters);
        } catch (error) {
            console.error('WorkoutFilterStore: failed to save filters', error);
        }
    },
    clearFilters() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            const defaults = getDefaultFilters();
            notifyFilterChange(defaults);
        } catch (error) {
            console.error('WorkoutFilterStore: failed to clear filters', error);
        }
    },
    addListener(listener: FilterListener): () => void {
        filterListeners.add(listener);
        return () => filterListeners.delete(listener);
    },
};

export default WorkoutFilterStore;
