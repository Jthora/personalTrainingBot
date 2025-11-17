import { createContext } from 'react';

export interface CoachSelectionContextValue {
    coachId: string;
    setCoachId: (coachId: string) => void;
}

export const CoachSelectionContext = createContext<CoachSelectionContextValue | undefined>(undefined);
