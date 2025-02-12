import DifficultyLevel from './DifficultyLevel';
import DifficultyRange from './DifficultyRange';

interface DifficultySetting {
    level: DifficultyLevel;
    range: DifficultyRange;
}

export const createDifficultySetting = (level: DifficultyLevel, range: DifficultyRange): DifficultySetting => ({
    level,
    range
});

export const createDifficultySettingFromLevel = (level: DifficultyLevel): DifficultySetting => ({
    level,
    range: [level, level]
});

export default DifficultySetting;
