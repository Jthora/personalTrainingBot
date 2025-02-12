import DifficultyLevel from '../types/DifficultyLevel';
import DifficultyRange from '../types/DifficultyRange';
import DifficultySetting from '../types/DifficultySetting';

const DifficultySettingsStore = {
    getSettings(): DifficultySetting {
        const settings = localStorage.getItem('difficultySettings');
        return settings ? JSON.parse(settings) : { level: 7, range: [1, 10] };
    },
    saveSettings(setting: DifficultySetting) {
        localStorage.setItem('difficultySettings', JSON.stringify(setting));
    },
    clearSettings() {
        localStorage.removeItem('difficultySettings');
    },
    getWeightedRandomDifficultyFromCurrentSelectedSetting(): DifficultyLevel {
        const setting = this.getSettings();
        return this.getWeightedRandomDifficultyFor(setting.level, setting.range);
    },
    getWeightedRandomDifficulty(setting: DifficultySetting): DifficultyLevel {
        return this.getWeightedRandomDifficultyFor(setting.level, setting.range);
    },
    getWeightedRandomDifficultyFor(level: DifficultyLevel, range: DifficultyRange): DifficultyLevel {
        const mean = level;
        const stdDev = (range[1] - range[0]) / 6; // Approximation for standard deviation
        const randomValue = Math.random() * (range[1] - range[0]) + range[0];
        const weightedRandom = Math.round(mean + stdDev * (randomValue - 0.5));
        return Math.max(range[0], Math.min(range[1], weightedRandom));
    }
};

export default DifficultySettingsStore;
