import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../../types/Card';
import styles from './CardSlot.module.css';
import { useCardContext } from '../../hooks/useCardContext';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import ShareCardModal from '../ShareCard/ShareCardModal';

const TIME_INTERVALS = [1, 2, 3, 5, 8, 13, 21];

interface CardSlotProps {
    card: Card | null;
    onDealNextCard: () => void;
}

const CardSlot: React.FC<CardSlotProps> = ({ card, onDealNextCard }) => {
    const { getCardDetails, getCardSlug, getCardMeta, highlightedCardId } = useCardContext();
    const getRandomTimeInterval = useCallback(
        () => TIME_INTERVALS[Math.floor(Math.random() * TIME_INTERVALS.length)] * 60,
        []
    );

    const [timeLeft, setTimeLeft] = useState(getRandomTimeInterval());
    const [isHeld, setIsHeld] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);

    useEffect(() => {
        if (isHeld || isShareOpen || !card) return;

        const timer = setInterval(() => {
            setTimeLeft((prev: number) => {
                if (prev <= 1) {
                    onDealNextCard();
                    return getRandomTimeInterval(); // reset timer for the next card
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isHeld, isShareOpen, card, onDealNextCard, getRandomTimeInterval]);

    const handleHoldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsHeld(event.target.checked);
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    const formatKatex = (text: string): React.ReactNode => {
        const inlineMathRegex = /\\\((.*?)\\\)/g;
        const blockMathRegex = /\\\[(.*?)\\\]/g;
        const fragments: React.ReactNode[] = [];

        text.split(blockMathRegex).forEach((part, index) => {
            if (index % 2 === 1) {
                fragments.push(
                    <span
                        key={`block-${index}`}
                        dangerouslySetInnerHTML={{ __html: katex.renderToString(part, { displayMode: true }) }}
                    />
                );
            } else {
                part.split(inlineMathRegex).forEach((subPart, subIndex) => {
                    if (subIndex % 2 === 1) {
                        fragments.push(
                            <span
                                key={`inline-${index}-${subIndex}`}
                                dangerouslySetInnerHTML={{ __html: katex.renderToString(subPart) }}
                            />
                        );
                    } else if (subPart) {
                        fragments.push(subPart);
                    }
                });
            }
        });

        return fragments;
    };

    if (!card) {
        console.log('Card is null in CardSlot');
        return <div className={styles.cardSlot}>No card available</div>;
    }

    if (!Array.isArray(card.bulletpoints)) {
        console.error('Card bulletpoints is not an array:', card.bulletpoints);
        return <div className={styles.cardSlot}>Invalid card data</div>;
    }

    const { trainingModule, subTrainingModule, cardDeck, color } = getCardDetails(card);
    const slug = getCardSlug(card);
    const meta = getCardMeta(card);

    const shortUrl = slug
        ? (typeof window !== 'undefined' && window.location
            ? `${window.location.origin}/c/${slug}`
            : `/c/${slug}`)
        : undefined;

    const isHighlighted = highlightedCardId === card.id;
    const cardLabel = cardDeck ?? 'Training Card';

    return (
        <div className={`${styles.cardSlot} ${isHighlighted ? styles.highlighted : ''}`}>
            <div className={styles.cardHeader}>
                <div className={styles.headerLeft}>
                    <span className={styles.cardLabel}>{cardLabel}</span>
                    <h2 className={styles.cardTitle}>{formatKatex(card.title)}</h2>
                </div>
                <div className={styles.timerBadge} aria-label={`Time remaining ${formatTime(timeLeft)}`}>
                    <span className={styles.timerValue}>{formatTime(timeLeft)}</span>
                    <span className={styles.timerLabel}>Remaining</span>
                </div>
            </div>

            <div className={styles.cardMeta}>
                <div className={styles.tagGroup}>
                    {trainingModule && (
                        <span className={styles.metaTag} style={{ borderColor: color }}>
                            {trainingModule}
                        </span>
                    )}
                    {subTrainingModule && (
                        <span className={styles.metaTag} style={{ borderColor: color }}>
                            {subTrainingModule}
                        </span>
                    )}
                    {cardDeck && (
                        <span className={styles.metaTag} style={{ borderColor: color }}>
                            {cardDeck}
                        </span>
                    )}
                </div>
                <div className={styles.statsGroup}>
                    <div className={styles.stat}>
                        <span className={styles.statLabel}>Duration</span>
                        <span className={styles.statValue}>{card.duration}m</span>
                    </div>
                    <div className={styles.stat}>
                        <span className={styles.statLabel}>Difficulty</span>
                        <span className={styles.statValue}>{card.difficulty}</span>
                    </div>
                </div>
            </div>

            <div className={styles.cardContent}>
                <p className={styles.cardDescription}>{formatKatex(card.description)}</p>
                {card.bulletpoints.length > 0 && (
                    <ul className={styles.cardList}>
                        {card.bulletpoints.map((point, index) => (
                            <li key={index}>{formatKatex(point)}</li>
                        ))}
                    </ul>
                )}
            </div>

            <div className={styles.cardToolbar}>
                <label className={styles.holdToggle}>
                    <input type="checkbox" checked={isHeld} onChange={handleHoldChange} />
                    <span>Hold</span>
                </label>
                <div className={styles.toolbarButtons}>
                    <button
                        className={styles.secondaryButton}
                        onClick={() => setIsShareOpen(true)}
                        disabled={!slug || !meta}
                    >
                        Share
                    </button>
                    <button className={styles.primaryButton} onClick={onDealNextCard}>
                        Next
                    </button>
                </div>
            </div>

            {isShareOpen && meta && slug && (
                <ShareCardModal
                    card={card}
                    meta={meta}
                    slug={slug}
                    shortUrl={shortUrl!}
                    onClose={() => setIsShareOpen(false)}
                />
            )}
        </div>
    );
};

export default CardSlot;