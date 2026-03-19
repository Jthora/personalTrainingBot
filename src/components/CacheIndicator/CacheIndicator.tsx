import { useEffect, useState } from 'react';
import type { CacheSource } from '../../utils/cache/types';
import styles from './CacheIndicator.module.css';

interface CacheEventDetail {
    store: string;
    key: IDBValidKey;
    source: CacheSource;
    stale?: boolean;
}

const CacheIndicator = () => {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const handler = (event: Event) => {
            const detail = (event as CustomEvent<CacheEventDetail>).detail;
            if (!detail) return;
            if (detail.source === 'network') {
                setVisible(false);
                return;
            }
            const label = detail.source === 'stale-cache' ? 'Stale cache' : 'Cached data';
            setMessage(`${label} in use (${detail.store})`);
            setVisible(true);
            window.setTimeout(() => setVisible(false), 4000);
        };

        window.addEventListener('ptb-cache-status', handler as EventListener);
        return () => window.removeEventListener('ptb-cache-status', handler as EventListener);
    }, []);

    return (
        <div
            className={`${styles.indicator} ${!visible ? styles.hidden : ''}`}
            role="status"
            aria-live="polite"
        >
            {message}
        </div>
    );
};

export default CacheIndicator;
