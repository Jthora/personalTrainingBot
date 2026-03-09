import { createContext } from 'react';

export interface HandlerSelectionContextValue {
    coachId: string;
    setCoachId: (coachId: string) => void;
}

export const HandlerSelectionContext = createContext<HandlerSelectionContextValue | undefined>(undefined);
