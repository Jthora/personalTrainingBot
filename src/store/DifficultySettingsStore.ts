import { DifficultySetting, DifficultyLevel, DifficultyRange, DifficultySettingJSON } from '../types/DifficultySetting';

const DifficultySettingsStore = {
    getSettings(): DifficultySetting {
        const settings = localStorage.getItem('difficultySettings');
        if (!settings) {
            return new DifficultySetting(7, [1, 10]);
        }

        try {
            const parsed = JSON.parse(settings) as DifficultySettingJSON;
            return DifficultySetting.fromJSON(parsed);
        } catch (error) {
            console.warn('DifficultySettingsStore: Failed to parse stored difficulty settings. Using defaults.', error);
            return new DifficultySetting(7, [1, 10]);
        }
    },
    saveSettings(setting: DifficultySetting | DifficultySettingJSON) {
        const payload = setting instanceof DifficultySetting ? setting.toJSON() : setting;
        localStorage.setItem('difficultySettings', JSON.stringify(payload));
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
