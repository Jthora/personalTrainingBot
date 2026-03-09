import { useContext } from 'react';
import MissionScheduleContext from '../context/MissionScheduleContext';

const useMissionSchedule = () => {
    const context = useContext(MissionScheduleContext);
    if (!context) {
        throw new Error('useMissionSchedule must be used within a MissionScheduleProvider');
    }
    return context;
};

export default useMissionSchedule;
