import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { defaultCoachId } from '../data/coaches';
import { applyCoachPaletteToRoot } from '../data/coachThemes';
import { syncCoachModuleSelection } from '../utils/coachModulePreferences';
import { CoachSelectionContext } from './CoachSelectionContextState';
import { mark } from '../utils/perf';

interface CoachSelectionProviderProps {
    children: ReactNode;
}

export const CoachSelectionProvider: React.FC<CoachSelectionProviderProps> = ({ children }) => {
    const [coachId, setCoachIdState] = useState<string>(defaultCoachId);
    const coachReadyMarkedRef = useRef(false);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        const storedCoach = window.localStorage.getItem('selectedCoach');
        if (storedCoach) {
            setCoachIdState(storedCoach);
        } else {
            window.localStorage.setItem('selectedCoach', defaultCoachId);
        }
        if (!coachReadyMarkedRef.current) {
            mark('load:coach_ready');
            coachReadyMarkedRef.current = true;
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('selectedCoach', coachId);
        }
        syncCoachModuleSelection(coachId);
        applyCoachPaletteToRoot(coachId);
    }, [coachId]);

    const setCoachId = (id: string) => {
        setCoachIdState(id);
    };

    return (
        <CoachSelectionContext.Provider value={{ coachId, setCoachId }}>
            {children}
        </CoachSelectionContext.Provider>
    );
};
