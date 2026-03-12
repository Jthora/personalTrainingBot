import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { defaultHandlerId } from '../data/handlers';
import { applyHandlerPaletteToRoot } from '../data/handlerThemes';
import { syncHandlerModuleSelection } from '../utils/handlerModulePreferences';
import { HandlerSelectionContext } from './HandlerSelectionContextState';
import { mark } from '../utils/perf';
import OperativeProfileStore from '../store/OperativeProfileStore';

interface HandlerSelectionProviderProps {
    children: ReactNode;
}

export const HandlerSelectionProvider: React.FC<HandlerSelectionProviderProps> = ({ children }) => {
    const [handlerId, setHandlerIdState] = useState<string>(defaultHandlerId);
    const handlerReadyMarkedRef = useRef(false);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        // Stage 22: Prefer handler from OperativeProfile
        const profile = OperativeProfileStore.get();
        if (profile?.handlerId) {
            setHandlerIdState(profile.handlerId);
            if (!handlerReadyMarkedRef.current) {
                mark('load:handler_ready');
                handlerReadyMarkedRef.current = true;
            }
            return;
        }

        const storedHandler = window.localStorage.getItem('selectedHandler');
        if (storedHandler) {
            setHandlerIdState(storedHandler);
        } else {
            window.localStorage.setItem('selectedHandler', defaultHandlerId);
        }
        if (!handlerReadyMarkedRef.current) {
            mark('load:handler_ready');
            handlerReadyMarkedRef.current = true;
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem('selectedHandler', handlerId);
        }
        syncHandlerModuleSelection(handlerId);
        applyHandlerPaletteToRoot(handlerId);
    }, [handlerId]);

    const setHandlerId = (id: string) => {
        setHandlerIdState(id);
    };

    return (
        <HandlerSelectionContext.Provider value={{ handlerId, setHandlerId }}>
            {children}
        </HandlerSelectionContext.Provider>
    );
};
