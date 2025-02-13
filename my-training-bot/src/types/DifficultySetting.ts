export type DifficultyLevel = number;
export type DifficultyRange = [number, number];

export class DifficultySetting {
    level: DifficultyLevel;
    range: DifficultyRange;

    constructor(level: DifficultyLevel, range: DifficultyRange) {
        this.level = level;
        this.range = range;
    }

    static fromLevel(level: DifficultyLevel): DifficultySetting {
        return new DifficultySetting(level, [level, level]);
    }
}
