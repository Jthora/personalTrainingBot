import React from 'react';
import CardSlot from '../CardSlot/CardSlot';
import styles from './CardTable.module.css';

const CardTable: React.FC = () => {
    return (
        <div className={styles.cardTable}>
            <CardSlot />
            <CardSlot />
            <CardSlot />
        </div>
    );
};

export default CardTable;