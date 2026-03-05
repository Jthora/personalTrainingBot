import React, { useMemo } from 'react';
import CardSlot from '../CardSlot/CardSlot';
import { useCardContext } from '../../hooks/useCardContext';
import styles from './CardTable.module.css';
import { useMissionRenderProbe } from '../../utils/missionRenderProfile';

const CardTable: React.FC = () => {
    useMissionRenderProbe('mission:triage:detail-table');
    const { cards, dealNextCard } = useCardContext();

    const allEmpty = useMemo(() => cards.every(card => !card), [cards]);

    return (
        <div className={styles.cardTable}>
            {allEmpty ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyTitle}>No cards available yet</div>
                    <div className={styles.emptyBody}>Refresh your selection or generate a plan to start dealing cards.</div>
                </div>
            ) : (
                cards.map((card, index) => (
                    <CardSlot key={card?.id ?? index} card={card} onDealNextCard={() => dealNextCard(index)} />
                ))
            )}
        </div>
    );
};

export default CardTable;