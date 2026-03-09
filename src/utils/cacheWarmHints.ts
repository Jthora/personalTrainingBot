import DrillCategoryCache from '../cache/DrillCategoryCache';
import TrainingModuleCache from '../cache/TrainingModuleCache';
import { taskScheduler } from './taskScheduler';

export const warmCaches = (onComplete?: () => void) => {
    const cancel = taskScheduler.schedule({
        label: 'idle:cache-warm',
        priority: 'idle',
        canRunOnSaveData: false,
        allowOn2g: false,
        run: (signal) => {
            if (signal.aborted) return;
            try {
                const categoryCache = DrillCategoryCache.getInstance();
                if (categoryCache.cache.size === 0) {
                    console.info('CacheWarmHints: DrillCategoryCache empty; warm will no-op until load completes.');
                } else {
                    categoryCache.getAllWorkouts();
                }

                if (signal.aborted) return;

                const moduleCache = TrainingModuleCache.getInstance();
                if (moduleCache.cache.size === 0) {
                    console.info('CacheWarmHints: TrainingModuleCache empty; warm will no-op until load completes.');
                } else {
                    // touch index to keep V8 hot
                    moduleCache.cardIndex.size;
                }
            } catch (error) {
                console.warn('CacheWarmHints: Failed to warm caches', error);
            } finally {
                onComplete?.();
            }
        }
    });

    return cancel;
};
