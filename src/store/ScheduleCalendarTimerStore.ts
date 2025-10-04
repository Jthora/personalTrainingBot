import { ScheduleCalendar, ScheduleCalendarTimer } from '../types/WorkoutSchedule';

const ScheduleCalendarTimerStore = {
    getScheduleCalendarTimer(): ScheduleCalendarTimer | null {
        try {
            const data = localStorage.getItem('scheduleCalendarTimer');
            if (data) {
                const parsedData = JSON.parse(data);
                const calendar = new ScheduleCalendar(
                    parsedData.calendar.days,
                    parsedData.calendar.dayStartTime,
                    parsedData.calendar.dayEndTime,
                    parsedData.calendar.dayWakeUpTime
                );
                return new ScheduleCalendarTimer(calendar, parsedData.currentDay);
            }
            return null;
        } catch (error) {
            console.error('Failed to get schedule calendar timer:', error);
            return null;
        }
    },
    saveScheduleCalendarTimer(timer: ScheduleCalendarTimer) {
        try {
            localStorage.setItem('scheduleCalendarTimer', JSON.stringify(timer));
            console.log('Saved schedule calendar timer to localStorage.');
        } catch (error) {
            console.error('Failed to save schedule calendar timer:', error);
        }
    },
    clearScheduleCalendarTimer() {
        try {
            localStorage.removeItem('scheduleCalendarTimer');
            console.log('Cleared schedule calendar timer from localStorage.');
        } catch (error) {
            console.error('Failed to clear schedule calendar timer:', error);
        }
    }
};

export default ScheduleCalendarTimerStore;
