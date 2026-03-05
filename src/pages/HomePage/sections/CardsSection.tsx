import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CardTable from '../../../components/CardTable/CardTable';
import { CardProvider } from '../../../context/CardContext';
import TrainingModuleCache from '../../../cache/TrainingModuleCache';
import styles from './CardsSection.module.css';
import { trackEvent } from '../../../utils/telemetry';
import { mark, measure } from '../../../utils/perf';
import { getMissionSurfaceState } from '../../../store/missionFlow/routeState';
import MissionRouteState from '../../../components/MissionRouteState/MissionRouteState';
import { missionEntityIcons } from '../../../utils/mission/iconography';
import TriageBoard from '../../../components/TriageBoard/TriageBoard';

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
            trackEvent({ category: 'ia', action: 'deep_link_load', route: '/mission/triage', data: { slug: cardSlug, status: 'not-found' }, source: 'ui' });
            setSlugError('Card link not found. You can still browse cards.');
        } else {
            trackEvent({ category: 'ia', action: 'deep_link_load', route: '/mission/triage', data: { slug: cardSlug, status: 'success' }, source: 'ui' });
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

    const routeState = getMissionSurfaceState('triage');
    if (routeState.kind !== 'ready') {
        return (
            <section id="section-cards" aria-label="Drills and Intel" className={styles.section}>
                <MissionRouteState state={routeState} />
            </section>
        );
    }

    return (
        <section id="section-cards" aria-label="Drills and Intel" className={styles.section}>
            <div className={styles.header}>
                <h2 className={styles.title}>{missionEntityIcons.lead} Drills / Intel</h2>
                <p className={styles.body}>Browse drills and intel cards. Deep links focus the specified card when available.</p>
            </div>
            <TriageBoard />
            {slugError && (
                <div className={styles.alert} role="alert">
                    {slugError} <a href="/mission/triage">Back to cards</a>
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
