import { useMemo } from 'react';
import { useCoachSelection } from './useCoachSelection';
import { getCoachPalette, CoachPalette } from '../data/coachThemes';

export const useCoachTheme = (): CoachPalette => {
    const { coachId } = useCoachSelection();

    return useMemo(() => getCoachPalette(coachId), [coachId]);
};
