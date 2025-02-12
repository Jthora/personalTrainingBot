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

    public static getInstance(): TrainingModuleCache {
        if (!TrainingModuleCache.instance) {
            TrainingModuleCache.instance = new TrainingModuleCache();
        }
        return TrainingModuleCache.instance;
    }

    public async loadData(trainingModules: TrainingModule[]): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                trainingModules.forEach(module => {
                    this.cache.set(module.id, module);
                    this.selectedModules.add(module.id);
                    module.submodules.forEach(subModule => {
                        this.selectedSubModules.add(subModule.id);
                        subModule.cardDecks.forEach(deck => {
                            this.selectedCardDecks.add(deck.id);
                            deck.cards.forEach(card => {
                                this.selectedCards.add(card.id);
                            });
                        });
                    });
                });
                console.log(`TrainingModuleCache Loaded ${this.cache.size} training modules.`);
                console.log(`TrainingModuleCache Loaded ${this.selectedSubModules.size} training submodules.`);
                console.log(`TrainingModuleCache Loaded ${this.selectedCardDecks.size} card decks.`);
                console.log(`TrainingModuleCache Loaded ${this.selectedCards.size} cards.`);
                resolve();
            }, 1000); // Simulate a delay
        });
    }

    public isLoaded(): boolean {
        return this.cache.size > 0;
    }

    public getTrainingModule(id: string): TrainingModule | undefined {
        return this.cache.get(id);
    }

    public toggleModuleSelection(id: string): void {
        if (this.selectedModules.has(id)) {
            this.selectedModules.delete(id);
        } else {
            this.selectedModules.add(id);
        }
    }

    public toggleSubModuleSelection(id: string): void {
        if (this.selectedSubModules.has(id)) {
            this.selectedSubModules.delete(id);
        } else {
            this.selectedSubModules.add(id);
        }
    }

    public toggleCardDeckSelection(id: string): void {
        if (this.selectedCardDecks.has(id)) {
            this.selectedCardDecks.delete(id);
        } else {
            this.selectedCardDecks.add(id);
        }
    }

    public toggleCardSelection(id: string): void {
        if (this.selectedCards.has(id)) {
            this.selectedCards.delete(id);
        } else {
            this.selectedCards.add(id);
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

    public clearCache(): void {
        this.cache.clear();
        this.selectedModules.clear();
        this.selectedSubModules.clear();
        this.selectedCardDecks.clear();
        this.selectedCards.clear();
    }
}

export default TrainingModuleCache;