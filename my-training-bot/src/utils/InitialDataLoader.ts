import CardDataLoader from './CardDataLoader';
import WorkoutDataLoader from './WorkoutDataLoader';
import { totalCardDecks } from './cardDeckPaths'; // Import total card decks
import { totalWorkoutSubCategories } from './workoutSubCategoryPaths'; // Import total workout subcategories
import WorkoutCategoryCache from '../cache/WorkoutCategoryCache'; // Import WorkoutCategoryCache
import TrainingModuleCache from '../cache/TrainingModuleCache';

class InitialDataLoader {
    static async initialize(onProgress: (progress: number) => void) {
        try {
            console.log("Starting to load all data...");
            const cardDataLoader = new CardDataLoader();
            const workoutDataLoader = new WorkoutDataLoader();
            let currentStep = 0;

            const updateProgress = (totalSteps: number) => {
                currentStep += 1;
                onProgress((currentStep / totalSteps) * 100);
                console.log(`Progress: (${currentStep}/${totalSteps})`);
            };

            const totalSteps = totalCardDecks + totalWorkoutSubCategories;
            console.log(`Total steps for progress: ${totalSteps}`);

            await this.loadTrainingModules(cardDataLoader, updateProgress, totalSteps);
            await this.loadWorkoutCategories(workoutDataLoader, updateProgress, totalSteps);

            console.log("Successfully loaded and cached all data.");
        } catch (error) {
            console.error("Failed to load all data:", error);
            if (error instanceof Error) {
                console.error(`Error message: ${error.message}`);
                console.error(`Stack trace: ${error.stack}`);
            }
        }
    }

    private static async loadTrainingModules(dataLoader: CardDataLoader, updateProgress: (totalSteps: number) => void, totalSteps: number) {
        console.log("Loading training modules...");
        const trainingModules = await dataLoader.loadAllData(() => updateProgress(totalSteps));
        console.log(`Loaded ${trainingModules.length} training modules.`);
        await TrainingModuleCache.getInstance().loadData(trainingModules); // Load data into cache
    }

    private static async loadWorkoutCategories(dataLoader: WorkoutDataLoader, updateProgress: (totalSteps: number) => void, totalSteps: number) {
        console.log("Loading workout categories...");
        const workoutCategories = await dataLoader.loadAllData(() => updateProgress(totalSteps));
        console.log(`Loaded ${workoutCategories.length} workout categories.`);
        await WorkoutCategoryCache.getInstance().loadData(workoutCategories); // Load data into cache
    }
}

export default InitialDataLoader;