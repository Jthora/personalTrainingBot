import React, { useState, useEffect } from 'react';
import TrainingCoachCache from '../../cache/TrainingCoachCache';
import DifficultySettingsStore from '../../store/DifficultySettingsStore';
import styles from './DifficultySettings.module.css';
import DifficultyLevel from '../../types/DifficultyLevel';
import DifficultyLevelData from '../../types/DifficultyLevelData';
import DifficultyRange from '../../types/DifficultyRange';

const DifficultySettings: React.FC = () => {
    const [difficultyLevels, setDifficultyLevels] = useState<DifficultyLevelData[]>([]);
    const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>(7);
    const [selectedDescription, setSelectedDescription] = useState<string>('');
    const [selectedMilitarySoldier, setSelectedMilitarySoldier] = useState<string[]>([]);
    const [selectedAthleteArchetype, setSelectedAthleteArchetype] = useState<string[]>([]);
    const [selectedPFT, setSelectedPFT] = useState<DifficultyLevelData['pft'] | null>(null);
    const [selectedRequirements, setSelectedRequirements] = useState<DifficultyLevelData['requirements'] | null>(null);
    const [range, setRange] = useState<DifficultyRange>([0, 0]);

    useEffect(() => {
        const loadDifficultyLevels = async () => {
            try {
                const cache = TrainingCoachCache.getInstance();
                await cache.loadData();
                const levels = cache.getDifficultyLevels();
                setDifficultyLevels(levels);

                // Load the selected difficulty from localStorage
                const settings = DifficultySettingsStore.getSettings();
                if (settings.selectedDifficulty && levels.some(level => level.level === settings.selectedDifficulty)) {
                    const selectedLevel = levels.find(level => level.level === settings.selectedDifficulty);
                    setSelectedDifficulty(settings.selectedDifficulty);
                    setSelectedDescription(selectedLevel?.description || '');
                    setSelectedMilitarySoldier(selectedLevel?.military_soldier || []);
                    setSelectedAthleteArchetype(selectedLevel?.athlete_archetype || []);
                    setSelectedPFT(selectedLevel?.pft || null);
                    setSelectedRequirements(selectedLevel?.requirements || null);
                    setRange(settings.range || [selectedLevel?.level || 0, selectedLevel?.level || 0]);
                } else if (levels.length > 0) {
                    const defaultLevel = levels[0];
                    if (defaultLevel) {
                        setSelectedDifficulty(defaultLevel.level);
                        setSelectedDescription(defaultLevel.description);
                        setSelectedMilitarySoldier(defaultLevel.military_soldier);
                        setSelectedAthleteArchetype(defaultLevel.athlete_archetype);
                        setSelectedPFT(defaultLevel.pft);
                        setSelectedRequirements(defaultLevel.requirements);
                        setRange([defaultLevel.level, defaultLevel.level]);
                    }
                }
            } catch (error) {
                console.error("Error loading difficulty levels:", error);
            }
        };
        loadDifficultyLevels();
    }, []);

    const reloadDifficultyLevels = async () => {
        try {
            const cache = TrainingCoachCache.getInstance();
            await cache.loadData();
            const levels = cache.getDifficultyLevels();
            setDifficultyLevels(levels);

            // Load the selected difficulty from localStorage
            const settings = DifficultySettingsStore.getSettings();
            if (settings.selectedDifficulty && levels.some(level => level.level === settings.selectedDifficulty)) {
                const selectedLevel = levels.find(level => level.level === settings.selectedDifficulty);
                setSelectedDifficulty(settings.selectedDifficulty);
                setSelectedDescription(selectedLevel?.description || '');
                setSelectedMilitarySoldier(selectedLevel?.military_soldier || []);
                setSelectedAthleteArchetype(selectedLevel?.athlete_archetype || []);
                setSelectedPFT(selectedLevel?.pft || null);
                setSelectedRequirements(selectedLevel?.requirements || null);
                setRange(settings.range || [selectedLevel?.level || 0, selectedLevel?.level || 0]);
            } else if (levels.length > 0) {
                const defaultLevel = levels[0];
                if (defaultLevel) {
                    setSelectedDifficulty(defaultLevel.level);
                    setSelectedDescription(defaultLevel.description);
                    setSelectedMilitarySoldier(defaultLevel.military_soldier);
                    setSelectedAthleteArchetype(defaultLevel.athlete_archetype);
                    setSelectedPFT(defaultLevel.pft);
                    setSelectedRequirements(defaultLevel.requirements);
                    setRange([defaultLevel.level, defaultLevel.level]);
                }
            }
        } catch (error) {
            console.error("Error reloading difficulty levels:", error);
        }
    };

    const handleDifficultyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newDifficulty = parseInt(event.target.value, 10);
        const selectedLevel = difficultyLevels.find(level => level.level === newDifficulty);
        if (selectedLevel) {
            const levelChange = selectedLevel.level - (difficultyLevels.find(level => level.level === selectedDifficulty)?.level || 0);
            const newRange: DifficultyRange = [Math.max(-1, range[0] + levelChange), Math.min(Math.max(...difficultyLevels.map(level => level.level)), range[1] + levelChange)];

            setSelectedDifficulty(newDifficulty);
            setSelectedDescription(selectedLevel.description || '');
            setSelectedMilitarySoldier(selectedLevel.military_soldier || []);
            setSelectedAthleteArchetype(selectedLevel.athlete_archetype || []);
            setSelectedPFT(selectedLevel.pft || null);
            setSelectedRequirements(selectedLevel.requirements || null);
            setRange(newRange);
            DifficultySettingsStore.saveSettings({ selectedDifficulty: newDifficulty, range: newRange });
        }
    };

    const handleRangeChange = (type: 'min' | 'max', value: number) => {
        const selectedLevel = difficultyLevels.find(level => level.level === selectedDifficulty)?.level || 0;
        if (type === 'min') {
            const newRange: DifficultyRange = [Math.min(value, selectedLevel), range[1]];
            setRange(newRange);
            DifficultySettingsStore.saveSettings({ selectedDifficulty, range: newRange });
        } else {
            const newRange: DifficultyRange = [range[0], Math.max(value, selectedLevel)];
            setRange(newRange);
            DifficultySettingsStore.saveSettings({ selectedDifficulty, range: newRange });
        }
    };

    const getWeightedRandomDifficulty = () => {
        return DifficultySettingsStore.getWeightedRandomDifficulty(difficultyLevels, selectedDifficulty, range);
    };

    return (
        <div className={styles.difficultySettings}>
            <label htmlFor="difficulty">Select Difficulty Level:</label>
            <select id="difficulty" value={selectedDifficulty} onChange={handleDifficultyChange} className={styles.dropdown}>
                {difficultyLevels.map(level => (
                    <option key={level.level} value={level.level}>
                        {`[${level.level}] ${level.name}`}
                    </option>
                ))}
            </select>
            <p className={styles.description}>{selectedDescription}</p>
            <div className={styles.rangeInputs}>
                <div className={styles.rangeInput}>
                    <label htmlFor="minRange">Min:</label>
                    <input
                        type="number"
                        id="minRange"
                        value={range[0]}
                        onChange={(e) => handleRangeChange('min', parseInt(e.target.value))}
                        min={-1}
                        max={selectedDifficulty ? difficultyLevels.find(level => level.level === selectedDifficulty)?.level : range[1]}
                    />
                </div>
                <div className={styles.rangeInput}>
                    <label htmlFor="maxRange">Max:</label>
                    <input
                        type="number"
                        id="maxRange"
                        value={range[1]}
                        onChange={(e) => handleRangeChange('max', parseInt(e.target.value))}
                        min={selectedDifficulty ? difficultyLevels.find(level => level.level === selectedDifficulty)?.level : range[0]}
                        max={Math.max(...difficultyLevels.map(level => level.level))}
                    />
                </div>
            </div>
            <div className={styles.additionalInfo}>
                <div className={styles.militarySoldier}>
                    <strong>Soldier Tier:</strong>
                    <ul className={styles.description}>
                        {selectedMilitarySoldier.map((soldier, index) => (
                            <li key={index}>{soldier}</li>
                        ))}
                    </ul>
                </div>
                <div className={styles.athleteArchetype}>
                    <strong>Athlete Tier:</strong>
                    <ul className={styles.description}>
                        {selectedAthleteArchetype.map((archetype, index) => (
                            <li key={index}>{archetype}</li>
                        ))}
                    </ul>
                </div>
                {selectedPFT && (
                    <div className={styles.pft}>
                        <strong>Physical Fitness Test [PFT]:</strong>
                        <ul className={styles.description}>
                            <li>Pushups: {selectedPFT.pushups}</li>
                            <li>Situps: {selectedPFT.situps}</li>
                            <li>Run: {selectedPFT.run}</li>
                            <li>Pullups: {selectedPFT.pullups}</li>
                            <li>Plank: {selectedPFT.plank}</li>
                            <li>Squats: {selectedPFT.squats}</li>
                        </ul>
                    </div>
                )}
                {selectedRequirements && (
                    <div className={styles.requirements}>
                        <strong>Training Examples:</strong>
                        <ul className={styles.description}>
                            <li>{selectedRequirements.soldier_requirement}</li>
                            <li>{selectedRequirements.athlete_requirement}</li>
                            <li>{selectedRequirements.description_requirement}</li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DifficultySettings;
