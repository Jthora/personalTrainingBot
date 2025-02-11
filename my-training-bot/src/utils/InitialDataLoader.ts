import DataLoader from './DataLoader';
import { totalCardDecks } from './cardDeckPaths'; // Import total card decks
import TrainingModuleCache from '../cache/TrainingModuleCache';

class InitialDataLoader {
    static async initialize(onProgress: (progress: number) => void) {
        try {
            console.log("Starting to load all data...");
            const dataLoader = new DataLoader();
            let currentStep = 0;

            const updateProgress = () => {
                currentStep += 1;
                onProgress((currentStep / totalCardDecks) * 100); // Use total card decks for progress calculation
            };

            const trainingModules = await dataLoader.loadAllData(updateProgress);
            await TrainingModuleCache.getInstance().loadData(trainingModules); // Load data into cache
            console.log("Successfully loaded and cached all data.");
        } catch (error) {
            console.error("Failed to load all data:", error);
        }
    }
}

export default InitialDataLoader;