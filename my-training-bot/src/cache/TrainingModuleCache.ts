import { TrainingModule } from "../types/TrainingModule";

export class TrainingModuleCache {
    private static instance: TrainingModuleCache;
    public cache: Map<string, TrainingModule>;

    private constructor() {
        this.cache = new Map();
    }

    /**
     * Get singleton instance of TrainingModuleCache
     */
    public static getInstance(): TrainingModuleCache {
        if (!this.instance) {
            this.instance = new TrainingModuleCache();
        }
        return this.instance;
    }

    /**
     * Load training modules into cache
     */
    public loadData(trainingModules: TrainingModule[]): void {
        trainingModules.forEach(module => this.cache.set(module.id, module));
    }

    /**
     * Get a Training Module by ID
     */
    public getTrainingModule(id: string): TrainingModule | null {
        return this.cache.get(id) || null;
    }

    /**
     * Check if data is loaded
     */
    public isLoaded(): boolean {
        return this.cache.size > 0;
    }

    /**
     * Clear Cache (Useful for Reloading Data)
     */
    public clearCache(): void {
        this.cache.clear();
    }
}

export default TrainingModuleCache;