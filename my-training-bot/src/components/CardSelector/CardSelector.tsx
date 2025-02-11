import React, { useEffect, useState } from 'react';
import TrainingModuleCache from '../../cache/TrainingModuleCache';
import { TrainingModule } from '../../types/TrainingModule';
import styles from './CardSelector.module.css';

const CardSelector: React.FC = () => {
    const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([]);
    const [visibleModules, setVisibleModules] = useState<Set<string>>(new Set());
    const [visibleSubModules, setVisibleSubModules] = useState<Set<string>>(new Set());
    const [visibleCardDecks, setVisibleCardDecks] = useState<Set<string>>(new Set());

    useEffect(() => {
        const cache = TrainingModuleCache.getInstance();
        if (cache.isLoaded()) {
            setTrainingModules(Array.from(cache.cache.values()));
        }
    }, []);

    const toggleVisibility = (id: string, setVisible: React.Dispatch<React.SetStateAction<Set<string>>>) => {
        setVisible(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const toggleModuleSelection = (id: string) => {
        const cache = TrainingModuleCache.getInstance();
        cache.toggleModuleSelection(id);
        setTrainingModules([...trainingModules]); // Trigger re-render
    };

    const toggleSubModuleSelection = (id: string) => {
        const cache = TrainingModuleCache.getInstance();
        cache.toggleSubModuleSelection(id);
        setTrainingModules([...trainingModules]); // Trigger re-render
    };

    const toggleCardDeckSelection = (id: string) => {
        const cache = TrainingModuleCache.getInstance();
        cache.toggleCardDeckSelection(id);
        setTrainingModules([...trainingModules]); // Trigger re-render
    };

    const toggleCardSelection = (id: string) => {
        const cache = TrainingModuleCache.getInstance();
        cache.toggleCardSelection(id);
        setTrainingModules([...trainingModules]); // Trigger re-render
    };

    return (
        <div className={styles.cardSelector}>
            <h1>Card Selector</h1>
            <h3>Training Modules</h3>
            {trainingModules.map(module => (
                <div key={module.id} className={styles.module}>
                    <input
                        type="checkbox"
                        checked={TrainingModuleCache.getInstance().isModuleSelected(module.id)}
                        onChange={() => toggleModuleSelection(module.id)}
                    />
                    <span>{module.name}</span>
                    <button className={styles.dropdownButton} onClick={() => toggleVisibility(module.id, setVisibleModules)}>
                        {visibleModules.has(module.id) ? '▬' : '▼'}
                    </button>
                    {visibleModules.has(module.id) && (
                        <div className={styles.subModules}>
                            {module.submodules.map(subModule => (
                                <div key={subModule.id} className={styles.subModule}>
                                    <input
                                        type="checkbox"
                                        checked={TrainingModuleCache.getInstance().isSubModuleSelected(subModule.id)}
                                        onChange={() => toggleSubModuleSelection(subModule.id)}
                                    />
                                    <span>{subModule.name}</span>
                                    <button className={styles.dropdownButton} onClick={() => toggleVisibility(subModule.id, setVisibleSubModules)}>
                                        {visibleSubModules.has(subModule.id) ? '▬' : '▼'}
                                    </button>
                                    {visibleSubModules.has(subModule.id) && (
                                        <div className={styles.cardDecks}>
                                            {subModule.cardDecks.map(deck => (
                                                <div key={deck.id} className={styles.cardDeck}>
                                                    <input
                                                        type="checkbox"
                                                        checked={TrainingModuleCache.getInstance().isCardDeckSelected(deck.id)}
                                                        onChange={() => toggleCardDeckSelection(deck.id)}
                                                    />
                                                    <span>{deck.name}</span>
                                                    <button className={styles.dropdownButton} onClick={() => toggleVisibility(deck.id, setVisibleCardDecks)}>
                                                        {visibleCardDecks.has(deck.id) ? '▬' : '▼'}
                                                    </button>
                                                    {visibleCardDecks.has(deck.id) && (
                                                        <div className={styles.cards}>
                                                            {deck.cards.map(card => (
                                                                <div key={card.id} className={styles.card}>
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={TrainingModuleCache.getInstance().isCardSelected(card.id)}
                                                                        onChange={() => toggleCardSelection(card.id)}
                                                                    />
                                                                    <span>{card.title}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default CardSelector;