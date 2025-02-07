import React from 'react';
import { Card } from '../../types/Card';
import styles from './CardSlot.module.css';

const CardSlot: React.FC = () => {
    // Example card data
    const cardData: Card = {
        id: '1',
        title: 'Sample Card',
        description: 'This is a sample card description.',
        bulletpoints: ['Point 1', 'Point 2', 'Point 3'],
        duration: 30,
        difficulty: 'Beginner'
    };

    return (
        <div className={styles.cardSlot}>
            <h2>{cardData.title}</h2>
            <p>{cardData.description}</p>
            <ul>
                {cardData.bulletpoints.map((point, index) => (
                    <li key={index}>{point}</li>
                ))}
            </ul>
            <p>Duration: {cardData.duration} minutes</p>
            <p>Difficulty: {cardData.difficulty}</p>
        </div>
    );
};

export default CardSlot;