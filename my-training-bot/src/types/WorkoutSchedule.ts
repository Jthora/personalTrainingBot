import { Workout } from './WorkoutCategory';
import { DifficultySetting } from './DifficultySetting';
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
                    this.scheduleItems[0] = new WorkoutSet(currentItem.workouts);
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
                    this.scheduleItems[0] = new WorkoutSet(currentItem.workouts);
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

    static fromJSON(json: any): WorkoutSchedule {
        return new WorkoutSchedule(
            json.date,
            json.scheduleItems.map((item: any) => {
                if (item.workouts) {
                    const workouts = item.workouts.map(([workout, completed]: [any, boolean]) => {
                        const reconstructedWorkout = new Workout(
                            workout.name,
                            workout.description,
                            workout.duration,
                            workout.intensity,
                            workout.difficulty_range
                        );
                        return [reconstructedWorkout, completed];
                    });
                    return new WorkoutSet(workouts);
                } else if (item.name && item.description && item.duration && item.intervalDetails) {
                    return new WorkoutBlock(item.name, item.description, item.duration, item.intervalDetails);
                } else {
                    console.warn('Unknown item type in schedule:', item);
                    return item;
                }
            }),
            json.difficultySettings
        );
    }

    toJSON() {
        return {
            date: this.date,
            scheduleItems: this.scheduleItems.map(item => {
                if (item instanceof WorkoutSet) {
                    return {
                        workouts: item.workouts.map(([workout, completed]) => [workout, completed])
                    };
                } else if (item instanceof WorkoutBlock) {
                    return {
                        name: item.name,
                        description: item.description,
                        duration: item.duration,
                        intervalDetails: item.intervalDetails
                    };
                } else {
                    return item;
                }
            }),
            difficultySettings: this.difficultySettings
        };
    }
}

export class WorkoutSet {
    workouts: [Workout, boolean][];

    constructor(workouts: [Workout, boolean][]) {
        this.workouts = workouts;
    }

    get allWorkoutsCompleted(): boolean {
        return this.workouts.every(([_, completed]) => completed);
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

    static fromJSON(json: any): CustomWorkoutSchedule {
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
            workoutSchedule: this.workoutSchedule.toJSON()
        };
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

