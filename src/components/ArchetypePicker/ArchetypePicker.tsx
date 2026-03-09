import React, { useState } from 'react';
import styles from './ArchetypePicker.module.css';
import { getArchetypeCatalog } from '../../data/archetypes';
import type { ArchetypeDefinition } from '../../data/archetypes';
import { trackEvent } from '../../utils/telemetry';

export type ArchetypePickerProps = {
    /** Currently selected archetype id (if resuming an existing profile). */
    initialArchetypeId?: string;
    /** Called when the user confirms their archetype selection. */
    onSelect: (archetype: ArchetypeDefinition) => void;
    /** Called when the user wants to skip / dismiss the picker. */
    onSkip?: () => void;
};

const ArchetypePicker: React.FC<ArchetypePickerProps> = ({
    initialArchetypeId,
    onSelect,
    onSkip,
}) => {
    const catalog = getArchetypeCatalog();
    const [selectedId, setSelectedId] = useState<string | null>(initialArchetypeId ?? null);

    const handleCardClick = (archetype: ArchetypeDefinition) => {
        setSelectedId(archetype.id);
        trackEvent({
            category: 'ia',
            action: 'tab_view',
            route: '/mission/brief',
            data: {
                kind: 'archetype_card_tap',
                archetypeId: archetype.id,
            },
            source: 'ui',
        });
    };

    const handleConfirm = () => {
        const archetype = catalog.find((a) => a.id === selectedId);
        if (!archetype) return;
        trackEvent({
            category: 'ia',
            action: 'tab_view',
            route: '/mission/brief',
            data: {
                kind: 'archetype_confirmed',
                archetypeId: archetype.id,
            },
            source: 'ui',
        });
        onSelect(archetype);
    };

    return (
        <section className={styles.panel} aria-label="Choose your operative archetype" data-testid="archetype-picker">
            <p className={styles.eyebrow}>Archangel Knights Intake</p>
            <h2 className={styles.title}>Choose Your Archetype</h2>
            <p className={styles.subtitle}>
                Your archetype determines your core training modules, recommended handler, and milestone progression path. You can change this later.
            </p>

            <div className={styles.grid} role="radiogroup" aria-label="Archetype options">
                {catalog.map((archetype) => {
                    const isSelected = selectedId === archetype.id;
                    return (
                        <div
                            key={archetype.id}
                            role="radio"
                            aria-checked={isSelected}
                            tabIndex={0}
                            className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
                            onClick={() => handleCardClick(archetype)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleCardClick(archetype);
                                }
                            }}
                            data-testid={`archetype-card-${archetype.id}`}
                        >
                            {isSelected && <span className={styles.checkMark} aria-hidden="true">✓</span>}
                            <span className={styles.cardIcon} aria-hidden="true">{archetype.icon}</span>
                            <h3 className={styles.cardName}>{archetype.name}</h3>
                            <p className={styles.cardDesc}>{archetype.description}</p>
                            <div className={styles.cardModules}>
                                {archetype.coreModules.map((m) => (
                                    <span key={m} className={styles.moduleBadge}>{m.replace(/_/g, ' ')}</span>
                                ))}
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
                    data-testid="archetype-confirm"
                >
                    Confirm Archetype
                </button>
                {onSkip && (
                    <button
                        type="button"
                        className={styles.secondary}
                        onClick={onSkip}
                        data-testid="archetype-skip"
                    >
                        Skip for now
                    </button>
                )}
            </div>
        </section>
    );
};

export default ArchetypePicker;
