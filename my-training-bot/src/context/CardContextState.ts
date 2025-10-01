import { createContext } from 'react';
import { Card } from '../types/Card';
import { CardMeta } from '../cache/TrainingModuleCache';

export interface CardContextProps {
    cards: (Card | null)[];
    dealNextCard: (index: number) => void;
    getCardDetails: (card: Card) => { trainingModule: string; subTrainingModule: string; cardDeck: string; color: string };
    getCardSlug: (card: Card) => string | undefined;
    getCardMeta: (card: Card) => CardMeta | undefined;
    highlightedCardId: string | null;
    focusCardBySlug: (slug: string) => boolean;
    clearHighlightedCard: () => void;
}

export const CardContext = createContext<CardContextProps | undefined>(undefined);
