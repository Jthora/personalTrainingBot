import React, { ReactNode, useEffect, useState } from 'react';
import { defaultCoachId } from '../data/coaches';
import { applyCoachPaletteToRoot } from '../data/coachThemes';
import { syncCoachModuleSelection } from '../utils/coachModulePreferences';
import { CoachSelectionContext } from './CoachSelectionContextState';

interface CoachSelectionProviderProps {
    children: ReactNode;
}

export const CoachSelectionProvider: React.FC<CoachSelectionProviderProps> = ({ children }) => {
    const [coachId, setCoachIdState] = useState<string>(defaultCoachId);

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
