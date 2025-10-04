export type DifficultyLevel = number;
export type DifficultyRange = [number, number];

export interface DifficultySettingJSON {
    level: DifficultyLevel;
    range: DifficultyRange;
}

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

    static fromJSON(json: DifficultySettingJSON): DifficultySetting {
        return new DifficultySetting(json.level, json.range);
    }

    toJSON(): DifficultySettingJSON {
        return {
            level: this.level,
            range: this.range,
        };
    }
}
