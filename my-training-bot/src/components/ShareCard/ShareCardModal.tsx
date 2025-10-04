import { ChangeEvent, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Card } from '../../types/Card';
import { CardMeta } from '../../cache/TrainingModuleCache';
import ShareCard, { ShareCardDisplayOptions } from './ShareCard';
import { generateShareSummary } from '../../utils/shareSummary';
import styles from './ShareCardModal.module.css';
import { toBlob, toCanvas, toPng } from 'html-to-image';

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 675;

const DEFAULT_OPTIONS: ShareCardDisplayOptions = {
    showModulePill: true,
    showBreadcrumbs: true,
    showDescription: true,
    showBulletPoints: true,
    showBadges: true,
    showLink: true,
};

type ShareCardModalProps = {
    card: Card;
    meta: CardMeta;
    slug: string;
    shortUrl: string;
    onClose: () => void;
};

const ShareCardModal = ({ card, meta, slug, shortUrl, onClose }: ShareCardModalProps) => {
    const previewFrameRef = useRef<HTMLDivElement | null>(null);
    const statusTimeoutRef = useRef<number | null>(null);
    const exportCardRef = useRef<HTMLDivElement | null>(null);

    const [displayOptions, setDisplayOptions] = useState<ShareCardDisplayOptions>(DEFAULT_OPTIONS);
    const [footerLabel, setFooterLabel] = useState('Open in app');
    const [scale, setScale] = useState(1);
    const [cardHeight, setCardHeight] = useState(CARD_HEIGHT);
    const [isExporting, setIsExporting] = useState(false);
    const [status, setStatus] = useState<string | null>(null);

    const summary = useMemo(() => generateShareSummary({ card, meta, shortUrl }), [card, meta, shortUrl]);

    const showStatus = useCallback((message: string) => {
        setStatus(message);
        if (statusTimeoutRef.current) {
            window.clearTimeout(statusTimeoutRef.current);
        }
        statusTimeoutRef.current = window.setTimeout(() => {
            setStatus(null);
            statusTimeoutRef.current = null;
        }, 2600);
    }, []);

    useEffect(() => () => {
        if (statusTimeoutRef.current) {
            window.clearTimeout(statusTimeoutRef.current);
            statusTimeoutRef.current = null;
        }
    }, []);

    const updateScale = useCallback(() => {
        const frame = previewFrameRef.current;
        if (!frame) {
            return;
        }
        const maxWidth = frame.clientWidth || CARD_WIDTH;
        if (!maxWidth) {
            setScale(1);
            return;
        }
        const nextScale = Math.min(1, maxWidth / CARD_WIDTH);
        setScale(prev => (Math.abs(prev - nextScale) > 0.01 ? nextScale : prev));
    }, []);

    useLayoutEffect(() => {
        updateScale();
    }, [updateScale]);

    useEffect(() => {
        if (!previewFrameRef.current || typeof ResizeObserver === 'undefined') {
            return;
        }
        const observer = new ResizeObserver(() => updateScale());
        observer.observe(previewFrameRef.current);
        return () => observer.disconnect();
    }, [updateScale]);

    useEffect(() => {
        const onResize = () => updateScale();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [updateScale]);

    useEffect(() => {
        updateScale();
    }, [cardHeight, updateScale]);

    const handleCardHeightChange = useCallback((height: number) => {
        setCardHeight(prev => (Math.abs(prev - height) > 0.5 ? height : prev));
    }, []);

    const ensureClipboardText = useCallback(() => {
        if (typeof navigator === 'undefined' || !navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
            showStatus('Clipboard not available');
            return false;
        }
        return true;
    }, [showStatus]);

    const prepareForCapture = useCallback(async () => {
        if (typeof document !== 'undefined' && 'fonts' in document) {
            try {
                await (document as Document & { fonts: FontFaceSet }).fonts.ready;
            } catch (error) {
                console.warn('Unable to confirm font readiness', error);
            }
        }

        await new Promise<void>(resolve => {
            const raf = typeof requestAnimationFrame === 'function'
                ? requestAnimationFrame
                : (cb: FrameRequestCallback) => window.setTimeout(() => cb(Date.now()), 16);
            raf(() => raf(() => resolve()));
        });
    }, []);

    const runExportTask = useCallback(async <T,>(task: (node: HTMLElement) => Promise<T>): Promise<T> => {
        const node = exportCardRef.current;
        if (!node) {
            throw new Error('Export surface not ready');
        }

        await prepareForCapture();

        return task(node);
    }, [prepareForCapture]);

    const handleCopySummary = useCallback(async () => {
        if (!ensureClipboardText()) {
            return;
        }
        try {
            await navigator.clipboard.writeText(summary.text);
            showStatus('Post text copied');
        } catch (error) {
            console.error('Failed to copy summary', error);
            showStatus('Unable to copy post text');
        }
    }, [ensureClipboardText, summary.text, showStatus]);

    const handleCopyLink = useCallback(async () => {
        if (!ensureClipboardText()) {
            return;
        }
        try {
            await navigator.clipboard.writeText(shortUrl);
            showStatus('Link copied');
        } catch (error) {
            console.error('Failed to copy link', error);
            showStatus('Unable to copy link');
        }
    }, [ensureClipboardText, shortUrl, showStatus]);

    const handleOpenComposer = useCallback(() => {
        const intentUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(summary.text)}`;
        window.open(intentUrl, '_blank');
    }, [summary.text]);

    const handleCopyImage = useCallback(async () => {
        if (typeof navigator === 'undefined' || !('clipboard' in navigator) || typeof navigator.clipboard?.write !== 'function' || typeof ClipboardItem === 'undefined') {
            showStatus('Image clipboard not supported');
            return;
        }

        try {
            setIsExporting(true);
            const blob = await runExportTask((node: HTMLElement) => toBlob(node, {
                cacheBust: true,
                pixelRatio: 2,
                backgroundColor: '#040c1e',
            }));

            if (!blob) {
                showStatus('Unable to generate image');
                return;
            }

            const item = new ClipboardItem({ [blob.type]: blob });
            await navigator.clipboard.write([item]);
            showStatus('PNG copied to clipboard');
        } catch (error) {
            console.error('Failed to copy PNG', error);
            showStatus('Unable to copy PNG');
        } finally {
            setIsExporting(false);
        }
    }, [runExportTask, showStatus]);

    const handleDownloadPng = useCallback(async () => {
        try {
            setIsExporting(true);
            const dataUrl = await runExportTask((node: HTMLElement) => toPng(node, {
                cacheBust: true,
                pixelRatio: 2,
                backgroundColor: '#040c1e',
            }));

            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `${slug}.png`;
            link.rel = 'noopener';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showStatus('PNG downloaded');
        } catch (error) {
            console.error('Failed to download PNG', error);
            showStatus('Unable to download PNG');
        } finally {
            setIsExporting(false);
        }
    }, [runExportTask, showStatus, slug]);

    const handleDownloadWebp = useCallback(async () => {
        try {
            setIsExporting(true);
            const canvas = await runExportTask((node: HTMLElement) => toCanvas(node, {
                cacheBust: true,
                pixelRatio: 2,
                backgroundColor: '#040c1e',
            }));

            const dataUrl = canvas.toDataURL('image/webp', 0.92);
            if (!dataUrl.startsWith('data:image/webp')) {
                showStatus('WebP not supported');
                return;
            }

            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `${slug}.webp`;
            link.rel = 'noopener';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showStatus('WebP downloaded');
        } catch (error) {
            console.error('Failed to download WebP', error);
            showStatus('Unable to download WebP');
        } finally {
            setIsExporting(false);
        }
    }, [runExportTask, showStatus, slug]);

    const handleDisplayOptionChange = useCallback((option: keyof ShareCardDisplayOptions) => (event: ChangeEvent<HTMLInputElement>) => {
        const { checked } = event.target;
        setDisplayOptions(prev => ({
            ...prev,
            [option]: checked,
        }));
    }, []);

    const handleFooterLabelChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        setFooterLabel(event.target.value);
    }, []);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <>
            <div className={styles.overlay}>
                <div className={styles.modal} role="dialog" aria-modal="true">
                    <header className={styles.header}>
                        <div>
                            <h2>Create share card</h2>
                            <p className={styles.subtitle}>Preview, copy post text, and export high-res PNG assets.</p>
                        </div>
                        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Close share dialog">×</button>
                    </header>
                    <div className={styles.body}>
                        <section className={styles.previewColumn}>
                            <div className={styles.previewFrame} ref={previewFrameRef}>
                                <div
                                    className={styles.previewCanvas}
                                    style={{ height: '100%', minHeight: `${Math.max(cardHeight * scale, 1)}px` }}
                                >
                                    <ShareCard
                                        card={card}
                                        meta={meta}
                                        slug={slug}
                                        shortUrl={shortUrl}
                                        footerLabel={footerLabel}
                                        displayOptions={displayOptions}
                                        scale={scale}
                                        height={cardHeight}
                                    />
                                </div>
                            </div>
                        </section>
                        <section className={styles.controlsColumn}>
                            <div className={styles.section}>
                                <div className={styles.sectionHeading}>
                                    <h3>Share copy</h3>
                                    <span>{summary.text.length}/280</span>
                                </div>
                                <textarea
                                    className={styles.summaryTextarea}
                                    value={summary.text}
                                    readOnly
                                    rows={6}
                                />
                                <div className={styles.buttonRow}>
                                    <button type="button" onClick={handleCopySummary}>Copy post text</button>
                                    <button type="button" onClick={handleCopyLink}>Copy link</button>
                                    <button type="button" onClick={handleOpenComposer}>Open X composer</button>
                                </div>
                            </div>
                            <div className={styles.section}>
                                <div className={styles.sectionHeading}>
                                    <h3>Appearance</h3>
                                    <span>Toggle elements on the card</span>
                                </div>
                                <div className={styles.toggleGrid}>
                                    <label className={styles.toggle}>
                                        <input
                                            type="checkbox"
                                            checked={displayOptions.showModulePill}
                                            onChange={handleDisplayOptionChange('showModulePill')}
                                        />
                                        <span>Module badge</span>
                                    </label>
                                    <label className={styles.toggle}>
                                        <input
                                            type="checkbox"
                                            checked={displayOptions.showBreadcrumbs}
                                            onChange={handleDisplayOptionChange('showBreadcrumbs')}
                                        />
                                        <span>Module trail</span>
                                    </label>
                                    <label className={styles.toggle}>
                                        <input
                                            type="checkbox"
                                            checked={displayOptions.showDescription}
                                            onChange={handleDisplayOptionChange('showDescription')}
                                        />
                                        <span>Description</span>
                                    </label>
                                    <label className={styles.toggle}>
                                        <input
                                            type="checkbox"
                                            checked={displayOptions.showBulletPoints}
                                            onChange={handleDisplayOptionChange('showBulletPoints')}
                                        />
                                        <span>Bullet list</span>
                                    </label>
                                    <label className={styles.toggle}>
                                        <input
                                            type="checkbox"
                                            checked={displayOptions.showBadges}
                                            onChange={handleDisplayOptionChange('showBadges')}
                                        />
                                        <span>Stat badges</span>
                                    </label>
                                    <label className={styles.toggle}>
                                        <input
                                            type="checkbox"
                                            checked={displayOptions.showLink}
                                            onChange={handleDisplayOptionChange('showLink')}
                                        />
                                        <span>Deep link</span>
                                    </label>
                                </div>
                                <label className={styles.textField}>
                                    <span>Link label</span>
                                    <input
                                        type="text"
                                        value={footerLabel}
                                        onChange={handleFooterLabelChange}
                                        placeholder="Open in app"
                                        disabled={!displayOptions.showLink}
                                    />
                                </label>
                            </div>
                            <div className={styles.section}>
                                <div className={styles.sectionHeading}>
                                    <h3>Export</h3>
                                    <span>High-res PNG/WebP assets</span>
                                </div>
                                <div className={styles.buttonColumn}>
                                    <button type="button" onClick={handleCopyImage} disabled={isExporting}>
                                        {isExporting ? 'Preparing…' : 'Copy PNG to clipboard'}
                                    </button>
                                    <button type="button" onClick={handleDownloadPng} disabled={isExporting}>
                                        {isExporting ? 'Preparing…' : 'Download PNG'}
                                    </button>
                                    <button type="button" onClick={handleDownloadWebp} disabled={isExporting}>
                                        {isExporting ? 'Preparing…' : 'Download WebP'}
                                    </button>
                                </div>
                            </div>
                            {status && <div className={styles.status}>{status}</div>}
                        </section>
                    </div>
                </div>
            </div>
            <div className={styles.exportSurface} aria-hidden>
                <ShareCard
                    ref={exportCardRef}
                    card={card}
                    meta={meta}
                    slug={slug}
                    shortUrl={shortUrl}
                    footerLabel={footerLabel}
                    displayOptions={displayOptions}
                    scale={1}
                    height={cardHeight}
                    onHeightChange={handleCardHeightChange}
                />
            </div>
        </>
    );
};

export default ShareCardModal;
