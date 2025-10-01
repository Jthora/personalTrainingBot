import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import TrainingModuleCache, { CardMeta } from '../../cache/TrainingModuleCache';
import { Card } from '../../types/Card';
import styles from './CardSharePage.module.css';
import ShareCard from '../../components/ShareCard/ShareCard';

interface ShareState {
    status: 'loading' | 'ready' | 'not-found';
    card?: Card;
    meta?: CardMeta;
    slug?: string;
}

const CardSharePage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [state, setState] = useState<ShareState>({ status: 'loading' });

    const cache = useMemo(() => TrainingModuleCache.getInstance(), []);

    const shortUrl = useMemo(() => {
        if (!slug) {
            return undefined;
        }

        if (typeof window !== 'undefined' && window.location) {
            return `${window.location.origin}/c/${slug}`;
        }

        return `/c/${slug}`;
    }, [slug]);

    useEffect(() => {
        if (!slug) {
            setState({ status: 'not-found' });
            return;
        }

        if (!cache.isLoaded()) {
            console.error('TrainingModuleCache not loaded before CardSharePage render.');
            setState({ status: 'loading' });
            return;
        }

        const cardId = cache.getCardIdBySlug(slug);
        if (!cardId) {
            setState({ status: 'not-found' });
            return;
        }

        const card = cache.getCardById(cardId);
        const meta = cache.getCardMeta(cardId);

        if (!card || !meta) {
            setState({ status: 'not-found' });
            return;
        }

        setState({ status: 'ready', card, meta, slug });
    }, [slug, cache]);

    if (state.status === 'loading') {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.message}>Preparing shared card…</div>
            </div>
        );
    }

    if (state.status === 'not-found' || !state.card || !state.meta) {
        return (
            <div className={styles.pageContainer}>
                <div className={styles.message}>
                    Card not found or is no longer available.
                    <div className={styles.backLink}>
                        <Link to="/">Return to Training Bot</Link>
                    </div>
                </div>
            </div>
        );
    }

    const { card, meta } = state;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.cardWrapper}>
                <ShareCard card={card} meta={meta} slug={state.slug} shortUrl={shortUrl!} footerLabel="Open in app" />
                {state.slug && (
                    <div className={styles.actions}>
                        <Link className={styles.primaryAction} to={`/?cardSlug=${state.slug}`}>
                            Open interactive view
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CardSharePage;
