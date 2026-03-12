import { createContext } from 'react';

export interface HandlerSelectionContextValue {
    handlerId: string;
    setHandlerId: (handlerId: string) => void;
}

export const HandlerSelectionContext = createContext<HandlerSelectionContextValue | undefined>(undefined);
