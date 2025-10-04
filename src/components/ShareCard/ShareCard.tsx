import React, {
    ForwardedRef,
    ReactNode,
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
} from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import styles from './ShareCard.module.css';
import { Card } from '../../types/Card';
import { CardMeta } from '../../cache/TrainingModuleCache';

export interface ShareCardDisplayOptions {
    showModulePill: boolean;
    showBreadcrumbs: boolean;
    showDescription: boolean;
    showBulletPoints: boolean;
    showBadges: boolean;
    showLink: boolean;
}

export interface ShareCardProps {
    card: Card;
    meta: CardMeta;
    slug?: string;
    shortUrl: string;
    footerLabel?: string;
    displayOptions?: Partial<ShareCardDisplayOptions>;
    scale?: number;
    height?: number;
    onHeightChange?: (height: number) => void;
}

const MAX_BULLETS = 4;

const DEFAULT_DISPLAY_OPTIONS: ShareCardDisplayOptions = {
    showModulePill: true,
    showBreadcrumbs: true,
    showDescription: true,
    showBulletPoints: true,
    showBadges: true,
    showLink: true,
};

const clampMathExpression = (source: string) => source.replace(/\r?\n+/g, ' ').trim();

const renderMathSegments = (source: string, keyPrefix: string): ReactNode => {
    if (!source) {
        return null;
    }

    const pattern = /(\\\[.*?\\\]|\\\(.*?\\\))/gs;
    const result: ReactNode[] = [];
    let lastIndex = 0;
    let index = 0;

    for (const match of source.matchAll(pattern)) {
        const matchIndex = match.index ?? 0;
        const [token] = match;

        if (matchIndex > lastIndex) {
            const text = source.slice(lastIndex, matchIndex);
            if (text.trim().length) {
                result.push(<span key={`${keyPrefix}-text-${index}`}>{text}</span>);
            }
        }

        const payload = clampMathExpression(token.slice(2, -2));
        if (payload) {
            const isBlock = token.startsWith('\\[');
            const html = katex.renderToString(payload, { displayMode: isBlock });
            result.push(
                <span
                    key={`${keyPrefix}-math-${index}`}
                    className={isBlock ? styles.katexBlock : styles.katexInline}
                    dangerouslySetInnerHTML={{ __html: html }}
                />
            );
        }

        lastIndex = matchIndex + token.length;
        index += 1;
    }

    if (lastIndex < source.length) {
        const tail = source.slice(lastIndex);
        if (tail.trim().length) {
            result.push(<span key={`${keyPrefix}-tail`}>{tail}</span>);
        }
    }

    if (result.length === 0) {
        return source;
    }

    return result;
};

const mergeRefs = <T,>(...refs: Array<ForwardedRef<T>>): ((instance: T | null) => void) => (
    (instance: T | null) => {
        refs.forEach(ref => {
            if (typeof ref === 'function') {
                ref(instance);
            } else if (ref && typeof ref === 'object') {
                (ref as React.MutableRefObject<T | null>).current = instance;
            }
        });
    }
);

const ShareCard = React.forwardRef<HTMLDivElement, ShareCardProps>((props: ShareCardProps, forwardedRef: ForwardedRef<HTMLDivElement>) => {
    const {
        card,
        meta,
        slug,
        shortUrl,
        footerLabel,
        displayOptions,
        scale,
        height,
        onHeightChange,
    } = props;

    const internalRef = useRef<HTMLDivElement | null>(null);
    const resolvedScale = useMemo(() => {
        if (!scale || Number.isNaN(scale) || scale <= 0) {
            return 1;
        }
        return scale;
    }, [scale]);

    const resolvedDisplay = useMemo<ShareCardDisplayOptions>(() => ({
        ...DEFAULT_DISPLAY_OPTIONS,
        ...(displayOptions ?? {}),
    }), [displayOptions]);

    const { showModulePill, showBreadcrumbs, showDescription, showBulletPoints, showBadges, showLink } = resolvedDisplay;

    const bulletpoints = useMemo(() => (
        Array.isArray(card.bulletpoints)
            ? card.bulletpoints.filter(Boolean).slice(0, MAX_BULLETS)
            : []
    ), [card.bulletpoints]);

    const linkLabel = useMemo(() => {
        if (!showLink) {
            return undefined;
        }
        if (shortUrl) {
            return shortUrl;
        }
        return slug ? `/c/${slug}` : undefined;
    }, [shortUrl, slug, showLink]);

    const resolvedFooterLabel = useMemo(() => {
        if (!showLink) {
            return undefined;
        }
        const trimmed = footerLabel?.trim();
        return trimmed && trimmed.length > 0 ? trimmed : 'Open in app';
    }, [footerLabel, showLink]);

    const reportHeight = useCallback(() => {
        if (!onHeightChange || !internalRef.current) {
            return;
        }
        const node = internalRef.current;
        const rectHeight = node.getBoundingClientRect().height;
        if (rectHeight > 0) {
            const normalizedHeight = rectHeight / resolvedScale;
            onHeightChange(Math.ceil(normalizedHeight));
        }
    }, [onHeightChange, resolvedScale]);

    useLayoutEffect(() => {
        reportHeight();
    }, [reportHeight, card, meta, shortUrl, slug, footerLabel, displayOptions, resolvedScale]);

    useEffect(() => {
        if (!internalRef.current || typeof ResizeObserver === 'undefined' || !onHeightChange) {
            return;
        }

        const observer = new ResizeObserver(() => reportHeight());
        observer.observe(internalRef.current);

        return () => observer.disconnect();
    }, [reportHeight, onHeightChange]);

    const assignRef = useMemo(() => mergeRefs<HTMLDivElement>(forwardedRef, node => {
        internalRef.current = node;
    }), [forwardedRef]);

    return (
        <div
            ref={assignRef}
            className={styles.card}
            style={{
                '--share-card-accent': meta.moduleColor,
                '--share-card-scale': resolvedScale,
                '--share-card-height': height ? `${height}px` : undefined,
            } as React.CSSProperties}
        >
            <div className={styles.backdrop} aria-hidden />
            {(showModulePill || showBreadcrumbs) && (
                <div className={styles.topBar}>
                    {showModulePill && (
                        <span className={styles.moduleBadge}>{meta.moduleName}</span>
                    )}
                    {showBreadcrumbs && (
                        <div className={styles.breadcrumbs}>
                            <span>{meta.subModuleName}</span>
                            <span aria-hidden className={styles.separator}>⟡</span>
                            <span>{meta.cardDeckName}</span>
                        </div>
                    )}
                </div>
            )}
            <div className={styles.mainContent}>
                <h1 className={styles.title}>{renderMathSegments(card.title, 'title')}</h1>
                {showDescription && (
                    <p className={styles.description}>{renderMathSegments(card.description, 'description')}</p>
                )}
                {showBulletPoints && bulletpoints.length > 0 && (
                    <ul className={styles.bulletList}>
                        {bulletpoints.map((point: string, index: number) => (
                            <li key={index}>
                                <span className={styles.bulletGlyph} aria-hidden>•</span>
                                <div className={styles.bulletContent}>{renderMathSegments(point, `bullet-${index}`)}</div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {(showBadges || linkLabel) && (
                <div className={styles.footerRow}>
                    {showBadges && (
                        <div className={styles.statChips}>
                            <div className={styles.statChip}>
                                <span className={styles.statLabel}>Duration</span>
                                <span className={styles.statValue}>{card.duration} min</span>
                            </div>
                            <div className={styles.statChip}>
                                <span className={styles.statLabel}>Difficulty</span>
                                <span className={styles.statValue}>{card.difficulty}</span>
                            </div>
                        </div>
                    )}
                    {linkLabel && (
                        <div className={styles.linkBlock}>
                            {resolvedFooterLabel && <span className={styles.linkLabel}>{resolvedFooterLabel}</span>}
                            <span className={styles.linkValue}>{linkLabel}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});

ShareCard.displayName = 'ShareCard';

export default ShareCard;
