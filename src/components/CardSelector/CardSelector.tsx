import React, { useEffect, useMemo, useState } from 'react';
import TrainingModuleCache from '../../cache/TrainingModuleCache';
import { TrainingModule } from '../../types/TrainingModule';
import styles from './CardSelector.module.css';
import { useCoachSelection } from '../../hooks/useCoachSelection';
import { coaches } from '../../data/coaches';
import { getCoachDefaultModules } from '../../data/coachModuleMapping';
import { clearCoachOverrideModules, getCoachOverrideModules, saveCoachOverrideModules } from '../../utils/coachModulePreferences';

const CardSelector: React.FC = () => {
    const [trainingModules, setTrainingModules] = useState<TrainingModule[]>([]);
    const [selectionVersion, setSelectionVersion] = useState(0);
    const [visibleModules, setVisibleModules] = useState<Set<string>>(new Set());
    const [visibleSubModules, setVisibleSubModules] = useState<Set<string>>(new Set());
    const [visibleCardDecks, setVisibleCardDecks] = useState<Set<string>>(new Set());
    const { coachId: selectedCoach } = useCoachSelection();
    const coachData = coaches.find(coach => coach.id === selectedCoach);
    const [customPreset, setCustomPreset] = useState<string[] | undefined>(() => getCoachOverrideModules(selectedCoach));

    useEffect(() => {
        const cache = TrainingModuleCache.getInstance();

        const syncTrainingModules = () => {
            setTrainingModules(Array.from(cache.cache.values()));
        };

        if (cache.isLoaded()) {
            syncTrainingModules();
        }

        const unsubscribe = cache.subscribeToSelectionChanges(() => {
            setSelectionVersion(prev => prev + 1);
            syncTrainingModules();
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const moduleNameMap = useMemo(() => {
        const map = new Map<string, string>();
        trainingModules.forEach(module => {
            map.set(module.id, module.name);
        });
        return map;
    }, [trainingModules]);

    useEffect(() => {
        setCustomPreset(getCoachOverrideModules(selectedCoach));
    }, [selectedCoach, selectionVersion]);
    const defaultPreset = useMemo(() => getCoachDefaultModules(selectedCoach), [selectedCoach]);
    const hasCustomPreset = Boolean(customPreset && customPreset.length);

    const renderModuleTags = (moduleIds?: string[]) => {
        if (!moduleIds) {
            return <span className={styles.moduleChip}>All modules</span>;
        }

        if (moduleIds.length === 0) {
            return <span className={styles.moduleChip}>None selected</span>;
        }

        return moduleIds.map(moduleId => (
            <span key={moduleId} className={styles.moduleChip}>
                {moduleNameMap.get(moduleId) ?? moduleId}
            </span>
        ));
    };

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
    };

    const toggleSubModuleSelection = (id: string) => {
        const cache = TrainingModuleCache.getInstance();
        cache.toggleSubModuleSelection(id);
    };

    const toggleCardDeckSelection = (id: string) => {
        const cache = TrainingModuleCache.getInstance();
        cache.toggleCardDeckSelection(id);
    };

    const toggleCardSelection = (id: string) => {
        const cache = TrainingModuleCache.getInstance();
        cache.toggleCardSelection(id);
    };

    const handleSaveCoachPreset = () => {
        const cache = TrainingModuleCache.getInstance();
        saveCoachOverrideModules(selectedCoach, Array.from(cache.selectedModules));
    };

    const handleClearCoachPreset = () => {
        clearCoachOverrideModules(selectedCoach);
    };

    const handleApplyCoachDefault = () => {
        const cache = TrainingModuleCache.getInstance();
        cache.selectModules(defaultPreset);
    };

    return (
        <div className={styles.cardSelector}>
            <div className={styles.coachPresetSummary}>
                <div>
                    <div className={styles.presetHeader}>
                        <h2>Training Modules</h2>
                        <span className={styles.presetStatus}>
                            Active Coach: {coachData?.name ?? 'Unknown'}
                        </span>
                    </div>
                    <p className={styles.presetActiveIndicator}>
                        Active preset: {hasCustomPreset ? 'Custom override' : 'Coach default'}
                    </p>
                    <div className={styles.moduleSummaryRow}>
                        <span className={styles.moduleSummaryLabel}>Default preset:</span>
                        <div className={styles.moduleSummaryList}>{renderModuleTags(defaultPreset)}</div>
                    </div>
                    {hasCustomPreset && (
                        <div className={styles.moduleSummaryRow}>
                            <span className={styles.moduleSummaryLabel}>Custom preset:</span>
                            <div className={styles.moduleSummaryList}>{renderModuleTags(customPreset)}</div>
                        </div>
                    )}
                </div>
                <div className={styles.presetActions}>
                    <button type="button" onClick={handleSaveCoachPreset}>
                        Save current selection as custom preset
                    </button>
                    <button type="button" onClick={handleApplyCoachDefault}>
                        Apply coach default modules
                    </button>
                    {hasCustomPreset && (
                        <button type="button" onClick={handleClearCoachPreset}>
                            Clear custom preset
                        </button>
                    )}
                </div>
            </div>
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