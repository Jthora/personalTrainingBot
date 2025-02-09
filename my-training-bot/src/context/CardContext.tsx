import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import CardDealer from '../utils/CardDealer';
import { Card } from '../types/Card';
import TrainingModuleCache from '../cache/TrainingModuleCache';

interface CardContextProps {
    cards: (Card | null)[];
    dealNextCard: (index: number) => void;
}

interface CardProviderProps {
    children: ReactNode;
}

const CardContext = createContext<CardContextProps | undefined>(undefined);

export const CardProvider: React.FC<CardProviderProps> = ({ children }) => {
    const cardDealer = new CardDealer();
    const [cards, setCards] = useState<(Card | null)[]>([null, null, null]);
    const [isLoading, setIsLoading] = useState(true);

    const dealNextCard = (index: number) => {
        const newCard = cardDealer.getRandomCard();
        console.log(`Dealing new card at index ${index}:`, newCard);
        if (newCard) {
            setCards(prevCards => {
                const updatedCards = [...prevCards];
                updatedCards[index] = newCard;
                console.log(`Updated cards:`, updatedCards);
                return updatedCards;
            });
        } else {
            console.log(`No card available to deal at index ${index}`);
        }
    };

    useEffect(() => {
        const loadCache = async () => {
            const cache = TrainingModuleCache.getInstance();
            if (!cache.isLoaded()) {
                await cache.loadData([]);
            }
            const initialCards = [cardDealer.getRandomCard(), cardDealer.getRandomCard(), cardDealer.getRandomCard()];
            console.log('Initial cards:', initialCards);
            setCards(initialCards);
            setIsLoading(false);
        };

        loadCache();
    }, []);

    if (isLoading) {
        return <div>Loading cards...</div>;
    }

    return (
        <CardContext.Provider value={{ cards, dealNextCard }}>
            {children}
        </CardContext.Provider>
    );
};

export const useCardContext = () => {
    const context = useContext(CardContext);
    if (!context) {
        throw new Error('useCardContext must be used within a CardProvider');
    }
    return context;
};