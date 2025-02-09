import React from 'react';
import CardSlot from '../CardSlot/CardSlot';
import { useCardContext } from '../../context/CardContext';
import styles from './CardTable.module.css';

const CardTable: React.FC = () => {
    const { cards, dealNextCard } = useCardContext();

    return (
        <div className={styles.cardTable}>
            {cards.map((card, index) => (
                <CardSlot key={index} card={card} onDealNextCard={() => dealNextCard(index)} />
            ))}
        </div>
    );
};

export default CardTable;