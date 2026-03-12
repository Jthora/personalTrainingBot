import { DifficultySetting, DifficultyLevel, DifficultyRange, DifficultySettingJSON } from '../types/DifficultySetting';
import { createStore } from './createStore';

const store = createStore<DifficultySettingJSON>({
    key: 'difficultySettings',
    defaultValue: new DifficultySetting(7, [1, 10]).toJSON(),
    validate: (raw): DifficultySettingJSON | null => {
        if (!raw || typeof raw !== 'object') return null;
        const c = raw as Record<string, unknown>;
        if (typeof c.level !== 'number' || !Array.isArray(c.range)) return null;
        return raw as DifficultySettingJSON;
    },
});

const DifficultySettingsStore = {
    getSettings(): DifficultySetting {
        return DifficultySetting.fromJSON(store.get());
    },
    saveSettings(setting: DifficultySetting | DifficultySettingJSON) {
        const payload = setting instanceof DifficultySetting ? setting.toJSON() : setting;
        store.set(payload);
    },
    clearSettings() {
        store.reset();
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
