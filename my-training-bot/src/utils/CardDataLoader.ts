import { TrainingModule } from "../types/TrainingModule";
import { TrainingSubModule } from "../types/TrainingSubModule";
import { CardDeck } from "../types/CardDeck";
import { Card } from "../types/Card";
//import TrainingModuleCache from "../cache/TrainingModuleCache";
import { modulePaths } from "./modulePaths"; // Import the generated module paths
import { subModulePaths } from "./subModulePaths"; // Import the generated submodule paths
import { cardDeckPaths } from "./cardDeckPaths"; // Import the generated card deck paths

class CardDataLoader {
    // Load all data and cache it
    async loadAllData(onProgress: () => void): Promise<TrainingModule[]> {
        try {
            console.log("CardDataLoader: Starting to load all data...");
            const trainingModules = await this.loadTrainingModules(onProgress);
            console.log(`CardDataLoader: Fetched ${trainingModules.length} training modules.`);
            return trainingModules; // Return loaded data
        } catch (error) {
            console.error("CardDataLoader: Failed to load all data:", error);
            return [];
        }
    }

    // Load training modules from JSON files
    async loadTrainingModules(onProgress: () => void): Promise<TrainingModule[]> {
        const trainingModules: TrainingModule[] = [];

        const moduleKeys = Object.keys(modulePaths) as Array<keyof typeof modulePaths>;

        for (const moduleKey of moduleKeys) {
            const moduleLoader = modulePaths[moduleKey];
            const moduleId = moduleKey as string;
            try {
                const moduleData = await moduleLoader();
                const subModules: TrainingSubModule[] = await Promise.all(
                    moduleData.submodules.map(async (subModuleId: string) => {
                        try {
                            const subModuleKey = `${moduleId}_${subModuleId}` as keyof typeof subModulePaths;
                            const subModuleLoader = subModulePaths[subModuleKey];
                            if (!subModuleLoader) {
                                console.warn(`No subModule loader found for ${moduleId}_${subModuleId}`);
                                return this.createFallbackSubModule(subModuleId);
                            }
                            const subModuleData = await subModuleLoader();

                            const cardDecks: CardDeck[] = await Promise.all(
                                subModuleData.cardDecks.map(async (deckId: string) => {
                                    try {
                                        const deckKey = `${moduleId}_${subModuleId}_${deckId}` as keyof typeof cardDeckPaths;
                                        const deckLoader = cardDeckPaths[deckKey];
                                        if (!deckLoader) {
                                            console.warn(`No card deck loader found for ${moduleId}_${subModuleId}_${deckId}`);
                                            return this.createFallbackCardDeck(deckId);
                                        }
                                        const deckData = await deckLoader();
                                        onProgress(); // Update progress
                                        return {
                                            id: deckData.id,
                                            name: deckData.name,
                                            description: deckData.description,
                                            focus: deckData.focus,
                                            cards: deckData.cards.map((card: Card) => {
                                                const bulletpoints = Array.isArray(card.bulletpoints)
                                                    ? card.bulletpoints
                                                    : typeof card.bulletpoints === 'string'
                                                    ? (card.bulletpoints as string).split(',').map((point: string) => point.trim())
                                                    : [];
                                                const summaryText = typeof card.summaryText === 'string'
                                                    ? card.summaryText
                                                    : '';
                                                return {
                                                    id: card.id,
                                                    title: card.title,
                                                    description: card.description,
                                                    bulletpoints: bulletpoints,
                                                    duration: card.duration,
                                                    difficulty: card.difficulty,
                                                    summaryText
                                                };
                                            })
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
                    color: moduleData.color,
                    submodules: subModules
                });
            } catch (error) {
                console.error(`Failed to load training module ${moduleId}:`, error);
                trainingModules.push(this.createFallbackTrainingModule(moduleId));
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
            color: "#FFFFFF",
            submodules: []
        };
    }
}

export default CardDataLoader;