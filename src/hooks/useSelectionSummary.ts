import { useEffect, useMemo, useState } from 'react';
import MissionScheduleStore from '../store/MissionScheduleStore';
import { recordMetric } from '../utils/metrics';

const DEFAULT_SUMMARY = '0 cat · 0 wkts';
const DEBOUNCE_MS = 200;

const formatSummary = (categories: number, drills: number) => `${categories} cat · ${drills} wkts`;

export const useSelectionSummary = () => {
    const [counts, setCounts] = useState(() => MissionScheduleStore.getSelectionCounts());

    useEffect(() => {
        let timer: number | undefined;

        const handleChange = () => {
            const hit = Boolean(timer);
            if (timer) window.clearTimeout(timer);
            recordMetric(hit ? 'selection_summary_debounce_hit' : 'selection_summary_debounce_miss');
            timer = window.setTimeout(() => {
                setCounts(MissionScheduleStore.getSelectionCounts());
                console.debug('useSelectionSummary: updated counts after debounce');
            }, DEBOUNCE_MS);
        };

        const unsubscribe = MissionScheduleStore.subscribeToSelectionChanges(handleChange);
        return () => {
            if (timer) window.clearTimeout(timer);
            unsubscribe();
        };
    }, []);

    const summary = useMemo(() => {
        if (!counts) return DEFAULT_SUMMARY;
        return formatSummary(counts.categories, counts.drills);
    }, [counts]);

    return summary;
};

export default useSelectionSummary;
