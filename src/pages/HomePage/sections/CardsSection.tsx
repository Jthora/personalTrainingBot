import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CardTable from '../../../components/CardTable/CardTable';
import { CardProvider } from '../../../context/CardContext';
import TrainingModuleCache from '../../../cache/TrainingModuleCache';
import styles from './CardsSection.module.css';
import { logEvent } from '../../../utils/telemetry';
import { mark, measure } from '../../../utils/perf';

const CardsSection: React.FC = () => {
    const [params] = useSearchParams();
    const cardSlug = params.get('cardSlug') ?? undefined;
    const cache = TrainingModuleCache.getInstance();
    const [ready, setReady] = useState(cache.isLoaded());
    const [slugError, setSlugError] = useState<string | null>(null);
    const perfMarkedRef = useRef(false);

    useEffect(() => {
        if (ready) return undefined;
        const interval = setInterval(() => {
            if (cache.isLoaded()) {
                setReady(true);
                clearInterval(interval);
            }
        }, 150);
        return () => clearInterval(interval);
    }, [cache, ready]);

    useEffect(() => {
        if (!cardSlug || !ready) {
            setSlugError(null);
            return;
        }
        const cardId = cache.getCardIdBySlug(cardSlug);
        if (!cardId) {
            logEvent({ type: 'card_slug_focus', slug: cardSlug, status: 'not-found' });
            setSlugError('Card link not found. You can still browse cards.');
        } else {
            logEvent({ type: 'card_slug_focus', slug: cardSlug, status: 'success' });
            setSlugError(null);
        }
    }, [cache, cardSlug, ready]);

    useEffect(() => {
        if (!ready || perfMarkedRef.current) return;
        const endMark = mark('home:cards:content_ready');
        if (endMark) {
            measure('home:cards:boot_to_ready', 'load:boot_start', endMark);
        }
        perfMarkedRef.current = true;
    }, [ready]);

    return (
        <section id="section-cards" aria-label="Cards" className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>Cards</h2>
                <p className={styles.body}>Deal, hold, and share cards. Slug links focus the first slot automatically.</p>
            </div>
            {slugError && (
                <div className={styles.alert} role="alert">
                    {slugError} <a href="/home/cards">Back to cards</a>
                </div>
            )}
            {ready ? (
                <CardProvider initialSlug={cardSlug}>
                    <div className={styles.tableWrapper}>
                        <CardTable />
                    </div>
                </CardProvider>
            ) : (
                <div className={styles.tableWrapper}>
                    <div className={styles.skeleton}>
                        <div className={styles.skeletonLine} />
                        <div className={styles.skeletonLine} />
                        <div className={styles.skeletonLineShort} />
                    </div>
                </div>
            )}
        </section>
    );
};

export default CardsSection;
