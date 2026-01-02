import WorkoutCategoryCache from '../cache/WorkoutCategoryCache';
import TrainingModuleCache from '../cache/TrainingModuleCache';

const scheduleIdle = (fn: () => void) => {
    if (typeof (window as any).requestIdleCallback === 'function') {
        (window as any).requestIdleCallback(fn, { timeout: 1000 });
    } else {
        setTimeout(fn, 150);
    }
};

export const warmCaches = () => {
    scheduleIdle(() => {
        try {
            const categoryCache = WorkoutCategoryCache.getInstance();
            if (categoryCache.cache.size === 0) {
                console.info('CacheWarmHints: WorkoutCategoryCache empty; warm will no-op until load completes.');
            } else {
                categoryCache.getAllWorkouts();
            }

            const moduleCache = TrainingModuleCache.getInstance();
            if (moduleCache.cache.size === 0) {
                console.info('CacheWarmHints: TrainingModuleCache empty; warm will no-op until load completes.');
            } else {
                // touch index to keep V8 hot
                moduleCache.cardIndex.size;
            }
        } catch (error) {
            console.warn('CacheWarmHints: Failed to warm caches', error);
        }
    });
};
