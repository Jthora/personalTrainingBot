import DataLoader from './DataLoader';
import TrainingModuleCache from '../cache/TrainingModuleCache';

class InitialDataLoader {
    static async initialize() {
        try {
            console.log("Starting to load all data...");
            const dataLoader = new DataLoader();
            const trainingModules = await dataLoader.loadTrainingModules();
            console.log(`Fetched ${trainingModules.length} training modules.`);
            await TrainingModuleCache.getInstance().loadData(trainingModules);
            console.log("Successfully loaded and cached all data.");
        } catch (error) {
            console.error("Failed to load all data:", error);
        }
    }
}

export default InitialDataLoader;