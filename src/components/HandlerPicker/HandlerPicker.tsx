import React, { useState } from 'react';
import styles from './HandlerPicker.module.css';
import { handlers } from '../../data/handlers';
import type { Handler } from '../../data/handlers';
import { trackEvent } from '../../utils/telemetry';

export type HandlerPickerProps = {
    /** The handler recommended by the selected archetype. Shows a badge. */
    recommendedHandlerId?: string;
    /** Currently selected handler id (if resuming). */
    initialHandlerId?: string;
    /** Called when the user confirms their handler selection. */
    onSelect: (handler: Handler) => void;
    /** Called when the user wants to go back to archetype selection. */
    onBack?: () => void;
};

const HandlerPicker: React.FC<HandlerPickerProps> = ({
    recommendedHandlerId,
    initialHandlerId,
    onSelect,
    onBack,
}) => {
    const [selectedId, setSelectedId] = useState<string | null>(
        initialHandlerId ?? recommendedHandlerId ?? null,
    );

    const handleCardClick = (handler: Handler) => {
        setSelectedId(handler.id);
        trackEvent({
            category: 'ia',
            action: 'tab_view',
            route: '/mission/brief',
            data: {
                kind: 'handler_card_tap',
                handlerId: handler.id,
                isRecommended: handler.id === recommendedHandlerId,
            },
            source: 'ui',
        });
    };

    const handleConfirm = () => {
        const handler = handlers.find((h) => h.id === selectedId);
        if (!handler) return;
        trackEvent({
            category: 'ia',
            action: 'tab_view',
            route: '/mission/brief',
            data: {
                kind: 'handler_confirmed',
                handlerId: handler.id,
                isRecommended: handler.id === recommendedHandlerId,
            },
            source: 'ui',
        });
        onSelect(handler);
    };

    // Sort: recommended handler first
    const sorted = recommendedHandlerId
        ? [...handlers].sort((a, b) => {
              if (a.id === recommendedHandlerId) return -1;
              if (b.id === recommendedHandlerId) return 1;
              return 0;
          })
        : handlers;

    return (
        <section className={styles.panel} aria-label="Choose your handler" data-testid="handler-picker">
            <p className={styles.eyebrow}>Archangel Knights Intake</p>
            <h2 className={styles.title}>Choose Your Handler</h2>
            <p className={styles.subtitle}>
                Your handler shapes mission personality, SOP tone, and training style. The recommended handler is matched to your archetype.
            </p>

            <div className={styles.grid} role="radiogroup" aria-label="Handler options">
                {sorted.map((handler) => {
                    const isSelected = selectedId === handler.id;
                    const isRecommended = handler.id === recommendedHandlerId;
                    return (
                        <div
                            key={handler.id}
                            role="radio"
                            aria-checked={isSelected}
                            tabIndex={0}
                            className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
                            onClick={() => handleCardClick(handler)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleCardClick(handler);
                                }
                            }}
                            data-testid={`handler-card-${handler.id}`}
                        >
                            {isSelected && <span className={styles.checkMark} aria-hidden="true">✓</span>}
                            <img
                                src={handler.icon}
                                alt=""
                                className={styles.handlerIcon}
                                loading="lazy"
                            />
                            <div className={styles.cardBody}>
                                <h3 className={styles.cardName}>
                                    {handler.name}
                                    {isRecommended && (
                                        <span className={styles.recommendedBadge} data-testid="recommended-badge">
                                            Recommended
                                        </span>
                                    )}
                                </h3>
                                <p className={styles.cardPersonality}>{handler.personality}</p>
                                <p className={styles.cardDesc}>{handler.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className={styles.actions}>
                <button
                    type="button"
                    className={styles.primary}
                    disabled={!selectedId}
                    onClick={handleConfirm}
                    data-testid="handler-confirm"
                >
                    Confirm Handler
                </button>
                {onBack && (
                    <button
                        type="button"
                        className={styles.secondary}
                        onClick={onBack}
                        data-testid="handler-back"
                    >
                        Back to Archetype
                    </button>
                )}
            </div>
        </section>
    );
};

export default HandlerPicker;
