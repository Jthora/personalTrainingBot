import { TrainingModule } from "../types/TrainingModule";
import { TrainingSubModule } from "../types/TrainingSubModule";
import { CardDeck } from "../types/CardDeck";
import { Card } from "../types/Card";
import TrainingModuleCache from "../cache/TrainingModuleCache";
import { TrainingModuleReference } from "../types/TrainingModuleReference";

class DataLoader {
    private dataPath = "/src/data";

    // Load all data and cache it
    async loadAllData() {
        try {
            console.log("Starting to load all data...");
            const trainingModules = await this.loadTrainingModules();
            console.log(`Fetched ${trainingModules.length} training modules.`);
            await TrainingModuleCache.getInstance().loadData(trainingModules);
            console.log("Successfully loaded and cached all data.");
        } catch (error) {
            console.error("Failed to load all data:", error);
        }
    }

    // Load training modules from JSON files
    async loadTrainingModules(): Promise<TrainingModule[]> {
        const modulesPath = `${this.dataPath}/training_modules.json`;
        let data;
        try {
            console.log(`Fetching training modules from ${modulesPath}...`);
            const response = await fetch(modulesPath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            data = await response.json();
            console.log("Successfully fetched and parsed training modules JSON.");
        } catch (error) {
            console.error(`Failed to fetch or parse ${modulesPath}:`, error);
            if (error instanceof Error) {
                throw new Error(`Could not load training modules: ${error.message}`);
            }
        }

        if (!data || !data.modules) {
            throw new Error("Invalid data format: 'modules' field is missing.");
        }

        const trainingModules: TrainingModule[] = [];

        for (const moduleRef of data.modules as TrainingModuleReference[]) {
            try {
                const modulePath = `${this.dataPath}/training_modules/${moduleRef.id}.json`;
                const moduleResponse = await fetch(modulePath);
                if (!moduleResponse.ok) {
                    throw new Error(`HTTP error! status: ${moduleResponse.status}`);
                }
                const moduleData = await moduleResponse.json();

                const subModules: TrainingSubModule[] = await Promise.all(
                    moduleData.submodules.map(async (subModuleId: string) => {
                        try {
                            const subModulePath = `${this.dataPath}/training_modules/training_sub_modules/${moduleRef.id}/${subModuleId}.json`;
                            const subModuleResponse = await fetch(subModulePath);
                            if (!subModuleResponse.ok) {
                                throw new Error(`HTTP error! status: ${subModuleResponse.status}`);
                            }
                            const subModuleData = await subModuleResponse.json();

                            const cardDecks: CardDeck[] = await Promise.all(
                                subModuleData.cardDecks.map(async (deckId: string) => {
                                    try {
                                        const deckPath = `${this.dataPath}/training_modules/training_sub_modules/${moduleRef.id}/card_decks/${subModuleId}/${deckId}.json`;
                                        const deckResponse = await fetch(deckPath);
                                        if (!deckResponse.ok) {
                                            throw new Error(`HTTP error! status: ${deckResponse.status}`);
                                        }
                                        const deckText = await deckResponse.text();
                                        const deckData = JSON.parse(deckText);
                                        return {
                                            id: deckData.id,
                                            name: deckData.name,
                                            description: deckData.description,
                                            focus: deckData.focus,
                                            cards: deckData.cards.map((card: Card) => ({
                                                id: card.id,
                                                title: card.title,
                                                description: card.description,
                                                bulletpoints: Array.isArray(card.bulletpoints) ? card.bulletpoints : [],
                                                duration: card.duration,
                                                difficulty: card.difficulty
                                            }))
                                        };
                                    } catch (error) {
                                        console.error(`Failed to load card deck ${deckId}:`, error);
                                        return this.createFallbackCardDeck(deckId);
                                    }
                                })
                            );

                            return {
                                id: subModuleData.id,
                                name: subModuleData.name,
                                description: subModuleData.description,
                                difficulty: subModuleData.difficulty,
                                estimated_time: subModuleData.estimated_time,
                                focus: subModuleData.focus,
                                cardDecks: cardDecks
                            };
                        } catch (error) {
                            console.error(`Failed to load submodule ${subModuleId}:`, error);
                            return this.createFallbackSubModule(subModuleId);
                        }
                    })
                );

                trainingModules.push({
                    id: moduleData.id,
                    name: moduleData.name,
                    description: moduleData.description,
                    submodules: subModules
                });
            } catch (error) {
                console.error(`Failed to load training module ${moduleRef.id}:`, error);
                trainingModules.push(this.createFallbackTrainingModule(moduleRef.id));
            }
        }

        return trainingModules;
    }

    private createFallbackCardDeck(deckId: string): CardDeck {
        return {
            id: deckId,
            name: "Unknown Deck",
            description: "No description available",
            focus: ["Default"],
            cards: []
        };
    }

    private createFallbackSubModule(subModuleId: string): TrainingSubModule {
        return {
            id: subModuleId,
            name: "Unknown Submodule",
            description: "No description available",
            difficulty: "Unknown",
            estimated_time: "Unknown",
            focus: ["Default"],
            cardDecks: []
        };
    }

    private createFallbackTrainingModule(moduleId: string): TrainingModule {
        return {
            id: moduleId,
            name: "Unknown Module",
            description: "No description available",
            submodules: []
        };
    }
}

export default DataLoader;