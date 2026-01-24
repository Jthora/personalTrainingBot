import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { loadScheduleStub } from '../../utils/ScheduleLoader';

const FIVE_MIN_MS = 5 * 60 * 1000;

const ScheduleNavigationRefresh: React.FC = () => {
    const location = useLocation();
    const lastNavRefreshRef = useRef(0);

    useEffect(() => {
        if (!location.pathname.startsWith('/schedules')) return;
        const now = Date.now();
        if (now - lastNavRefreshRef.current < FIVE_MIN_MS) return;
        lastNavRefreshRef.current = now;
        void loadScheduleStub().catch((error) => console.warn('schedule refresh on navigation failed', error));
    }, [location.pathname]);

    return null;
};

export default ScheduleNavigationRefresh;
