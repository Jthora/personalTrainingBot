import { TrainingModule } from "../types/TrainingModule";

export class TrainingModuleCache {
    private static instance: TrainingModuleCache;
    public cache: Map<string, TrainingModule>;
    public selectedModules: Set<string>;
    public selectedSubModules: Set<string>;
    public selectedCardDecks: Set<string>;
    public selectedCards: Set<string>;

    private constructor() {
        this.cache = new Map();
        this.selectedModules = new Set();
        this.selectedSubModules = new Set();
        this.selectedCardDecks = new Set();
        this.selectedCards = new Set();
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
        trainingModules.forEach(module => {
            this.cache.set(module.id, module);
            this.selectedModules.add(module.id);
            module.submodules.forEach(subModule => {
                this.selectedSubModules.add(subModule.id);
                subModule.cardDecks.forEach(deck => {
                    this.selectedCardDecks.add(deck.id);
                    deck.cards.forEach(card => this.selectedCards.add(card.id));
                });
            });
        });
    }

    public toggleModuleSelection(id: string): void {
        if (this.selectedModules.has(id)) {
            this.selectedModules.delete(id);
        } else {
            this.selectedModules.add(id);
        }
    }

    public isModuleSelected(id: string): boolean {
        return this.selectedModules.has(id);
    }

    public isSubModuleSelected(id: string): boolean {
        return this.selectedSubModules.has(id);
    }

    public isCardDeckSelected(id: string): boolean {
        return this.selectedCardDecks.has(id);
    }

    public isCardSelected(id: string): boolean {
        return this.selectedCards.has(id);
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
        this.selectedModules.clear();
        this.selectedSubModules.clear();
        this.selectedCardDecks.clear();
        this.selectedCards.clear();
    }
}

export default TrainingModuleCache;