import React, { useMemo } from 'react';
import { Card } from '../../types/Card';
import { CardMeta } from '../../cache/TrainingModuleCache';
import styles from './ShareCard.module.css';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface ShareCardProps {
    card: Card;
    meta: CardMeta;
    slug?: string;
    shortUrl: string;
    footerLabel?: string;
}

const ShareCard: React.FC<ShareCardProps> = ({ card, meta, slug, shortUrl, footerLabel }) => {
    const bulletpoints = useMemo(() => {
        if (!Array.isArray(card.bulletpoints)) {
            return [];
        }
        return card.bulletpoints.slice(0, 4);
    }, [card.bulletpoints]);

    const linkLabel = shortUrl || (slug ? `/c/${slug}` : undefined);

    const renderKatexText = (text: string, keyPrefix: string) => {
        const inlineMathRegex = /\\\((.*?)\\\)/g;
        const blockMathRegex = /\\\[(.*?)\\\]/g;
        const segments: React.ReactNode[] = [];

        const blocks = text.split(blockMathRegex);

        blocks.forEach((block, blockIndex) => {
            if (blockIndex % 2 === 1) {
                segments.push(
                    <span
                        key={`${keyPrefix}-block-${blockIndex}`}
                        dangerouslySetInnerHTML={{ __html: katex.renderToString(block, { displayMode: true }) }}
                    />
                );
            } else {
                const inlineParts = block.split(inlineMathRegex);
                inlineParts.forEach((part, inlineIndex) => {
                    if (inlineIndex % 2 === 1) {
                        segments.push(
                            <span
                                key={`${keyPrefix}-inline-${blockIndex}-${inlineIndex}`}
                                dangerouslySetInnerHTML={{ __html: katex.renderToString(part) }}
                            />
                        );
                    } else if (part) {
                        segments.push(
                            <span key={`${keyPrefix}-text-${blockIndex}-${inlineIndex}`}>{part}</span>
                        );
                    }
                });
            }
        });

        if (segments.length === 0) {
            return text;
        }

        return segments;
    };

    return (
        <div className={styles.shareCard} style={{ '--module-accent': meta.moduleColor } as React.CSSProperties}>
            <div className={styles.topRow}>
                <span className={styles.modulePill}>{meta.moduleName}</span>
                <div className={styles.breadcrumbs}>{meta.subModuleName} · {meta.cardDeckName}</div>
            </div>
            <div className={styles.body}>
                <h1 className={styles.title}>{renderKatexText(card.title, 'title')}</h1>
                <p className={styles.description}>{renderKatexText(card.description, 'description')}</p>
                {bulletpoints.length > 0 && (
                    <ul className={styles.bullets}>
                        {bulletpoints.map((point, index) => (
                            <li key={index}>{renderKatexText(point, `bullet-${index}`)}</li>
                        ))}
                    </ul>
                )}
            </div>
            <div className={styles.bottomRow}>
                <div className={styles.badges}>
                    <span className={styles.badge}>⏱ {card.duration} min</span>
                    <span className={styles.badge}>🎚 {card.difficulty}</span>
                </div>
                {linkLabel && (
                    <div className={styles.linkArea}>
                        <span className={styles.linkLabel}>{footerLabel ?? 'Deep link'}</span>
                        <span className={styles.linkValue}>{linkLabel}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ShareCard;
