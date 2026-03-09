import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { defaultHandlerId } from '../data/handlers';
import { applyHandlerPaletteToRoot } from '../data/handlerThemes';
import { syncHandlerModuleSelection } from '../utils/handlerModulePreferences';
import { HandlerSelectionContext } from './HandlerSelectionContextState';
import { mark } from '../utils/perf';

interface HandlerSelectionProviderProps {
    children: ReactNode;
}

export const HandlerSelectionProvider: React.FC<HandlerSelectionProviderProps> = ({ children }) => {
    const [coachId, setCoachIdState] = useState<string>(defaultHandlerId);
    const coachReadyMarkedRef = useRef(false);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }
        const storedCoach = window.localStorage.getItem('selectedHandler');
        if (storedCoach) {
            setCoachIdState(storedCoach);
        } else {
            window.localStorage.setItem('selectedHandler', defaultHandlerId);
        }
        if (!coachReadyMarkedRef.current) {
            mark('load:coach_ready');
            coachReadyMarkedRef.current = true;
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('selectedHandler', coachId);
        }
        syncHandlerModuleSelection(coachId);
        applyHandlerPaletteToRoot(coachId);
    }, [coachId]);

    const setCoachId = (id: string) => {
        setCoachIdState(id);
    };

    return (
        <HandlerSelectionContext.Provider value={{ coachId, setCoachId }}>
            {children}
        </HandlerSelectionContext.Provider>
    );
};
