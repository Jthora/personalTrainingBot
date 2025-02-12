interface DifficultyLevelData {
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

export default DifficultyLevelData;