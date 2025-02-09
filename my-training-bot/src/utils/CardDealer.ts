import TrainingModuleCache from '../cache/TrainingModuleCache';
import { Card } from '../types/Card';

class CardDealer {
    public getCards(): Card[] {
        const cache = TrainingModuleCache.getInstance();
        const selectedModules = Array.from(cache.selectedModules);
        const cards: Card[] = [];

        selectedModules.forEach(moduleId => {
            const module = cache.getTrainingModule(moduleId);
            if (module) {
                module.submodules.forEach(subModule => {
                    if (cache.isSubModuleSelected(subModule.id)) {
                        subModule.cardDecks.forEach(deck => {
                            if (cache.isCardDeckSelected(deck.id)) {
                                deck.cards.forEach(card => {
                                    if (cache.isCardSelected(card.id)) {
                                        cards.push(card);
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });

        return cards;
    }
}

export default CardDealer;