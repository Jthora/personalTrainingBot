import React from 'react';
import { Card } from '../../types/Card';
import styles from './CardSlot.module.css';

interface CardSlotProps {
    card: Card | null;
    onDealNextCard: () => void;
}

const CardSlot: React.FC<CardSlotProps> = ({ card, onDealNextCard }) => {
    if (!card) {
        console.log('Card is null in CardSlot');
        return <div className={styles.cardSlot}>No card available</div>;
    }

    console.log('Card in CardSlot:', card);

    if (!Array.isArray(card.bulletpoints)) {
        console.error('Card bulletpoints is not an array:', card.bulletpoints);
        return <div className={styles.cardSlot}>Invalid card data</div>;
    }

    return (
        <div className={styles.cardSlot}>
            <h2>{card.title}</h2>
            <p>{card.description}</p>
            <ul>
                {card.bulletpoints.map((point, index) => (
                    <li key={index}>{point}</li>
                ))}
            </ul>
            <p>Duration: {card.duration} minutes</p>
            <p>Difficulty: {card.difficulty}</p>
            <button onClick={onDealNextCard}>Deal Next Card</button>
        </div>
    );
};

export default CardSlot;