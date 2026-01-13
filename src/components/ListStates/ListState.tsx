import React from 'react';
import styles from './ListState.module.css';

type Tone = 'info' | 'error';

type ListSkeletonProps = {
    rows?: number;
    label?: string;
    withHeaderBar?: boolean;
};

export const ListSkeleton: React.FC<ListSkeletonProps> = ({ rows = 3, label = 'Loading list', withHeaderBar = true }) => {
    return (
        <div className={styles.skeleton} aria-label={label} role="status">
            {withHeaderBar && <div className={styles.skeletonBar} />}
            {Array.from({ length: rows }).map((_, idx) => (
                <div key={idx} className={styles.skeletonCard} />
            ))}
        </div>
    );
};

type ListEmptyStateProps = {
    title: string;
    body?: string;
    icon?: React.ReactNode;
    actions?: React.ReactNode;
    tone?: Tone;
    role?: 'status' | 'alert';
    ariaLive?: 'polite' | 'assertive';
};

export const ListEmptyState: React.FC<ListEmptyStateProps> = ({
    title,
    body,
    icon = '🔍',
    actions,
    tone = 'info',
    role,
    ariaLive,
}) => {
    const resolvedRole = role ?? (tone === 'error' ? 'alert' : 'status');
    const resolvedLive = ariaLive ?? (tone === 'error' ? 'assertive' : 'polite');

    return (
        <div
            className={`${styles.emptyState} ${tone === 'error' ? styles.error : ''}`}
            role={resolvedRole}
            aria-live={resolvedLive}
        >
            <div className={styles.icon} aria-hidden>
                {icon}
            </div>
            <div className={styles.content}>
                <p className={styles.title}>{title}</p>
                {body && <p className={styles.body}>{body}</p>}
                {actions && <div className={styles.actions}>{actions}</div>}
            </div>
        </div>
    );
};
