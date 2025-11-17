import { useContext } from 'react';
import { CoachSelectionContext, CoachSelectionContextValue } from '../context/CoachSelectionContextState';

export const useCoachSelection = (): CoachSelectionContextValue => {
    const context = useContext(CoachSelectionContext);
    if (!context) {
        throw new Error('useCoachSelection must be used within a CoachSelectionProvider');
    }
    return context;
};
