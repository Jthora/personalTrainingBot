/**
 * QuizSurface — Mission flow surface for running quizzes.
 *
 * Reads quiz state from localStorage (set before navigation),
 * renders QuizRunner, and navigates back on completion.
 */

import React, { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import QuizRunner from '../../components/QuizRunner/QuizRunner';
import TrainingModuleCache from '../../cache/TrainingModuleCache';
import CardProgressStore from '../../store/CardProgressStore';
import { generateQuiz } from '../../utils/quizGenerator';
import type { Card } from '../../types/Card';
import styles from './MissionFlow.module.css';

const QuizSurface: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const deckId = searchParams.get('deck');
  const moduleId = searchParams.get('module');
  const mode = searchParams.get('mode'); // 'review' for SR-due cards

  const cache = TrainingModuleCache.getInstance();

  const { questions, sourceId, sourceType } = useMemo(() => {
    let cards: Card[] = [];
    let srcId = 'unknown';
    let srcType: 'deck' | 'module' | 'review' = 'module';

    if (mode === 'review') {
      // Quiz from SR-due cards across all modules
      const dueEntries = CardProgressStore.getCardsDueForReview();
      cards = dueEntries
        .map((entry) => cache.getCardById(entry.cardId))
        .filter((c): c is Card => !!c);
      srcId = 'due-review';
      srcType = 'review';
    } else if (deckId) {
      // Quiz from a specific deck
      const mod = moduleId ? cache.getTrainingModule(moduleId) : undefined;
      if (mod) {
        for (const sub of mod.submodules) {
          for (const deck of sub.cardDecks) {
            if (deck.id === deckId) {
              cards = deck.cards;
              break;
            }
          }
          if (cards.length > 0) break;
        }
      }
      srcId = deckId;
      srcType = 'deck';
    } else if (moduleId) {
      // Quiz from a module (mix of cards)
      const mod = cache.getTrainingModule(moduleId);
      if (mod) {
        for (const sub of mod.submodules) {
          for (const deck of sub.cardDecks) {
            cards.push(...deck.cards);
          }
        }
      }
      srcId = moduleId;
      srcType = 'module';
    }

    const generated = generateQuiz(cards, 10);
    return { questions: generated, sourceId: srcId, sourceType: srcType };
  }, [deckId, moduleId, mode, cache]);

  const handleComplete = () => {
    navigate('/mission/training');
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (questions.length === 0) {
    return (
      <section className={styles.surface} aria-label="Quiz">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2 className={styles.title}>No Questions Available</h2>
          <p className={styles.body}>
            Not enough card data to generate quiz questions.
            Try training some modules first to build up your card library.
          </p>
          <button
            type="button"
            onClick={() => navigate('/mission/training')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              background: 'var(--accent, #6c63ff)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              marginTop: '1rem',
            }}
          >
            Back to Training
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.surface} aria-label="Quiz">
      <QuizRunner
        questions={questions}
        sourceId={sourceId}
        sourceType={sourceType}
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </section>
  );
};

export default QuizSurface;
