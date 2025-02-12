import React, { useState, useEffect } from 'react';
import TrainingCoachCache from '../../cache/TrainingCoachCache';
import DifficultySettingsStore from '../../store/DifficultySettingsStore';
import styles from './DifficultySettings.module.css';

interface DifficultyLevel {
    name: string;
    description: string;
    military_soldier: string[];
    athlete_archetype: string[];
    level: number;
    pft: {
        pushups: number;
        situps: number;
        run: string;
        pullups: number;
        plank: string;
        squats: number;
    };
    requirements: {
        soldier_requirement: string;
        athlete_requirement: string;
        description_requirement: string;
    };
}

const DifficultySettings: React.FC = () => {
    const [difficultyLevels, setDifficultyLevels] = useState<DifficultyLevel[]>([]);
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
    const [selectedDescription, setSelectedDescription] = useState<string>('');
    const [selectedMilitarySoldier, setSelectedMilitarySoldier] = useState<string[]>([]);
    const [selectedAthleteArchetype, setSelectedAthleteArchetype] = useState<string[]>([]);
    const [selectedPFT, setSelectedPFT] = useState<DifficultyLevel['pft'] | null>(null);
    const [selectedRequirements, setSelectedRequirements] = useState<DifficultyLevel['requirements'] | null>(null);
    const [minRange, setMinRange] = useState<number>(0);
    const [maxRange, setMaxRange] = useState<number>(0);

    useEffect(() => {
        const loadDifficultyLevels = async () => {
            try {
                const cache = TrainingCoachCache.getInstance();
                await cache.loadData();
                const levels = cache.getDifficultyLevels();
                setDifficultyLevels(levels);

                // Load the selected difficulty from localStorage
                const settings = DifficultySettingsStore.getSettings();
                if (settings.selectedDifficulty && levels.some(level => level.name === settings.selectedDifficulty)) {
                    const selectedLevel = levels.find(level => level.name === settings.selectedDifficulty);
                    setSelectedDifficulty(settings.selectedDifficulty);
                    setSelectedDescription(selectedLevel?.description || '');
                    setSelectedMilitarySoldier(selectedLevel?.military_soldier || []);
                    setSelectedAthleteArchetype(selectedLevel?.athlete_archetype || []);
                    setSelectedPFT(selectedLevel?.pft || null);
                    setSelectedRequirements(selectedLevel?.requirements || null);
                    setMinRange(settings.minRange || selectedLevel?.level || 0);
                    setMaxRange(settings.maxRange || selectedLevel?.level || 0);
                } else if (levels.length > 0) {
                    const defaultLevel = levels[0];
                    if (defaultLevel) {
                        setSelectedDifficulty(defaultLevel.name);
                        setSelectedDescription(defaultLevel.description);
                        setSelectedMilitarySoldier(defaultLevel.military_soldier);
                        setSelectedAthleteArchetype(defaultLevel.athlete_archetype);
                        setSelectedPFT(defaultLevel.pft);
                        setSelectedRequirements(defaultLevel.requirements);
                        setMinRange(defaultLevel.level);
                        setMaxRange(defaultLevel.level);
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
            if (settings.selectedDifficulty && levels.some(level => level.name === settings.selectedDifficulty)) {
                const selectedLevel = levels.find(level => level.name === settings.selectedDifficulty);
                setSelectedDifficulty(settings.selectedDifficulty);
                setSelectedDescription(selectedLevel?.description || '');
                setSelectedMilitarySoldier(selectedLevel?.military_soldier || []);
                setSelectedAthleteArchetype(selectedLevel?.athlete_archetype || []);
                setSelectedPFT(selectedLevel?.pft || null);
                setSelectedRequirements(selectedLevel?.requirements || null);
                setMinRange(settings.minRange || selectedLevel?.level || 0);
                setMaxRange(settings.maxRange || selectedLevel?.level || 0);
            } else if (levels.length > 0) {
                const defaultLevel = levels[0];
                if (defaultLevel) {
                    setSelectedDifficulty(defaultLevel.name);
                    setSelectedDescription(defaultLevel.description);
                    setSelectedMilitarySoldier(defaultLevel.military_soldier);
                    setSelectedAthleteArchetype(defaultLevel.athlete_archetype);
                    setSelectedPFT(defaultLevel.pft);
                    setSelectedRequirements(defaultLevel.requirements);
                    setMinRange(defaultLevel.level);
                    setMaxRange(defaultLevel.level);
                }
            }
        } catch (error) {
            console.error("Error reloading difficulty levels:", error);
        }
    };

    const handleDifficultyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newDifficulty = event.target.value;
        const selectedLevel = difficultyLevels.find(level => level.name === newDifficulty);
        if (selectedLevel) {
            const levelChange = selectedLevel.level - (difficultyLevels.find(level => level.name === selectedDifficulty)?.level || 0);
            const newMinRange = Math.max(0, minRange + levelChange);
            const newMaxRange = Math.min(Math.max(...difficultyLevels.map(level => level.level)), maxRange + levelChange);

            setSelectedDifficulty(newDifficulty);
            setSelectedDescription(selectedLevel.description || '');
            setSelectedMilitarySoldier(selectedLevel.military_soldier || []);
            setSelectedAthleteArchetype(selectedLevel.athlete_archetype || []);
            setSelectedPFT(selectedLevel.pft || null);
            setSelectedRequirements(selectedLevel.requirements || null);
            setMinRange(newMinRange);
            setMaxRange(newMaxRange);
            DifficultySettingsStore.saveSettings({ selectedDifficulty: newDifficulty, minRange: newMinRange, maxRange: newMaxRange });
        }
    };

    const handleRangeChange = (type: 'min' | 'max', value: number) => {
        const selectedLevel = difficultyLevels.find(level => level.name === selectedDifficulty)?.level || 0;
        if (type === 'min') {
            const newMinRange = Math.min(value, selectedLevel);
            setMinRange(newMinRange);
            DifficultySettingsStore.saveSettings({ selectedDifficulty, minRange: newMinRange, maxRange });
        } else {
            const newMaxRange = Math.max(value, selectedLevel);
            setMaxRange(newMaxRange);
            DifficultySettingsStore.saveSettings({ selectedDifficulty, minRange, maxRange: newMaxRange });
        }
    };

    const getWeightedRandomDifficulty = () => {
        const mean = difficultyLevels.find(level => level.name === selectedDifficulty)?.level || 0;
        const stdDev = (maxRange - minRange) / 6; // Approximation for standard deviation
        const randomValue = Math.random() * (maxRange - minRange) + minRange;
        const weightedRandom = Math.round(mean + stdDev * (randomValue - 0.5));
        return Math.max(minRange, Math.min(maxRange, weightedRandom));
    };

    const handleClearSettings = () => {
        DifficultySettingsStore.clearSettings();
        setSelectedDifficulty('');
        setSelectedDescription('');
        setSelectedMilitarySoldier([]);
        setSelectedAthleteArchetype([]);
        setSelectedPFT(null);
        setSelectedRequirements(null);
        setMinRange(0);
        setMaxRange(0);
    };

    return (
        <div className={styles.difficultySettings}>
            <label htmlFor="difficulty">Select Difficulty Level:</label>
            <select id="difficulty" value={selectedDifficulty} onChange={handleDifficultyChange}>
                {difficultyLevels.map(level => (
                    <option key={level.name} value={level.name}>
                        {`[${level.level}] ${level.name}`}
                    </option>
                ))}
            </select>
            <p className={styles.description}>{selectedDescription}</p>
            <div className={styles.rangeInputs}>
                <label htmlFor="minRange">Min Range:</label>
                <input
                    type="number"
                    id="minRange"
                    value={minRange}
                    onChange={(e) => handleRangeChange('min', parseInt(e.target.value))}
                    min={0}
                    max={selectedDifficulty ? difficultyLevels.find(level => level.name === selectedDifficulty)?.level : maxRange}
                />
                <label htmlFor="maxRange">Max Range:</label>
                <input
                    type="number"
                    id="maxRange"
                    value={maxRange}
                    onChange={(e) => handleRangeChange('max', parseInt(e.target.value))}
                    min={selectedDifficulty ? difficultyLevels.find(level => level.name === selectedDifficulty)?.level : minRange}
                    max={Math.max(...difficultyLevels.map(level => level.level))}
                />
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
                        <p className={styles.description}> - {selectedRequirements.soldier_requirement}</p>
                        <p className={styles.description}> - {selectedRequirements.athlete_requirement}</p>
                        <p className={styles.description}> - {selectedRequirements.description_requirement}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DifficultySettings;
