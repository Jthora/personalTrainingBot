import React, { useEffect, useState } from 'react';
import { Card } from '../../types/Card';
import styles from './CardSlot.module.css';
import { useCardContext } from '../../context/CardContext';
import 'katex/dist/katex.min.css';
import katex from 'katex';

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

    const formatKatex = (text: string) => {
        const inlineMathRegex = /\\\((.*?)\\\)/g;
        const blockMathRegex = /\\\[(.*?)\\\]/g;

        return text.split(blockMathRegex).map((part, index) => {
            if (index % 2 === 1) {
                return <span key={index} dangerouslySetInnerHTML={{ __html: katex.renderToString(part, { displayMode: true }) }} />;
            }
            return part.split(inlineMathRegex).map((subPart, subIndex) => {
                if (subIndex % 2 === 1) {
                    return <span key={`${index}-${subIndex}`} dangerouslySetInnerHTML={{ __html: katex.renderToString(subPart) }} />;
                }
                return subPart;
            });
        });
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

    return (
        <div className={styles.cardSlot}>
            <div className={styles.cardDetails}>
                <div className={styles.topLeft}>
                    <h2>{formatKatex(card.title)}</h2>
                    <p className={styles.cardDescription}>{formatKatex(card.description)}</p>
                    <ul>
                        {card.bulletpoints.map((point, index) => (
                            <li key={index}>{formatKatex(point)}</li>
                        ))}
                    </ul>
                </div>
                <div className={styles.topRight}>
                    <div>
                        <div className={styles.bubbleContainer2}>
                            <span className={`${styles.bubble} ${styles.bubble1}`} style={{ backgroundColor: color }}>{trainingModule}</span>
                        </div>
                        <div className={styles.stats}>
                            <p>{card.duration} minutes ⏱️</p>
                            <p>{card.difficulty} 🎚️</p>
                        </div>
                    </div>
                    <div className={styles.controls}>
                        <label>
                            Hold 
                            <input type="checkbox" checked={isHeld} onChange={handleHoldChange} />
                        </label>
                        <button className={`${styles.cardButton}`} onClick={onDealNextCard}>Next ⏭</button>
                    </div>
                </div>
                <div className={styles.bottomLeft}>
                    <div className={styles.bubbleContainer1}>
                        <span className={`${styles.bubble} ${styles.bubble2}`} style={{ backgroundColor: color }}>{subTrainingModule}</span>
                        <span className={`${styles.bubble} ${styles.bubble2}`} style={{ backgroundColor: color }}>{cardDeck}</span>
                    </div>
                </div>
                <div className={styles.bottomRight}>
                    <span>{formatTime(timeLeft)} ⏳</span>
                </div>
            </div>
        </div>
    );
};

export default CardSlot;