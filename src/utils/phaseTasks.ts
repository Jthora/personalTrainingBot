import { taskScheduler } from "./taskScheduler";
import { prefetchOnIdle } from "./prefetch";
import { modulePaths } from "./modulePaths";

// Phase allocations for loading; used to centralize non-critical work.
// Critical tasks run elsewhere (InitialDataLoader). This file handles post-paint enrichment/idle work.

const hotModuleKeys: Array<keyof typeof modulePaths> = ['fitness', 'combat', 'martial_arts'].filter(
    (key) => key in modulePaths
) as Array<keyof typeof modulePaths>;

export const schedulePostPaintTasks = () => {
    // Low priority: kick off training-prefetch bundle fetches, guarded by connection conditions.
    taskScheduler.schedule({
        label: 'prefetch:training-hot-modules',
        priority: 'low',
        canRunOnSaveData: false,
        allowOn2g: false,
        run: () => {
            const loaders = [
                // Coach workout catalog (small JSON)
                () => import('../data/training_coach_data/workouts.json'),
                // High-likelihood training modules
                ...hotModuleKeys.map((key) => modulePaths[key]),
            ];

            prefetchOnIdle(loaders, {
                label: 'training-prefetch',
                maxConcurrency: 2,
                timeoutMs: 250,
                logger: (msg) => console.info(msg),
            });
        },
    });
};
