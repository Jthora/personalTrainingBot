import React, { useState, useEffect } from 'react';
import coachTrainingCache from '../../cache/CoachTrainingCache';
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

    useEffect(() => {
        const loadDifficultyLevels = async () => {
            // Wait for the cache to be ready
            while (coachTrainingCache.isLoading()) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            const levels = coachTrainingCache.getDifficultyLevels();
            setDifficultyLevels(levels); // Ensure levels are strings

            // Load the selected difficulty from localStorage
            const savedDifficulty = localStorage.getItem('selectedDifficulty');
            if (savedDifficulty && levels.some(level => level.name === savedDifficulty)) {
                const selectedLevel = levels.find(level => level.name === savedDifficulty);
                setSelectedDifficulty(savedDifficulty);
                setSelectedDescription(selectedLevel?.description || '');
                setSelectedMilitarySoldier(selectedLevel?.military_soldier || []);
                setSelectedAthleteArchetype(selectedLevel?.athlete_archetype || []);
                setSelectedPFT(selectedLevel?.pft || null);
                setSelectedRequirements(selectedLevel?.requirements || null);
            } else {
                const defaultLevel = levels[0];
                setSelectedDifficulty(defaultLevel.name);
                setSelectedDescription(defaultLevel.description);
                setSelectedMilitarySoldier(defaultLevel.military_soldier);
                setSelectedAthleteArchetype(defaultLevel.athlete_archetype);
                setSelectedPFT(defaultLevel.pft);
                setSelectedRequirements(defaultLevel.requirements);
            }
        };
        loadDifficultyLevels();
    }, []);

    const handleDifficultyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newDifficulty = event.target.value;
        const selectedLevel = difficultyLevels.find(level => level.name === newDifficulty);
        setSelectedDifficulty(newDifficulty);
        setSelectedDescription(selectedLevel?.description || '');
        setSelectedMilitarySoldier(selectedLevel?.military_soldier || []);
        setSelectedAthleteArchetype(selectedLevel?.athlete_archetype || []);
        setSelectedPFT(selectedLevel?.pft || null);
        setSelectedRequirements(selectedLevel?.requirements || null);
        localStorage.setItem('selectedDifficulty', newDifficulty); // Save the selected difficulty to localStorage
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
            <div className={styles.additionalInfo}>
                <div className={styles.militarySoldier}>
                    <strong>Soldier Tier:</strong>
                    <ul>
                        {selectedMilitarySoldier.map((soldier, index) => (
                            <li key={index}>{soldier}</li>
                        ))}
                    </ul>
                </div>
                <div className={styles.athleteArchetype}>
                    <strong>Athlete Tier:</strong>
                    <ul>
                        {selectedAthleteArchetype.map((archetype, index) => (
                            <li key={index}>{archetype}</li>
                        ))}
                    </ul>
                </div>
                {selectedPFT && (
                    <div className={styles.pft}>
                        <strong>Physical Fitness Test [PFT]:</strong>
                        <ul>
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
