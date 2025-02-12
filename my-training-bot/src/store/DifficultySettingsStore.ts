import DifficultyLevel from '../types/DifficultyLevel';
import DifficultyRange from '../types/DifficultyRange';
import DifficultySetting from '../types/DifficultySetting';

interface DifficultySettings {
    selectedDifficulty: DifficultyLevel;
    range: DifficultyRange;
}

const DifficultySettingsStore = {
    getSettings(): DifficultySettings {
        const settings = localStorage.getItem('difficultySettings');
        return settings ? JSON.parse(settings) : { selectedDifficulty: 7, range: [0, 0] };
    },
    saveSettings(settings: DifficultySettings) {
        localStorage.setItem('difficultySettings', JSON.stringify(settings));
    },
    clearSettings() {
        localStorage.removeItem('difficultySettings');
    },
    getWeightedRandomDifficulty(difficultyLevels: DifficultyLevel[], selectedDifficulty: DifficultyLevel, range: DifficultyRange): DifficultyLevel {
        const mean = selectedDifficulty;
        const stdDev = (range[1] - range[0]) / 6; // Approximation for standard deviation
        const randomValue = Math.random() * (range[1] - range[0]) + range[0];
        const weightedRandom = Math.round(mean + stdDev * (randomValue - 0.5));
        return Math.max(range[0], Math.min(range[1], weightedRandom));
    }
};

export default DifficultySettingsStore;
