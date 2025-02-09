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
            TrainingModuleCache.getInstance().loadData(trainingModules);
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
            // Fetch and parse the main training modules JSON file
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

        // Iterate over each module reference in the main JSON file
        for (const moduleRef of data.modules as TrainingModuleReference[]) {
            try {
                const modulePath = `${this.dataPath}/training_modules/${moduleRef.id}.json`;
                console.log(`Fetching training module from ${modulePath}...`);
                const moduleResponse = await fetch(modulePath);
                if (!moduleResponse.ok) {
                    throw new Error(`HTTP error! status: ${moduleResponse.status}`);
                }
                const moduleData = await moduleResponse.json();
                console.log(`Successfully fetched and parsed training module ${moduleRef.id}.`);

                // Load submodules for each training module
                const subModules: TrainingSubModule[] = await Promise.all(
                    moduleData.submodules.map(async (subModuleId: string) => {
                        try {
                            const subModulePath = `${this.dataPath}/training_modules/training_sub_modules/${subModuleId}.json`;
                            console.log(`Fetching submodule from ${subModulePath}...`);
                            const subModuleResponse = await fetch(subModulePath);
                            if (!subModuleResponse.ok) {
                                throw new Error(`HTTP error! status: ${subModuleResponse.status}`);
                            }
                            const subModuleData = await subModuleResponse.json();
                            console.log(`Successfully fetched and parsed submodule ${subModuleId}.`);

                            // Load card decks for each submodule
                            const cardDecks: CardDeck[] = await Promise.all(
                                subModuleData.cardDecks.map(async (deckId: string) => {
                                    try {
                                        const deckPath = `${this.dataPath}/training_modules/card_decks/${deckId}.json`;
                                        console.log(`Fetching card deck from ${deckPath}...`);
                                        const deckResponse = await fetch(deckPath);
                                        if (!deckResponse.ok) {
                                            throw new Error(`HTTP error! status: ${deckResponse.status}`);
                                        }
                                        const deckData = await deckResponse.json();
                                        console.log(`Successfully fetched and parsed card deck ${deckId}.`);
                                        return {
                                            id: deckData.id,
                                            name: deckData.name,
                                            description: deckData.description,
                                            focus: deckData.focus,
                                            cards: deckData.cards.map((card: Card) => ({
                                                id: card.id,
                                                title: card.title,
                                                description: card.description,
                                                bulletpoints: card.bulletpoints,
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

                // Add the loaded training module to the list
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

    // Create a fallback card deck in case of failure
    private createFallbackCardDeck(deckId: string): CardDeck {
        return {
            id: deckId,
            name: "Unknown Deck",
            description: "No description available",
            focus: ["Default"],
            cards: []
        };
    }

    // Create a fallback submodule in case of failure
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

    // Create a fallback training module in case of failure
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