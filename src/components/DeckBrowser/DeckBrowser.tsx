/**
 * DeckBrowser — Shows submodules and decks for a selected training module.
 *
 * Renders card previews within each deck, a "Train this deck" launcher,
 * deck selection toggles, and breadcrumb navigation back to the module grid.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TrainingModuleCache from '../../cache/TrainingModuleCache';
import CardProgressStore from '../../store/CardProgressStore';
import { isDue } from '../../utils/srScheduler';
import { DrillRunStore } from '../../store/DrillRunStore';
import { buildDrillStepsFromDeck, buildDrillStepsFromModule } from '../../utils/drillStepBuilder';
import { DOMAIN_CATALOG } from '../../utils/readiness/domainProgress';
import type { TrainingModule } from '../../types/TrainingModule';
import type { CardDeck } from '../../types/CardDeck';
import type { Card } from '../../types/Card';
import styles from '../ModuleBrowser/ModuleBrowser.module.css';

export interface DeckBrowserProps {
  moduleId: string;
  /** Navigate back to module grid. */
  onBack: () => void;
  /** Navigate to checklist after starting a drill. */
  onDrillStarted: () => void;
}

const MAX_CARD_PREVIEWS = 5;
const DEFAULT_MODULE_CARDS = 10;

const DeckBrowser: React.FC<DeckBrowserProps> = ({ moduleId, onBack, onDrillStarted }) => {
  const cache = TrainingModuleCache.getInstance();
  const navigate = useNavigate();
  const mod: TrainingModule | undefined = cache.getTrainingModule(moduleId);
  const domainEntry = DOMAIN_CATALOG.find((d) => d.id === moduleId);
  const moduleName = domainEntry?.name ?? moduleId;

  // Re-render on selection changes
  const [, setTick] = useState(0);
  useEffect(() => {
    const unsub = cache.subscribeToSelectionChanges(() => setTick((t) => t + 1));
    return unsub;
  }, [cache]);

  const handleTrainDeck = useCallback(
    (deckId: string, deckName: string) => {
      const steps = buildDrillStepsFromDeck(deckId);
      if (steps.length === 0) return;
      DrillRunStore.start(`deck-${deckId}`, deckName, steps);
      onDrillStarted();
    },
    [onDrillStarted],
  );

  const handleTrainModule = useCallback(() => {
    const steps = buildDrillStepsFromModule(moduleId, DEFAULT_MODULE_CARDS);
    if (steps.length === 0) return;
    DrillRunStore.start(`module-${moduleId}`, moduleName, steps);
    onDrillStarted();
  }, [moduleId, moduleName, onDrillStarted]);

  const handleToggleDeck = useCallback(
    (e: React.MouseEvent, deckId: string) => {
      e.stopPropagation();
      cache.toggleCardDeckSelection(deckId);
    },
    [cache],
  );

  if (!mod) {
    return (
      <div className={styles.empty}>
        <div className={styles.breadcrumb}>
          <span className={styles.breadcrumbLink} onClick={onBack} role="button" tabIndex={0}>
            Training
          </span>
          <span className={styles.breadcrumbSep}>/</span>
          <span>{moduleName}</span>
        </div>
        <p>Module not loaded yet. Training data may still be downloading.</p>
      </div>
    );
  }

  return (
    <div className={styles.browser} data-testid="deck-browser">
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <span
          className={styles.breadcrumbLink}
          onClick={onBack}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onBack()}
        >
          Training
        </span>
        <span className={styles.breadcrumbSep}>/</span>
        <span>{moduleName}</span>
      </div>

      {/* Module-level train button */}
      <div className={styles.deckActions}>
        <button className={styles.trainBtn} onClick={handleTrainModule} data-testid="train-module-btn">
          Train {moduleName} ({DEFAULT_MODULE_CARDS} cards)
        </button>
        <button
          className={styles.trainBtnSecondary}
          onClick={() => navigate(`/mission/quiz?module=${moduleId}`)}
          data-testid="quiz-module-btn"
        >
          Quiz {moduleName}
        </button>
      </div>

      {/* Submodules → Decks */}
      {mod.submodules.map((sub) => (
        <div key={sub.id}>
          <h3 style={{ margin: '0.75rem 0 0.4rem', fontSize: '0.9rem', color: 'var(--text-secondary, #aaa)' }}>
            {sub.name}
          </h3>
          <div className={styles.deckList}>
            {sub.cardDecks.map((deck: CardDeck) => {
              const isDeckSelected = cache.isCardDeckSelected(deck.id);
              const previewCards: Card[] = deck.cards.slice(0, MAX_CARD_PREVIEWS);
              const exerciseCount = deck.cards.reduce(
                (n, c) => n + (c.exercises && c.exercises.length > 0 ? 1 : 0),
                0,
              );
              const now = Date.now();
              const deckDueCount = deck.cards.filter((c) => {
                const p = CardProgressStore.getCardProgress(c.id);
                return p && isDue(p.nextReviewAt, now);
              }).length;

              return (
                <div key={deck.id} className={styles.deckCard} data-testid={`deck-card-${deck.id}`}>
                  <div className={styles.deckHeader}>
                    <span className={styles.deckName}>{deck.name}</span>
                    <span
                      className={styles.selectionToggle}
                      onClick={(e) => handleToggleDeck(e, deck.id)}
                    >
                      <input
                        type="checkbox"
                        checked={isDeckSelected}
                        onChange={() => {}}
                        aria-label={`Select ${deck.name}`}
                        tabIndex={-1}
                      />
                    </span>
                  </div>

                  <div className={styles.deckMeta}>
                    <span>{deck.cards.length} cards</span>
                    {exerciseCount > 0 && <span>{exerciseCount} with exercises</span>}
                    {deckDueCount > 0 && <span>{deckDueCount} due for review</span>}
                    {deck.focus && <span>{deck.focus}</span>}
                  </div>

                  {deck.description && (
                    <div className={styles.deckDescription}>{deck.description}</div>
                  )}

                  {/* Card previews */}
                  {previewCards.map((card) => (
                    <div key={card.id} className={styles.cardPreview}>
                      <span className={styles.cardTitle}>{card.title}</span>
                      <span className={styles.badge}>{card.difficulty}</span>
                      {card.exercises && card.exercises.length > 0 && (
                        <span className={styles.badge}>{card.exercises.length} ex</span>
                      )}
                      {card.learningObjectives && card.learningObjectives.length > 0 && (
                        <span className={styles.badge}>{card.learningObjectives[0].slice(0, 40)}…</span>
                      )}
                    </div>
                  ))}
                  {deck.cards.length > MAX_CARD_PREVIEWS && (
                    <div className={styles.cardPreview} style={{ fontStyle: 'italic' }}>
                      +{deck.cards.length - MAX_CARD_PREVIEWS} more cards
                    </div>
                  )}

                  <div className={styles.deckActions}>
                    <button
                      className={styles.trainBtn}
                      onClick={() => handleTrainDeck(deck.id, deck.name)}
                      data-testid={`train-deck-${deck.id}`}
                    >
                      Train this deck
                    </button>
                    <button
                      className={styles.trainBtnSecondary}
                      onClick={() => navigate(`/mission/quiz?deck=${deck.id}&module=${moduleId}`)}
                      data-testid={`quiz-deck-${deck.id}`}
                    >
                      Quiz this deck
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default DeckBrowser;
