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
            console.log("Starting to load all data...");
            const trainingModules = await this.loadTrainingModules(onProgress);
            console.log(`Fetched ${trainingModules.length} training modules.`);
            return trainingModules; // Return loaded data
        } catch (error) {
            console.error("Failed to load all data:", error);
            return [];
        }
    }

    // Load training modules from JSON files
    async loadTrainingModules(onProgress: () => void): Promise<TrainingModule[]> {
        const trainingModules: TrainingModule[] = [];

        for (const moduleId in modulePaths) {
            try {
                const moduleData = await modulePaths[moduleId]();
                const subModules: TrainingSubModule[] = await Promise.all(
                    moduleData.submodules.map(async (subModuleId: string) => {
                        try {
                            const subModuleData = await subModulePaths[`${moduleId}_${subModuleId}`]();

                            const cardDecks: CardDeck[] = await Promise.all(
                                subModuleData.cardDecks.map(async (deckId: string) => {
                                    try {
                                        const deckData = await cardDeckPaths[`${moduleId}_${subModuleId}_${deckId}`]();
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
                                                return {
                                                    id: card.id,
                                                    title: card.title,
                                                    description: card.description,
                                                    bulletpoints: bulletpoints,
                                                    duration: card.duration,
                                                    difficulty: card.difficulty
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