import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Card } from '../../types/Card';
import { CardMeta } from '../../cache/TrainingModuleCache';
import ShareCard from './ShareCard';
import styles from './ShareCardModal.module.css';
import { generateShareSummary } from '../../utils/shareSummary';
import { toBlob, toCanvas, toPng } from 'html-to-image';

const SHARE_CARD_BASE_WIDTH = 960;
const SHARE_CARD_BASE_HEIGHT = 540;

interface ShareCardModalProps {
    card: Card;
    meta: CardMeta;
    slug: string;
    shortUrl: string;
    onClose: () => void;
}

const ShareCardModal: React.FC<ShareCardModalProps> = ({ card, meta, slug, shortUrl, onClose }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const previewWrapperRef = useRef<HTMLDivElement>(null);
    const statusTimeoutRef = useRef<number | null>(null);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [previewScale, setPreviewScale] = useState(1);

    const updatePreviewScale = useCallback(() => {
        const wrapper = previewWrapperRef.current;
        const container = cardRef.current;

        if (!wrapper || !container) {
            return;
        }

        const baseWidth = SHARE_CARD_BASE_WIDTH;
        const baseHeight = SHARE_CARD_BASE_HEIGHT;

        const viewportLimit = typeof window !== 'undefined' ? window.innerHeight * 0.7 : baseHeight;

        const availableWidth = wrapper.clientWidth || baseWidth;
        const wrapperHeight = wrapper.clientHeight || baseHeight;
        const maxHeight = Math.min(wrapperHeight, viewportLimit || baseHeight);

        if (!availableWidth || !maxHeight) {
            setPreviewScale(1);
            return;
        }

        const widthScale = availableWidth / baseWidth;
        const heightScale = maxHeight / baseHeight;
        const nextScale = Math.min(widthScale, heightScale, 1);

        setPreviewScale(prev => Math.abs(prev - nextScale) > 0.01 ? nextScale : prev);
    }, []);

    useLayoutEffect(() => {
        updatePreviewScale();

        if (typeof ResizeObserver === 'undefined') {
            return;
        }

        const wrapper = previewWrapperRef.current;
        const container = cardRef.current;

        if (!wrapper || !container) {
            return;
        }

        const observer = new ResizeObserver(() => {
            updatePreviewScale();
        });

        observer.observe(wrapper);
        observer.observe(container);

        const handleResize = () => updatePreviewScale();
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', handleResize);
        }

        return () => {
            observer.disconnect();
            if (typeof window !== 'undefined') {
                window.removeEventListener('resize', handleResize);
            }
        };
    }, [updatePreviewScale]);

    useEffect(() => {
        if (!cardRef.current) {
            return;
        }

        cardRef.current.style.setProperty('--share-card-scale', previewScale.toString());
    }, [previewScale]);

    const summary = useMemo(() => generateShareSummary({ card, meta, shortUrl }), [card, meta, shortUrl]);
    const previewContainerStyle = useMemo<React.CSSProperties>(() => ({
        width: `${SHARE_CARD_BASE_WIDTH * previewScale}px`,
        height: `${SHARE_CARD_BASE_HEIGHT * previewScale}px`,
        '--share-card-base-width': `${SHARE_CARD_BASE_WIDTH}px`,
        '--share-card-base-height': `${SHARE_CARD_BASE_HEIGHT}px`,
    }), [previewScale]);

    const showStatus = useCallback((message: string) => {
        setStatusMessage(message);
        if (statusTimeoutRef.current) {
            window.clearTimeout(statusTimeoutRef.current);
        }
        statusTimeoutRef.current = window.setTimeout(() => {
            setStatusMessage(null);
            statusTimeoutRef.current = null;
        }, 2500);
    }, []);

    useEffect(() => () => {
        if (statusTimeoutRef.current) {
            window.clearTimeout(statusTimeoutRef.current);
            statusTimeoutRef.current = null;
        }
    }, []);

    const ensureClipboardAvailable = useCallback(() => {
        if (typeof navigator === 'undefined' || !('clipboard' in navigator) || typeof navigator.clipboard?.writeText !== 'function') {
            showStatus('Clipboard not available in this browser');
            return false;
        }
        return true;
    }, [showStatus]);

    const prepareForCapture = useCallback(async () => {
        if (typeof document !== 'undefined' && 'fonts' in document) {
            try {
                await document.fonts.ready;
            } catch (error) {
                console.warn('Unable to confirm font readiness', error);
            }
        }

        await new Promise<void>(resolve => {
            const raf = typeof requestAnimationFrame === 'function'
                ? requestAnimationFrame
                : (cb: FrameRequestCallback) => globalThis.setTimeout(() => cb(Date.now()), 16);

            raf(() => {
                raf(() => resolve());
            });
        });
    }, []);

    const runWithFullScale = useCallback(async <T,>(task: (node: HTMLElement) => Promise<T>): Promise<T> => {
        const node = cardRef.current;

        if (!node) {
            throw new Error('Preview not ready yet');
        }

        const previousScale = node.style.getPropertyValue('--share-card-scale') || previewScale.toString();
        const previousWidth = node.style.width;
        const previousHeight = node.style.height;

        node.style.setProperty('--share-card-scale', '1');
        node.style.width = `${SHARE_CARD_BASE_WIDTH}px`;
        node.style.height = `${SHARE_CARD_BASE_HEIGHT}px`;

        try {
            await prepareForCapture();
            return await task(node);
        } finally {
            node.style.setProperty('--share-card-scale', previousScale);
            node.style.width = previousWidth || `${SHARE_CARD_BASE_WIDTH * previewScale}px`;
            node.style.height = previousHeight || `${SHARE_CARD_BASE_HEIGHT * previewScale}px`;
            updatePreviewScale();
        }
    }, [prepareForCapture, previewScale, updatePreviewScale]);

    const handleCopySummary = useCallback(async () => {
        if (!ensureClipboardAvailable()) {
            return;
        }
        try {
            await navigator.clipboard.writeText(summary.text);
            showStatus('Post text copied to clipboard');
        } catch (error) {
            console.error('Failed to copy summary', error);
            showStatus('Unable to copy post text');
        }
    }, [ensureClipboardAvailable, summary.text, showStatus]);

    const handleCopyLink = useCallback(async () => {
        if (!ensureClipboardAvailable()) {
            return;
        }
        try {
            await navigator.clipboard.writeText(shortUrl);
            showStatus('Link copied to clipboard');
        } catch (error) {
            console.error('Failed to copy link', error);
            showStatus('Unable to copy link');
        }
    }, [ensureClipboardAvailable, shortUrl, showStatus]);

    const handleCopyImage = useCallback(async () => {
        if (!cardRef.current) {
            showStatus('Preview not ready yet');
            return;
        }

        if (typeof navigator === 'undefined' || !('clipboard' in navigator) || typeof navigator.clipboard?.write !== 'function' || typeof ClipboardItem === 'undefined') {
            showStatus('Image clipboard not supported');
            return;
        }

        try {
            setIsExporting(true);
            const blob = await runWithFullScale(node =>
                toBlob(node, {
                    pixelRatio: 2,
                    cacheBust: true,
                    backgroundColor: '#001f3f',
                })
            );

            if (!blob) {
                showStatus('Unable to generate image');
                return;
            }

            const item = new ClipboardItem({ [blob.type]: blob });
            await navigator.clipboard.write([item]);
            showStatus('PNG copied to clipboard');
        } catch (error) {
            console.error('Failed to copy image', error);
            showStatus('Unable to copy PNG');
        } finally {
            setIsExporting(false);
        }
    }, [runWithFullScale, showStatus]);

    const handleDownloadPng = useCallback(async () => {
        if (!cardRef.current) {
            showStatus('Preview not ready yet');
            return;
        }

        try {
            setIsExporting(true);
            const dataUrl = await runWithFullScale(node => toPng(node, {
                pixelRatio: 2,
                cacheBust: true,
                backgroundColor: '#001f3f',
            }));

            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `${slug}.png`;
            link.click();
            showStatus('PNG downloaded');
        } catch (error) {
            console.error('Failed to generate image', error);
            showStatus('Unable to generate PNG');
        } finally {
            setIsExporting(false);
        }
    }, [runWithFullScale, showStatus, slug]);

    const handleDownloadWebp = useCallback(async () => {
        if (!cardRef.current) {
            showStatus('Preview not ready yet');
            return;
        }

        try {
            setIsExporting(true);
            const canvas = await runWithFullScale(node => toCanvas(node, {
                pixelRatio: 2,
                cacheBust: true,
                backgroundColor: '#001f3f',
            }));

            const dataUrl = canvas.toDataURL('image/webp', 0.92);
            if (!dataUrl.startsWith('data:image/webp')) {
                showStatus('WebP not supported in this browser');
                return;
            }

            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `${slug}.webp`;
            link.click();
            showStatus('WebP downloaded');
        } catch (error) {
            console.error('Failed to generate WebP image', error);
            showStatus('Unable to generate WebP');
        } finally {
            setIsExporting(false);
        }
    }, [runWithFullScale, showStatus, slug]);

    const handleOpenComposer = useCallback(() => {
        const intentUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(summary.text)}`;
        window.open(intentUrl, '_blank');
    }, [summary.text]);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    return (
        <div className={styles.overlay}>
            <div className={styles.modal} role="dialog" aria-modal="true">
                <div className={styles.header}>
                    <h2>Share on X</h2>
                    <button className={styles.closeButton} onClick={onClose} aria-label="Close share dialog">×</button>
                </div>
                <div className={styles.body}>
                    <div className={styles.previewWrapper} ref={previewWrapperRef}>
                        <div ref={cardRef} style={previewContainerStyle}>
                            <ShareCard card={card} meta={meta} slug={slug} shortUrl={shortUrl} footerLabel="Open in app" />
                        </div>
                    </div>
                    <div className={styles.contentColumn}>
                        <div className={styles.summarySection}>
                            <label htmlFor="share-summary">Post text ({summary.text.length}/280)</label>
                            <textarea
                                id="share-summary"
                                className={styles.summaryTextarea}
                                value={summary.text}
                                readOnly
                            />
                        </div>
                        <div className={styles.actions}>
                            <button onClick={handleCopySummary}>Copy post text</button>
                            <button onClick={handleCopyLink}>Copy link</button>
                            <button onClick={handleOpenComposer}>Open X composer</button>
                            <button onClick={handleCopyImage} disabled={isExporting}>
                                {isExporting ? 'Generating…' : 'Copy PNG'}
                            </button>
                            <button onClick={handleDownloadPng} disabled={isExporting}>
                                {isExporting ? 'Generating…' : 'Download PNG'}
                            </button>
                            <button onClick={handleDownloadWebp} disabled={isExporting}>
                                {isExporting ? 'Generating…' : 'Download WebP'}
                            </button>
                        </div>
                        {statusMessage && <div className={styles.status}>{statusMessage}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareCardModal;
