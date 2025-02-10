import React, { useEffect, useState } from 'react';
import { Card } from '../../types/Card';
import styles from './CardSlot.module.css';
import { useCardContext } from '../../context/CardContext';

interface CardSlotProps {
    card: Card | null;
    onDealNextCard: () => void;
}

const CardSlot: React.FC<CardSlotProps> = ({ card, onDealNextCard }) => {
    const { getCardDetails } = useCardContext();
    const timeIntervals = [1, 2, 3, 5, 8, 13, 21];
    const getRandomTimeInterval = () => timeIntervals[Math.floor(Math.random() * timeIntervals.length)] * 60; // convert minutes to seconds

    const [timeLeft, setTimeLeft] = useState(getRandomTimeInterval());
    const [isHeld, setIsHeld] = useState(false);

    useEffect(() => {
        if (isHeld || !card) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    onDealNextCard();
                    return getRandomTimeInterval(); // reset timer for the next card
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isHeld, card, onDealNextCard]);

    const handleHoldChange = () => {
        setIsHeld(!isHeld);
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    if (!card) {
        console.log('Card is null in CardSlot');
        return <div className={styles.cardSlot}>No card available</div>;
    }

    //console.log('Card in CardSlot:', card);

    if (!Array.isArray(card.bulletpoints)) {
        console.error('Card bulletpoints is not an array:', card.bulletpoints);
        return <div className={styles.cardSlot}>Invalid card data</div>;
    }

    const { trainingModule, subTrainingModule, cardDeck, color } = getCardDetails(card);

    return (
        <div className={styles.cardSlot}>
            <div className={styles.cardDetails}>
                <div className={styles.leftSide}>
                    <h2>{card.title}</h2>
                    <p>{card.description}</p>
                    <ul>
                        {card.bulletpoints.map((point, index) => (
                            <li key={index}>{point}</li>
                        ))}
                    </ul>
                    <div className={styles.bubbleContainer}>
                        <span className={`${styles.bubble} ${styles.bubble1}`} style={{ backgroundColor: color }}>{subTrainingModule}</span>
                        <span className={`${styles.bubble} ${styles.bubble1}`} style={{ backgroundColor: color }}>{cardDeck}</span>
                    </div>
                </div>
                <div className={styles.rightSide}>
                    <div className={styles.topSide}>
                        <span className={`${styles.bubble} ${styles.bubble1}`} style={{ backgroundColor: color }}>{trainingModule}</span>
                        <p>Duration: {card.duration} minutes</p>
                        <p>Difficulty: {card.difficulty}</p>
                        <span>Time left: {formatTime(timeLeft)}</span>
                    </div>
                    <div className={styles.bottomSide}>
                        <div className={styles.controls}>
                            <label style={{ marginLeft: '1ch', marginRight: '1ch', display: 'inline-block', width: '60px' }}>
                                <input type="checkbox" checked={isHeld} onChange={handleHoldChange} />
                                Hold
                            </label>
                            <button onClick={onDealNextCard}>Deal Next Card 🎴</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardSlot;