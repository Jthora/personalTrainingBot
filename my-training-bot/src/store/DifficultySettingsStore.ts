interface DifficultySettings {
    selectedDifficulty: string;
    minRange: number;
    maxRange: number;
}

const DifficultySettingsStore = {
    getSettings(): DifficultySettings {
        const settings = localStorage.getItem('difficultySettings');
        return settings ? JSON.parse(settings) : { selectedDifficulty: '', minRange: 0, maxRange: 0 };
    },
    saveSettings(settings: DifficultySettings) {
        localStorage.setItem('difficultySettings', JSON.stringify(settings));
    }
};

export default DifficultySettingsStore;
