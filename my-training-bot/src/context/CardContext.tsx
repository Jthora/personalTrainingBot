import React, { useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import CardDealer from '../utils/CardDealer';
import { Card } from '../types/Card';
import TrainingModuleCache from '../cache/TrainingModuleCache';
import { CardContext } from './CardContextState';

interface CardProviderProps {
    children: ReactNode;
    initialSlug?: string;
}

export const CardProvider: React.FC<CardProviderProps> = ({ children, initialSlug }) => {
    const cardDealerRef = useRef(new CardDealer());
    const [cards, setCards] = useState<(Card | null)[]>([null, null, null]);
    const [isLoading, setIsLoading] = useState(true);
    const [highlightedCardId, _setHighlightedCardId] = useState<string | null>(null);
    const highlightedCardIdRef = useRef<string | null>(null);

    const updateHighlight = useCallback((cardId: string | null) => {
        highlightedCardIdRef.current = cardId;
        _setHighlightedCardId(cardId);
    }, []);

    const clearHighlightedCard = useCallback(() => {
        updateHighlight(null);
    }, [updateHighlight]);

    const dealNextCard = useCallback((index: number) => {
        const newCard = cardDealerRef.current.getRandomCard();
        console.log(`Dealing new card at index ${index}:`, newCard);
        if (newCard) {
            setCards((prevCards: (Card | null)[]) => {
                const updatedCards = [...prevCards];
                const previousCard = updatedCards[index];
                updatedCards[index] = newCard;
                if (previousCard?.id && previousCard.id === highlightedCardIdRef.current) {
                    updateHighlight(null);
                }
                console.log(`Updated cards:`, updatedCards);
                return updatedCards;
            });
        } else {
            console.log(`No card available to deal at index ${index}`);
        }
    }, [updateHighlight]);

    const getCardMeta = (card: Card) => {
        const cache = TrainingModuleCache.getInstance();
        return cache.getCardMeta(card.id);
    };

    const getCardDetails = (card: Card) => {
        const cache = TrainingModuleCache.getInstance();
        const meta = cache.getCardMeta(card.id);

        if (!meta) {
            return { trainingModule: '', subTrainingModule: '', cardDeck: '', color: '' };
        }

        return {
            trainingModule: meta.moduleName,
            subTrainingModule: meta.subModuleName,
            cardDeck: meta.cardDeckName,
            color: meta.moduleColor,
        };
    };

    const focusCardBySlug = useCallback((slug: string) => {
        const cache = TrainingModuleCache.getInstance();
        if (!cache.isLoaded()) {
            console.warn('TrainingModuleCache not yet loaded when attempting to focus card slug.');
            return false;
        }

        const cardId = cache.getCardIdBySlug(slug);
        if (!cardId) {
            console.warn(`No cardId resolved for slug: ${slug}`);
            return false;
        }

        const card = cache.getCardById(cardId);
        if (!card) {
            console.warn(`No card found for slug: ${slug}`);
            return false;
        }

        setCards((prevCards: (Card | null)[]) => {
            const totalSlots = prevCards.length;
            const nextCards = [...prevCards];
            const existingIndex = nextCards.findIndex(existing => existing?.id === card.id);

            let targetCard: Card | null = card;
            if (existingIndex >= 0) {
                const [existingCard] = nextCards.splice(existingIndex, 1);
                targetCard = existingCard ?? card;
            }

            nextCards.unshift(targetCard);

            if (nextCards.length > totalSlots) {
                nextCards.length = totalSlots;
            } else {
                while (nextCards.length < totalSlots) {
                    nextCards.push(cardDealerRef.current.getRandomCard());
                }
            }

            for (let i = 0; i < nextCards.length; i += 1) {
                if (!nextCards[i]) {
                    nextCards[i] = cardDealerRef.current.getRandomCard();
                }
            }

            return nextCards;
        });

        updateHighlight(cardId);
        return true;
    }, [updateHighlight]);

    useEffect(() => {
        const loadCache = async () => {
            const cache = TrainingModuleCache.getInstance();
            if (!cache.isLoaded()) {
                console.error('TrainingModuleCache not loaded before CardProvider mount.');
                return;
            }
            const initialCards = [
                cardDealerRef.current.getRandomCard(),
                cardDealerRef.current.getRandomCard(),
                cardDealerRef.current.getRandomCard(),
            ];
            console.log('Initial cards:', initialCards);
            setCards(initialCards);
            setIsLoading(false);
        };

        loadCache();
    }, []);

    const initialSlugAppliedRef = useRef(false);

    useEffect(() => {
        if (!initialSlug || initialSlugAppliedRef.current || isLoading) {
            return;
        }

        focusCardBySlug(initialSlug);
        initialSlugAppliedRef.current = true;
    }, [initialSlug, isLoading, focusCardBySlug]);

    if (isLoading) {
        return <div>Loading cards...</div>;
    }

    const getCardSlug = (card: Card) => {
        const cache = TrainingModuleCache.getInstance();
        return cache.getSlugForCard(card.id);
    };

    return (
        <CardContext.Provider
            value={{
                cards,
                dealNextCard,
                getCardDetails,
                getCardSlug,
                getCardMeta,
                highlightedCardId,
                focusCardBySlug,
                clearHighlightedCard,
            }}
        >
            {children}
        </CardContext.Provider>
    );
};