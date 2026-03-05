import React, { useCallback, useEffect, useMemo, useState } from 'react';
import MissionEntityStore from '../../domain/mission/MissionEntityStore';
import type { MissionSeverity } from '../../domain/mission/types';
import styles from './TriageBoard.module.css';
import {
  readTriagePreferences,
  writeTriagePreferences,
  type TriageDensityMode,
  type TriageViewMode,
} from '../../store/missionFlow/triagePreferences';
import {
  applyTriageAction,
  buildColumns,
  resolveShortcutAction,
  severityRank,
  type TriageCard,
  type TriageColumn,
} from './model';
import { useMissionRenderProbe } from '../../utils/missionRenderProfile';

const severityClass: Record<MissionSeverity, string> = {
  low: styles.severityLow,
  medium: styles.severityMedium,
  high: styles.severityHigh,
  critical: styles.severityCritical,
};

const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName.toLowerCase();
  if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') return true;
  return Boolean(target.closest('[contenteditable="true"]'));
};

type TriageCardItemProps = {
  card: TriageCard;
  isSelected: boolean;
  showLane: boolean;
  onSelect: (cardId: string) => void;
};

const TriageCardItem: React.FC<TriageCardItemProps> = React.memo(({ card, isSelected, showLane, onSelect }) => (
  <li className={styles.card} data-selected={isSelected}>
    <button
      type="button"
      className={styles.cardButton}
      onClick={() => onSelect(card.id)}
      onFocus={() => onSelect(card.id)}
      aria-pressed={isSelected}
      aria-label={`${card.lane} ${card.title}`}
    >
      <p className={styles.cardTitle}>{card.title}</p>
      <p className={styles.cardBody}>{card.body}</p>
      <div className={styles.badges}>
        {showLane ? <span className={`${styles.badge} ${styles.lane}`}>{card.lane}</span> : null}
        <span className={`${styles.badge} ${severityClass[card.severity]}`}>{card.severity.toUpperCase()}</span>
        <span className={`${styles.badge} ${styles.status}`}>{card.status}</span>
      </div>
    </button>
  </li>
));

TriageCardItem.displayName = 'TriageCardItem';

const TriageBoard: React.FC = () => {
  useMissionRenderProbe('mission:triage:board');
  const collection = MissionEntityStore.getInstance().getCanonicalCollection();
  const columns = useMemo(() => buildColumns(collection), [collection]);
  const [viewMode, setViewMode] = useState<TriageViewMode>(() => readTriagePreferences().view);
  const [densityMode, setDensityMode] = useState<TriageDensityMode>(() => readTriagePreferences().density);
  const [overrides, setOverrides] = useState<Record<string, Pick<TriageCard, 'severity' | 'status'>>>({});
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string>('Keyboard shortcuts: A=Ack, E=Escalate, D=Defer, R=Resolve');

  useEffect(() => {
    writeTriagePreferences({ view: viewMode, density: densityMode });
  }, [viewMode, densityMode]);

  const hydratedColumns: TriageColumn[] = useMemo(
    () => columns.map((column) => ({
      ...column,
      cards: column.cards.map((card) => {
        const override = overrides[card.id];
        if (!override) return card;
        return {
          ...card,
          ...override,
        };
      }),
    })),
    [columns, overrides],
  );

  const allCards = useMemo(() => hydratedColumns.flatMap((column) => column.cards), [hydratedColumns]);

  const cardsById = useMemo(
    () => new Map(allCards.map((card) => [card.id, card] as const)),
    [allCards],
  );

  const feedCards = useMemo(
    () => [...allCards].sort((a, b) => severityRank[a.severity] - severityRank[b.severity]),
    [allCards],
  );

  useEffect(() => {
    if (selectedCardId) {
      const exists = hydratedColumns.some((column) => column.cards.some((card) => card.id === selectedCardId));
      if (!exists) setSelectedCardId(null);
      return;
    }

    const firstCard = allCards[0];
    if (firstCard) {
      setSelectedCardId(firstCard.id);
    }
  }, [allCards, hydratedColumns, selectedCardId]);

  const handleSelectCard = useCallback((cardId: string) => {
    setSelectedCardId(cardId);
  }, []);

  const handleBoardKeyDown = useCallback((event: React.KeyboardEvent<HTMLElement>) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (isEditableTarget(event.target)) return;

    const action = resolveShortcutAction(event.key);
    if (!action || !selectedCardId) return;

    const selectedCard = cardsById.get(selectedCardId);

    if (!selectedCard) return;
    event.preventDefault();

    const next = applyTriageAction(selectedCard, action);
    setOverrides((previous) => ({
      ...previous,
      [selectedCard.id]: {
        severity: next.severity,
        status: next.status,
      },
    }));

    setActionMessage(`${selectedCard.title}: ${next.status} · ${next.severity.toUpperCase()}`);
  }, [cardsById, selectedCardId]);

  if (columns.length === 0) return null;

  return (
    <section
      className={`${styles.board} ${densityMode === 'compact' ? styles.boardCompact : ''}`}
      aria-label="Triage board"
      onKeyDown={handleBoardKeyDown}
    >
      <div className={styles.controls}>
        <div className={styles.toggleGroup} role="group" aria-label="Triage view mode">
          <button
            type="button"
            className={`${styles.toggleButton} ${viewMode === 'columns' ? styles.toggleActive : ''}`}
            onClick={() => setViewMode('columns')}
            aria-pressed={viewMode === 'columns'}
          >
            Columns
          </button>
          <button
            type="button"
            className={`${styles.toggleButton} ${viewMode === 'feed' ? styles.toggleActive : ''}`}
            onClick={() => setViewMode('feed')}
            aria-pressed={viewMode === 'feed'}
          >
            Feed
          </button>
        </div>

        <div className={styles.toggleGroup} role="group" aria-label="Triage density mode">
          <button
            type="button"
            className={`${styles.toggleButton} ${densityMode === 'cozy' ? styles.toggleActive : ''}`}
            onClick={() => setDensityMode('cozy')}
            aria-pressed={densityMode === 'cozy'}
          >
            Cozy
          </button>
          <button
            type="button"
            className={`${styles.toggleButton} ${densityMode === 'compact' ? styles.toggleActive : ''}`}
            onClick={() => setDensityMode('compact')}
            aria-pressed={densityMode === 'compact'}
          >
            Compact
          </button>
        </div>
      </div>

      <p className={styles.shortcutsHint} aria-live="polite">{actionMessage}</p>

      {viewMode === 'columns' ? (
        <div className={styles.grid}>
          {hydratedColumns.map((column) => (
            <article key={column.id} className={styles.column} aria-label={column.title}>
              <h3 className={styles.columnTitle}>{column.title}</h3>

              {column.cards.length === 0 ? (
                <p className={styles.empty}>No items in this column.</p>
              ) : (
                <ul className={styles.list}>
                  {column.cards.map((card) => (
                    <TriageCardItem
                      key={card.id}
                      card={card}
                      isSelected={selectedCardId === card.id}
                      showLane={false}
                      onSelect={handleSelectCard}
                    />
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      ) : (
        <ul className={styles.feedList} aria-label="Triage feed">
          {feedCards.length === 0 ? (
            <li className={styles.card}><p className={styles.empty}>No triage items available.</p></li>
          ) : (
            feedCards.map((card) => (
              <TriageCardItem
                key={card.id}
                card={card}
                isSelected={selectedCardId === card.id}
                showLane
                onSelect={handleSelectCard}
              />
            ))
          )}
        </ul>
      )}
    </section>
  );
};

export default TriageBoard;