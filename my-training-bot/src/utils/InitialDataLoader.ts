import CardDataLoader from './CardDataLoader';
import WorkoutDataLoader from './WorkoutDataLoader';
import { totalCardDecks } from './cardDeckPaths'; // Import total card decks
import { totalWorkoutSubCategories } from './workoutSubCategoryPaths'; // Import total workout subcategories
import WorkoutCategoryCache from '../cache/WorkoutCategoryCache'; // Import WorkoutCategoryCache
import TrainingModuleCache from '../cache/TrainingModuleCache';
import TrainingCoachCache from '../cache/TrainingCoachCache';

class InitialDataLoader {
    private static initializationPromise: Promise<void> | null = null;

    static async initialize(onProgress: (progress: number) => void) {
        if (this.initializationPromise) {
            console.warn("InitialDataLoader: Initialization already in progress.");
            return this.initializationPromise;
        }

        this.initializationPromise = (async () => {
            try {
                console.log("InitialDataLoader: Starting to load all data...");
                const cardDataLoader = new CardDataLoader();
                const workoutDataLoader = new WorkoutDataLoader();
                let currentStep = 0;

                const updateProgress = (totalSteps: number) => {
                    currentStep += 1;
                    onProgress((currentStep / totalSteps) * 100);
                    //console.log(`Progress: (${currentStep}/${totalSteps})`);
                };

                const totalSteps = totalCardDecks + Object.keys(totalWorkoutSubCategories).length;
                console.log(`InitialDataLoader: Total CardDecks and WorkoutSubCategories: ${totalSteps}`);
                await this.loadCoachData();
                await this.loadTrainingModules(cardDataLoader, updateProgress, totalSteps);
                await this.loadWorkoutCategories(workoutDataLoader, updateProgress, totalSteps);

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

    private static async loadCoachData() {
        console.log("InitialDataLoader: Loading coach data...");
        await TrainingCoachCache.getInstance().loadData();
    }

    private static async loadTrainingModules(dataLoader: CardDataLoader, updateProgress: (totalSteps: number) => void, totalSteps: number) {
        console.log("InitialDataLoader: Loading training modules...");
        const trainingModules = await dataLoader.loadAllData(() => updateProgress(totalSteps));
        console.log(`InitialDataLoader: Loaded ${trainingModules.length} training modules.`);
        await TrainingModuleCache.getInstance().loadData(trainingModules); // Load data into cache
    }

    private static async loadWorkoutCategories(dataLoader: WorkoutDataLoader, updateProgress: (totalSteps: number) => void, totalSteps: number) {
        console.log("InitialDataLoader: Loading workout categories...");
        const workoutCategories = await dataLoader.loadAllData(() => updateProgress(totalSteps));
        console.log(`InitialDataLoader: Loaded ${workoutCategories.length} workout categories.`);
        await WorkoutCategoryCache.getInstance().loadData(workoutCategories); // Load data into cache
    }
}

export default InitialDataLoader;