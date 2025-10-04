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

        console.log(`Available cards: ${cards.length}`);
        if (cards.length === 0) {
            console.error('No cards available in the cache.');
        }

        return cards;
    }

    public getRandomCard(): Card | null {
        const cards = this.getCards();
        if (cards.length === 0) {
            console.error('No cards available to select.');
            return null;
        }
        const randomIndex = Math.floor(Math.random() * cards.length);
        return cards[randomIndex];
    }
}

export default CardDealer;