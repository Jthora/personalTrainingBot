import { useEffect, useState } from 'react';
import type { CacheSource } from '../../utils/cache/types';

interface CacheEventDetail {
    store: string;
    key: IDBValidKey;
    source: CacheSource;
    stale?: boolean;
}

const styles: React.CSSProperties = {
    position: 'fixed',
    bottom: '12px',
    right: '12px',
    padding: '8px 12px',
    borderRadius: '999px',
    background: 'rgba(0, 128, 96, 0.14)',
    color: '#0f5132',
    border: '1px solid rgba(0, 128, 96, 0.35)',
    fontSize: '12px',
    fontWeight: 600,
    boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
    backdropFilter: 'blur(6px)',
    zIndex: 1200,
};

const hiddenStyles: React.CSSProperties = { display: 'none' };

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
        <div style={visible ? styles : hiddenStyles} role="status" aria-live="polite">
            {message}
        </div>
    );
};

export default CacheIndicator;
