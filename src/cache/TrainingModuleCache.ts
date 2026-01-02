import { TrainingModule } from "../types/TrainingModule";
import { Card } from "../types/Card";
import { generateCardSlug } from "../utils/slug";
import TrainingModuleSelectionStore, { SelectionRecord } from "../store/TrainingModuleSelectionStore";

export interface CardMeta {
    moduleId: string;
    moduleName: string;
    moduleColor: string;
    subModuleId: string;
    subModuleName: string;
    cardDeckId: string;
    cardDeckName: string;
}

export class TrainingModuleCache {
    private static instance: TrainingModuleCache;
    public cache: Map<string, TrainingModule>;
    public selectedModules: Set<string>;
    public selectedSubModules: Set<string>;
    public selectedCardDecks: Set<string>;
    public selectedCards: Set<string>;
    public cardIndex: Map<string, CardMeta>;
    public cardIdToSlug: Map<string, string>;
    public slugToCardId: Map<string, string>;
    private selectionListeners: Set<() => void>;

    private constructor() {
        this.cache = new Map();
        this.selectedModules = new Set();
        this.selectedSubModules = new Set();
        this.selectedCardDecks = new Set();
        this.selectedCards = new Set();
        this.cardIndex = new Map();
        this.cardIdToSlug = new Map();
        this.slugToCardId = new Map();
        this.selectionListeners = new Set();
    }

    public static getInstance(): TrainingModuleCache {
        if (!TrainingModuleCache.instance) {
            TrainingModuleCache.instance = new TrainingModuleCache();
        }
        return TrainingModuleCache.instance;
    }

    public async loadData(trainingModules: TrainingModule[]): Promise<void> {
        this.clearCache();

        const shouldHydrateSelections = TrainingModuleSelectionStore.syncDataSignature(
            this.computeDataSignature(trainingModules)
        );

        trainingModules.forEach(module => {
            this.cache.set(module.id, module);

            module.submodules.forEach(subModule => {
                subModule.cardDecks.forEach(deck => {
                    deck.cards.forEach(card => {
                        const meta: CardMeta = {
                            moduleId: module.id,
                            moduleName: module.name,
                            moduleColor: module.color,
                            subModuleId: subModule.id,
                            subModuleName: subModule.name,
                            cardDeckId: deck.id,
                            cardDeckName: deck.name,
                        };

                        this.cardIndex.set(card.id, meta);

                        let slug = generateCardSlug({
                            moduleId: module.id,
                            subModuleId: subModule.id,
                            cardDeckId: deck.id,
                            cardId: card.id,
                        });

                        let salt = 1;
                        while (this.slugToCardId.has(slug) && this.slugToCardId.get(slug) !== card.id) {
                            slug = generateCardSlug({
                                moduleId: module.id,
                                subModuleId: subModule.id,
                                cardDeckId: deck.id,
                                cardId: card.id,
                            }, salt);
                            salt += 1;
                        }

                        this.cardIdToSlug.set(card.id, slug);
                        this.slugToCardId.set(slug, card.id);
                    });
                });
            });
        });

        this.selectModules(undefined, { suppressNotification: true, skipPersistence: true });

        if (shouldHydrateSelections) {
            this.hydrateSelectionsFromStore();
        } else {
            this.persistSelectionState();
        }

        this.notifySelectionListeners();

        console.log(`TrainingModuleCache Loaded ${this.cache.size} training modules.`);
        console.log(`TrainingModuleCache Loaded ${this.selectedSubModules.size} training submodules.`);
        console.log(`TrainingModuleCache Loaded ${this.selectedCardDecks.size} card decks.`);
        console.log(`TrainingModuleCache Loaded ${this.selectedCards.size} cards.`);
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
        this.persistSelectionState();
        this.notifySelectionListeners();
    }

    public toggleSubModuleSelection(id: string): void {
        if (this.selectedSubModules.has(id)) {
            this.selectedSubModules.delete(id);
        } else {
            this.selectedSubModules.add(id);
        }
        this.persistSelectionState();
        this.notifySelectionListeners();
    }

    public toggleCardDeckSelection(id: string): void {
        if (this.selectedCardDecks.has(id)) {
            this.selectedCardDecks.delete(id);
        } else {
            this.selectedCardDecks.add(id);
        }
        this.persistSelectionState();
        this.notifySelectionListeners();
    }

    public toggleCardSelection(id: string): void {
        if (this.selectedCards.has(id)) {
            this.selectedCards.delete(id);
        } else {
            this.selectedCards.add(id);
        }
        this.persistSelectionState();
        this.notifySelectionListeners();
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
        this.cardIndex.clear();
        this.cardIdToSlug.clear();
        this.slugToCardId.clear();
    }

    private persistSelectionState(): void {
        TrainingModuleSelectionStore.saveSelectedModules(this.convertSetToSelectionRecord(this.selectedModules));
        TrainingModuleSelectionStore.saveSelectedSubModules(this.convertSetToSelectionRecord(this.selectedSubModules));
        TrainingModuleSelectionStore.saveSelectedCardDecks(this.convertSetToSelectionRecord(this.selectedCardDecks));
        TrainingModuleSelectionStore.saveSelectedCards(this.convertSetToSelectionRecord(this.selectedCards));
    }

    private hydrateSelectionsFromStore(): void {
        const persistedModules = TrainingModuleSelectionStore.getSelectedModules();
        const persistedSubModules = TrainingModuleSelectionStore.getSelectedSubModules();
        const persistedCardDecks = TrainingModuleSelectionStore.getSelectedCardDecks();
        const persistedCards = TrainingModuleSelectionStore.getSelectedCards();

        if (!persistedModules && !persistedSubModules && !persistedCardDecks && !persistedCards) {
            this.persistSelectionState();
            return;
        }

        const allModuleIds = new Set(this.selectedModules);
        const allSubModuleIds = new Set(this.selectedSubModules);
        const allCardDeckIds = new Set(this.selectedCardDecks);
        const allCardIds = new Set(this.selectedCards);

        this.selectedModules.clear();
        this.selectedSubModules.clear();
        this.selectedCardDecks.clear();
        this.selectedCards.clear();

        this.applySelectionRecord(persistedModules, allModuleIds, this.selectedModules, 'module');
        this.applySelectionRecord(persistedSubModules, allSubModuleIds, this.selectedSubModules, 'submodule');
        this.applySelectionRecord(persistedCardDecks, allCardDeckIds, this.selectedCardDecks, 'card deck');
        this.applySelectionRecord(persistedCards, allCardIds, this.selectedCards, 'card');

        this.persistSelectionState();
    }

    private applySelectionRecord(
        record: SelectionRecord | undefined,
        validIds: Set<string>,
        target: Set<string>,
        label: string
    ) {
        if (!record) {
            return;
        }

        Object.entries(record).forEach(([id, isSelected]) => {
            if (!isSelected) {
                return;
            }

            if (validIds.has(id)) {
                target.add(id);
            } else {
                console.warn(`TrainingModuleCache: Stored ${label} id "${id}" no longer exists. Ignoring.`);
            }
        });
    }

    private convertSetToSelectionRecord(set: Set<string>): SelectionRecord {
        const record: SelectionRecord = {};
        set.forEach(id => {
            record[id] = true;
        });
        return record;
    }

    private computeDataSignature(trainingModules: TrainingModule[]): string {
        const moduleParts = trainingModules
            .map(module => {
                const subModuleParts = module.submodules
                    .map(subModule => {
                        const deckParts = subModule.cardDecks
                            .map(deck => {
                                const cardParts = deck.cards
                                    .map(card => card.id)
                                    .sort()
                                    .join(',');
                                return `${deck.id}:${cardParts}`;
                            })
                            .sort()
                            .join('|');
                        return `${subModule.id}:${deckParts}`;
                    })
                    .sort()
                    .join('#');
                return `${module.id}:${subModuleParts}`;
            })
            .sort()
            .join('~');

        return moduleParts;
    }

    public selectModules(
        moduleIds?: string[],
        options?: { suppressNotification?: boolean; skipPersistence?: boolean }
    ): void {
        const idsToSelect = moduleIds && moduleIds.length > 0 ? new Set(moduleIds) : null;

        this.selectedModules.clear();
        this.selectedSubModules.clear();
        this.selectedCardDecks.clear();
        this.selectedCards.clear();

        this.cache.forEach(module => {
            if (!idsToSelect || idsToSelect.has(module.id)) {
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
            }
        });

        if (!options?.skipPersistence) {
            this.persistSelectionState();
        }

        if (!options?.suppressNotification) {
            this.notifySelectionListeners();
        }
    }

    public subscribeToSelectionChanges(listener: () => void): () => void {
        this.selectionListeners.add(listener);
        return () => {
            this.selectionListeners.delete(listener);
        };
    }

    private notifySelectionListeners(): void {
        this.selectionListeners.forEach(listener => listener());
    }

    public getCardMeta(cardId: string): CardMeta | undefined {
        return this.cardIndex.get(cardId);
    }

    public getCardById(cardId: string): Card | undefined {
        const meta = this.getCardMeta(cardId);
        if (!meta) {
            return undefined;
        }

        const module = this.cache.get(meta.moduleId);
        if (!module) {
            return undefined;
        }

        const subModule = module.submodules.find(sm => sm.id === meta.subModuleId);
        if (!subModule) {
            return undefined;
        }

        const deck = subModule.cardDecks.find(cd => cd.id === meta.cardDeckId);
        if (!deck) {
            return undefined;
        }

        return deck.cards.find(card => card.id === cardId);
    }

    public getSlugForCard(cardId: string): string | undefined {
        return this.cardIdToSlug.get(cardId);
    }

    public getCardIdBySlug(slug: string): string | undefined {
        return this.slugToCardId.get(slug);
    }
}

export default TrainingModuleCache;