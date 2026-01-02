import { Workout } from './WorkoutCategory';
import { DifficultySetting, DifficultySettingJSON } from './DifficultySetting';

export interface WorkoutSerialized {
    name: string;
    description: string;
    duration: string;
    intensity: string;
    difficulty_range: [number, number];
}

export type WorkoutCompletionTupleJSON = [WorkoutSerialized, boolean];

export interface WorkoutSetJSON {
    workouts: WorkoutCompletionTupleJSON[];
}

export interface WorkoutBlockJSON {
    name: string;
    description: string;
    duration: number;
    intervalDetails: string;
}

export type WorkoutScheduleItemJSON = WorkoutSetJSON | WorkoutBlockJSON;

export interface WorkoutScheduleJSON {
    date: string;
    scheduleItems: WorkoutScheduleItemJSON[];
    difficultySettings: DifficultySettingJSON;
}

export interface CustomWorkoutScheduleJSON {
    id?: string;
    name: string;
    description: string;
    workoutSchedule: WorkoutScheduleJSON;
}

const isWorkoutSetJSON = (item: WorkoutScheduleItemJSON): item is WorkoutSetJSON => 'workouts' in item;

const hydrateWorkout = ([workout, completed]: WorkoutCompletionTupleJSON): [Workout, boolean] => {
    const reconstructedWorkout = new Workout(
        workout.name,
        workout.description,
        workout.duration,
        workout.intensity,
        workout.difficulty_range
    );
    return [reconstructedWorkout, completed];
};

const serializeWorkout = (workout: Workout): WorkoutSerialized => ({
    name: workout.name,
    description: workout.description,
    duration: workout.duration,
    intensity: workout.intensity,
    difficulty_range: workout.difficulty_range,
});
import { v4 as uuidv4 } from 'uuid';

export class WorkoutSchedule {
    date: string;
    scheduleItems: (WorkoutSet | WorkoutBlock)[];
    difficultySettings: DifficultySetting;

    constructor(date: string, scheduleItems: (WorkoutSet | WorkoutBlock)[], difficultySettings: DifficultySetting) {
        this.date = date;
        this.scheduleItems = scheduleItems;
        this.difficultySettings = difficultySettings;
    }

    completeNextItem() {
        console.log('WorkoutSchedule: completeNextItem called');
        if (this.scheduleItems.length === 0) {
            console.log('WorkoutSchedule: No items to complete');
            return;
        }

        const currentItem = this.scheduleItems[0];
        console.log('WorkoutSchedule: Current item:', currentItem);

        if (currentItem instanceof WorkoutSet) {
            for (let i = 0; i < currentItem.workouts.length; i++) {
                if (!currentItem.workouts[i][1]) {
                    console.log(`WorkoutSchedule: Completing workout at index ${i}:`, currentItem.workouts[i][0]);
                    currentItem.workouts[i][1] = true;
                    if (currentItem.allWorkoutsCompleted) {
                        console.log('WorkoutSchedule: All workouts in the set are completed. Removing completed WorkoutSet');
                        this.scheduleItems.shift();
                    } else {
                        this.scheduleItems[0] = new WorkoutSet(currentItem.workouts);
                    }
                    return;
                }
            }
            console.log('WorkoutSchedule: All workouts in the set are completed. Removing completed WorkoutSet');
            this.scheduleItems.shift();
        } else {
            console.log('WorkoutSchedule: Completing WorkoutBlock:', currentItem);
            this.scheduleItems.shift();
        }
    }

    skipNextItem() {
        console.log('WorkoutSchedule: skipNextItem called');
        if (this.scheduleItems.length === 0) {
            console.log('WorkoutSchedule: No items to skip');
            return;
        }

        const currentItem = this.scheduleItems[0];
        console.log('WorkoutSchedule: Current item:', currentItem);

        if (currentItem instanceof WorkoutSet) {
            for (let i = 0; i < currentItem.workouts.length; i++) {
                if (!currentItem.workouts[i][1]) {
                    console.log(`WorkoutSchedule: Skipping workout at index ${i}:`, currentItem.workouts[i][0]);
                    currentItem.workouts[i][1] = true;
                    if (currentItem.allWorkoutsCompleted) {
                        console.log('WorkoutSchedule: All workouts in the set are completed. Removing completed WorkoutSet');
                        this.scheduleItems.shift();
                    } else {
                        this.scheduleItems[0] = new WorkoutSet(currentItem.workouts);
                    }
                    return;
                }
            }
            console.log('WorkoutSchedule: All workouts in the set are completed. Removing completed WorkoutSet');
            this.scheduleItems.shift();
        } else {
            console.log('WorkoutSchedule: Skipping WorkoutBlock:', currentItem);
            this.scheduleItems.shift();
        }
    }

    static fromJSON(json: WorkoutScheduleJSON): WorkoutSchedule {
        const scheduleItems = json.scheduleItems.map(item => {
            if (isWorkoutSetJSON(item)) {
                return new WorkoutSet(item.workouts.map(hydrateWorkout));
            }
            return new WorkoutBlock(item.name, item.description, item.duration, item.intervalDetails);
        });

        return new WorkoutSchedule(json.date, scheduleItems, DifficultySetting.fromJSON(json.difficultySettings));
    }

    toJSON() {
        const scheduleItems: WorkoutScheduleItemJSON[] = this.scheduleItems.map(item => {
            if (item instanceof WorkoutSet) {
                return {
                    workouts: item.workouts.map(([workout, completed]) => [serializeWorkout(workout), completed]),
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
        } satisfies WorkoutScheduleJSON;
    }
}

export class WorkoutSet {
    workouts: [Workout, boolean][];

    constructor(workouts: [Workout, boolean][]) {
        this.workouts = workouts;
    }

    get allWorkoutsCompleted(): boolean {
        return this.workouts.every(([, completed]) => completed);
    }
}

export class WorkoutBlock {
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

    handleTimerExpiration(nextWorkoutSet: WorkoutSet) {
        // Logic to handle timer expiration and trigger the next workout set
        console.log(`Timer expired for ${this.name}. Starting next workout set.`);
        nextWorkoutSet.workouts.forEach(workout => workout[1] = false); // Reset completion state for the next workout set
    }
}

export class CustomWorkoutSchedule {
    id: string;
    name: string;
    description: string;
    workoutSchedule: WorkoutSchedule;

    constructor(name: string, description: string, workoutSchedule: WorkoutSchedule, id?: string) {
        this.id = id || uuidv4();
        this.name = name;
        this.description = description;
        this.workoutSchedule = workoutSchedule;
    }

    static fromJSON(json: CustomWorkoutScheduleJSON): CustomWorkoutSchedule {
        return new CustomWorkoutSchedule(
            json.name,
            json.description,
            WorkoutSchedule.fromJSON(json.workoutSchedule),
            json.id
        );
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            workoutSchedule: this.workoutSchedule.toJSON(),
        } satisfies CustomWorkoutScheduleJSON;
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

