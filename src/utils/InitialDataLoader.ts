import CardDataLoader from './CardDataLoader';
import DrillDataLoader from './DrillDataLoader';
import { totalCardDecks } from './cardDeckPaths'; // Import total card decks
import { totalDrillSubCategories } from './drillSubCategoryPaths'; // Import total drill subcategories
import DrillCategoryCache from '../cache/DrillCategoryCache'; // Import DrillCategoryCache
import TrainingModuleCache from '../cache/TrainingModuleCache';
import TrainingHandlerCache from '../cache/TrainingHandlerCache';
import MissionScheduleStore from '../store/MissionScheduleStore'; // Import MissionScheduleStore
import { loadScheduleStub } from './ScheduleLoader';
import MissionEntityStore from '../domain/mission/MissionEntityStore';

class InitialDataLoader {
    private static initializationPromise: Promise<void> | null = null;

    static async initialize(
        onProgress: (progress: number) => void,
        onPartialFailure?: (message: string) => void
    ) {
        if (this.initializationPromise) {
            console.warn("InitialDataLoader: Initialization already in progress.");
            return this.initializationPromise;
        }

        this.initializationPromise = (async () => {
            try {
                console.log("InitialDataLoader: Starting to load all data...");
                const cardDataLoader = new CardDataLoader();
                const drillDataLoader = new DrillDataLoader();
                let currentStep = 0;

                const updateProgress = (totalSteps: number) => {
                    currentStep += 1;
                    onProgress((currentStep / totalSteps) * 100);
                };

                const totalSteps = totalCardDecks + Object.keys(totalDrillSubCategories).length;
                console.log(`InitialDataLoader: Total CardDecks and DrillSubCategories: ${totalSteps}`);

                const handlerPromise = this.loadHandlerData();
                const trainingPromise = this.loadTrainingModules(cardDataLoader, updateProgress, totalSteps, onPartialFailure);
                const drillCategoriesPromise = this.loadDrillCategories(drillDataLoader, updateProgress, totalSteps, onPartialFailure);
                const schedulePromise = drillCategoriesPromise.then(() => this.loadMissionSchedule());

                const taskEntries = [
                    ["handler", handlerPromise],
                    ["training", trainingPromise],
                    ["drillCategories", drillCategoriesPromise],
                    ["schedule", schedulePromise],
                ] as const;

                const results = await Promise.allSettled(taskEntries.map(async ([_, promise]) => promise));

                results.forEach((result, index) => {
                    const [label] = taskEntries[index];
                    if (result.status === "rejected") {
                        console.error(`InitialDataLoader: ${label} task failed`, result.reason);
                        onPartialFailure?.(`${label} task failed; see console for details.`);
                    }
                });

                console.log("InitialDataLoader: Successfully loaded and cached all data.");
            } catch (error) {
                console.error("InitialDataLoader: Failed to load all data:", error);
                if (error instanceof Error) {
                    console.error(`Error message: ${error.message}`);
                    console.error(`Stack trace: ${error.stack}`);
                }
            }
        })();

        return this.initializationPromise;
    }

    private static async loadHandlerData() {
        console.log("InitialDataLoader: Loading handler data...");
        await TrainingHandlerCache.getInstance().loadData();
    }

    private static async loadTrainingModules(
        dataLoader: CardDataLoader,
        updateProgress: (totalSteps: number) => void,
        totalSteps: number,
        onPartialFailure?: (message: string) => void
    ) {
        console.log("InitialDataLoader: Loading training modules...");
        const trainingModules = await dataLoader.loadAllData(() => updateProgress(totalSteps), onPartialFailure);
        console.log(`InitialDataLoader: Loaded ${trainingModules.length} training modules.`);
        await TrainingModuleCache.getInstance().loadData(trainingModules); // Load data into cache
        MissionEntityStore.getInstance().hydrateFromTrainingModules(trainingModules);
    }

    private static async loadDrillCategories(
        dataLoader: DrillDataLoader,
        updateProgress: (totalSteps: number) => void,
        totalSteps: number,
        onPartialFailure?: (message: string) => void
    ) {
        console.log("InitialDataLoader: Loading drill categories...");
        const drillCategories = await dataLoader.loadAllData(() => updateProgress(totalSteps), onPartialFailure);
        console.log(`InitialDataLoader: Loaded ${drillCategories.length} drill categories.`);
        await DrillCategoryCache.getInstance().loadData(drillCategories); // Load data into cache
    }

    private static async loadMissionSchedule() {
        console.log("InitialDataLoader: Loading drill schedule...");
        const { schedule, source, stale } = await loadScheduleStub();
        MissionScheduleStore.saveSchedule(schedule);
        console.log(`InitialDataLoader: Loaded and saved drill schedule from ${source}${stale ? ' (stale)' : ''}.`);
    }
}

export default InitialDataLoader;