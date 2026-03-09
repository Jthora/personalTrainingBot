export class DrillCategory {
    id: string;
    name: string;
    description: string;
    subCategories: DrillSubCategory[];

    constructor(id: string, name: string, description: string, subCategories: DrillSubCategory[]) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.subCategories = subCategories;
    }
}

export class DrillSubCategory {
    id: string;
    name: string;
    description: string;
    drillGroups: DrillGroup[];

    constructor(id: string, name: string, description: string, drillGroups: DrillGroup[]) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.drillGroups = drillGroups;
    }
}

export class DrillGroup {
    id: string;
    name: string;
    description: string;
    drills: Drill[];

    constructor(name: string, description: string, drills: Drill[]) {
        this.id = name.toLowerCase().replace(/\s+/g, '_');
        this.name = name;
        this.description = description;
        this.drills = drills;
    }
}

export class Drill {
    id: string;
    name: string;
    description: string;
    duration: string;
    intensity: string;
    difficulty_range: [number, number];
    equipment?: string[];
    themes?: string[];
    keywords?: string[];
    durationMinutes?: number;

    constructor(name: string, description: string, duration: string, intensity: string, difficulty_range: [number, number]) {
        this.id = name.toLowerCase().replace(/\s+/g, '_');
        this.name = name;
        this.description = description;
        this.duration = duration;
        this.intensity = intensity;
        this.difficulty_range = difficulty_range;
        this.equipment = [];
        this.themes = [];
        this.keywords = [];
    }
}

export type SelectedDrillCategories = { [key: string]: boolean };
export type SelectedDrillSubCategories = { [key: string]: boolean };
export type SelectedDrillGroups = { [key: string]: boolean };
export type SelectedDrills = { [key: string]: boolean };