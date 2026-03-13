import { TrainingModule } from "../types/TrainingModule";
import { TrainingSubModule } from "../types/TrainingSubModule";
import { CardDeck } from "../types/CardDeck";
import { Card } from "../types/Card";
//import TrainingModuleCache from "../cache/TrainingModuleCache";
import { modulePaths } from "./modulePaths"; // Import the generated module paths
import { subModulePaths } from "./subModulePaths"; // Import the generated submodule paths
import { cardDeckPaths } from "./cardDeckPaths"; // Import the generated card deck paths
import { isFeatureEnabled } from "../config/featureFlags";
import { withCache } from "./cache/indexedDbCache";
import { TTL_MS } from "./cache/constants";

class CardDataLoader {
    // Load all data and cache it
    async loadAllData(onProgress: () => void, onPartialFailure?: (message: string) => void): Promise<TrainingModule[]> {
        try {
            console.log("CardDataLoader: Starting to load all data...");
            const trainingModules = await this.loadTrainingModules(onProgress, onPartialFailure);
            console.log(`CardDataLoader: Fetched ${trainingModules.length} training modules.`);
            return trainingModules; // Return loaded data
        } catch (error) {
            console.error("CardDataLoader: Failed to load all data:", error);
            return [];
        }
    }

    // Load training modules from JSON files
    async loadTrainingModules(onProgress: () => void, onPartialFailure?: (message: string) => void): Promise<TrainingModule[]> {
        const moduleKeys = Object.keys(modulePaths) as Array<keyof typeof modulePaths>;

        const loadModules = async () => {
            const moduleResults = await Promise.allSettled(
                moduleKeys.map(async (moduleKey) => {
                    const moduleLoader = modulePaths[moduleKey];
                    const moduleId = moduleKey as string;

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
                                                badge: deckData.badge,
                                                difficultyTags: deckData.difficultyTags,
                                                cards: deckData.cards.map((card: Card) => {
                                                    const bulletpoints = Array.isArray(card.bulletpoints)
                                                        ? card.bulletpoints
                                                        : typeof card.bulletpoints === 'string'
                                                        ? (card.bulletpoints as string).split(',').map((point: string) => point.trim())
                                                        : [];
                                                    const summaryText = typeof card.summaryText === 'string'
                                                        ? card.summaryText
                                                        : '';
                                                    const duration = typeof card.duration === 'number'
                                                        ? card.duration
                                                        : typeof card.duration === 'string'
                                                        ? parseFloat(card.duration) || 0
                                                        : 0;
                                                    return {
                                                        id: card.id,
                                                        title: card.title,
                                                        description: card.description,
                                                        bulletpoints: bulletpoints,
                                                        duration,
                                                        difficulty: card.difficulty,
                                                        summaryText,
                                                        classification: card.classification,
                                                        // Pass through new optional fields when present
                                                        ...(card.content != null && { content: card.content }),
                                                        ...(Array.isArray(card.exercises) && card.exercises.length > 0 && { exercises: card.exercises }),
                                                        ...(Array.isArray(card.keyTerms) && card.keyTerms.length > 0 && { keyTerms: card.keyTerms }),
                                                        ...(Array.isArray(card.references) && card.references.length > 0 && { references: card.references }),
                                                        ...(Array.isArray(card.prerequisites) && card.prerequisites.length > 0 && { prerequisites: card.prerequisites }),
                                                        ...(Array.isArray(card.learningObjectives) && card.learningObjectives.length > 0 && { learningObjectives: card.learningObjectives }),
                                                    };
                                                })
                                            };
                                        } catch (error) {
                                            console.error(`Failed to load card deck ${deckId}:`, error);
                                            onPartialFailure?.(`Card deck ${deckId} failed to load; showing fallback.`);
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
                                onPartialFailure?.(`Submodule ${subModuleId} failed to load; showing fallback.`);
                                return this.createFallbackSubModule(subModuleId);
                            }
                        })
                    );

                    return {
                        id: moduleData.id,
                        name: moduleData.name,
                        description: moduleData.description,
                        color: moduleData.color,
                        submodules: subModules
                    } satisfies TrainingModule;
                })
            );

            return moduleResults.map((result, index) => {
                if (result.status === "fulfilled") {
                    return result.value;
                }
                const failedModuleId = moduleKeys[index] as string;
                console.error(`Failed to load training module ${failedModuleId}:`, result.reason);
                onPartialFailure?.(`Training module ${failedModuleId} failed to load; showing fallback.`);
                return this.createFallbackTrainingModule(failedModuleId);
            });
        };

        if (isFeatureEnabled('loadingCacheV2')) {
            const appVersion = ((import.meta as any).env?.VITE_APP_VERSION as string | undefined) ?? 'dev';
            const cached = await withCache<TrainingModule[]>(
                'moduleCatalog',
                'all',
                TTL_MS.moduleCatalog,
                'moduleCatalog-' + appVersion,
                loadModules,
                { logger: (msg, meta) => console.info(`moduleCache: ${msg}`, meta) }
            );
            return cached.data;
        }

        return loadModules();
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