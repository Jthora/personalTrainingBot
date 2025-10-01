import { useContext } from 'react';
import { CardContext } from '../context/CardContextState';

export const useCardContext = () => {
    const context = useContext(CardContext);
    if (!context) {
        throw new Error('useCardContext must be used within a CardProvider');
    }
    return context;
};
