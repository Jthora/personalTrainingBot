import { Drill } from './DrillCategory';
import { DifficultySetting, DifficultySettingJSON } from './DifficultySetting';

export interface DrillSerialized {
    name: string;
    description: string;
    duration: string;
    intensity: string;
    difficulty_range: [number, number];
}

export type DrillCompletionTupleJSON = [DrillSerialized, boolean];

export interface MissionSetJSON {
    drills: DrillCompletionTupleJSON[];
}

export interface MissionBlockJSON {
    name: string;
    description: string;
    duration: number;
    intervalDetails: string;
}

export type MissionScheduleItemJSON = MissionSetJSON | MissionBlockJSON;

export interface MissionScheduleJSON {
    date: string;
    scheduleItems: MissionScheduleItemJSON[];
    difficultySettings: DifficultySettingJSON;
}

export interface CustomMissionScheduleJSON {
    id?: string;
    name: string;
    description: string;
    missionSchedule: MissionScheduleJSON;
}

const isMissionSetJSON = (item: MissionScheduleItemJSON): item is MissionSetJSON => 'drills' in item;

const hydrateWorkout = ([drill, completed]: DrillCompletionTupleJSON): [Drill, boolean] => {
    const reconstructedWorkout = new Drill(
        drill.name,
        drill.description,
        drill.duration,
        drill.intensity,
        drill.difficulty_range
    );
    return [reconstructedWorkout, completed];
};

const serializeWorkout = (drill: Drill): DrillSerialized => ({
    name: drill.name,
    description: drill.description,
    duration: drill.duration,
    intensity: drill.intensity,
    difficulty_range: drill.difficulty_range,
});
import { v4 as uuidv4 } from 'uuid';

export class MissionSchedule {
    date: string;
    scheduleItems: (MissionSet | MissionBlock)[];
    difficultySettings: DifficultySetting;

    constructor(date: string, scheduleItems: (MissionSet | MissionBlock)[], difficultySettings: DifficultySetting) {
        this.date = date;
        this.scheduleItems = scheduleItems;
        this.difficultySettings = difficultySettings;
    }

    completeNextItem() {
        console.log('MissionSchedule: completeNextItem called');
        if (this.scheduleItems.length === 0) {
            console.log('MissionSchedule: No items to complete');
            return;
        }

        const currentItem = this.scheduleItems[0];
        console.log('MissionSchedule: Current item:', currentItem);

        if (currentItem instanceof MissionSet) {
            for (let i = 0; i < currentItem.drills.length; i++) {
                if (!currentItem.drills[i][1]) {
                    console.log(`MissionSchedule: Completing drill at index ${i}:`, currentItem.drills[i][0]);
                    currentItem.drills[i][1] = true;
                    if (currentItem.allWorkoutsCompleted) {
                        console.log('MissionSchedule: All drills in the set are completed. Removing completed MissionSet');
                        this.scheduleItems.shift();
                    } else {
                        this.scheduleItems[0] = new MissionSet(currentItem.drills);
                    }
                    return;
                }
            }
            console.log('MissionSchedule: All drills in the set are completed. Removing completed MissionSet');
            this.scheduleItems.shift();
        } else {
            console.log('MissionSchedule: Completing MissionBlock:', currentItem);
            this.scheduleItems.shift();
        }
    }

    skipNextItem() {
        console.log('MissionSchedule: skipNextItem called');
        if (this.scheduleItems.length === 0) {
            console.log('MissionSchedule: No items to skip');
            return;
        }

        const currentItem = this.scheduleItems[0];
        console.log('MissionSchedule: Current item:', currentItem);

        if (currentItem instanceof MissionSet) {
            for (let i = 0; i < currentItem.drills.length; i++) {
                if (!currentItem.drills[i][1]) {
                    console.log(`MissionSchedule: Skipping drill at index ${i}:`, currentItem.drills[i][0]);
                    currentItem.drills[i][1] = true;
                    if (currentItem.allWorkoutsCompleted) {
                        console.log('MissionSchedule: All drills in the set are completed. Removing completed MissionSet');
                        this.scheduleItems.shift();
                    } else {
                        this.scheduleItems[0] = new MissionSet(currentItem.drills);
                    }
                    return;
                }
            }
            console.log('MissionSchedule: All drills in the set are completed. Removing completed MissionSet');
            this.scheduleItems.shift();
        } else {
            console.log('MissionSchedule: Skipping MissionBlock:', currentItem);
            this.scheduleItems.shift();
        }
    }

    static fromJSON(json: MissionScheduleJSON): MissionSchedule {
        const scheduleItems = json.scheduleItems.map(item => {
            if (isMissionSetJSON(item)) {
                return new MissionSet(item.drills.map(hydrateWorkout));
            }
            return new MissionBlock(item.name, item.description, item.duration, item.intervalDetails);
        });

        return new MissionSchedule(json.date, scheduleItems, DifficultySetting.fromJSON(json.difficultySettings));
    }

    toJSON() {
        const scheduleItems: MissionScheduleItemJSON[] = this.scheduleItems.map(item => {
            if (item instanceof MissionSet) {
                return {
                    drills: item.drills.map(([drill, completed]) => [serializeWorkout(drill), completed]),
                };
            }

            return {
                name: item.name,
                description: item.description,
                duration: item.duration,
                intervalDetails: item.intervalDetails,
            };
        });

        return {
            date: this.date,
            scheduleItems,
            difficultySettings: this.difficultySettings.toJSON(),
        } satisfies MissionScheduleJSON;
    }
}

export class MissionSet {
    drills: [Drill, boolean][];

    constructor(drills: [Drill, boolean][]) {
        this.drills = drills;
    }

    get allWorkoutsCompleted(): boolean {
        return this.drills.every(([, completed]) => completed);
    }
}

export class MissionBlock {
    name: string;
    description: string;
    duration: number; // duration in minutes
    intervalDetails: string;

    constructor(name: string, description: string, duration: number, intervalDetails: string) {
        this.name = name;
        this.description = description;
        this.duration = duration;
        this.intervalDetails = intervalDetails;
    }

    handleTimerExpiration(nextMissionSet: MissionSet) {
        // Logic to handle timer expiration and trigger the next drill set
        console.log(`Timer expired for ${this.name}. Starting next drill set.`);
        nextMissionSet.drills.forEach(drill => drill[1] = false); // Reset completion state for the next drill set
    }
}

export class CustomMissionSchedule {
    id: string;
    name: string;
    description: string;
    missionSchedule: MissionSchedule;

    constructor(name: string, description: string, missionSchedule: MissionSchedule, id?: string) {
        this.id = id || uuidv4();
        this.name = name;
        this.description = description;
        this.missionSchedule = missionSchedule;
    }

    static fromJSON(json: CustomMissionScheduleJSON): CustomMissionSchedule {
        return new CustomMissionSchedule(
            json.name,
            json.description,
            MissionSchedule.fromJSON(json.missionSchedule),
            json.id
        );
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            missionSchedule: this.missionSchedule.toJSON(),
        } satisfies CustomMissionScheduleJSON;
    }
}

export class ScheduleCalendar {
    days: { day: number, scheduleId: string }[];
    dayStartTime: string;
    dayEndTime: string;
    dayWakeUpTime: string;

    constructor(days: { day: number, scheduleId: string }[], dayStartTime: string, dayEndTime: string, dayWakeUpTime: string) {
        this.days = days;
        this.dayStartTime = dayStartTime;
        this.dayEndTime = dayEndTime;
        this.dayWakeUpTime = dayWakeUpTime;
    }
}

export class ScheduleCalendarTimer {
    calendar: ScheduleCalendar;
    currentDay: number;

    constructor(calendar: ScheduleCalendar, currentDay: number) {
        this.calendar = calendar;
        this.currentDay = currentDay;
    }
}

