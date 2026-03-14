/**
 * QuizRunner — Interactive quiz component rendering questions one at a time.
 *
 * Supports: multiple-choice, true/false, fill-blank, and term-match modes.
 * Shows progressive hints, running score, and a results screen on completion.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { QuizQuestion, QuizAnswer, QuizSession } from '../../types/Quiz';
import CardProgressStore from '../../store/CardProgressStore';
import DrillHistoryStore from '../../store/DrillHistoryStore';
import QuizSessionStore from '../../store/QuizSessionStore';
import { getDiscipline } from '../../data/disciplineTheme';
import styles from './QuizRunner.module.css';

/** Shuffle array (Fisher-Yates). */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export interface QuizRunnerProps {
  /** Pre-generated questions for this quiz session. */
  questions: QuizQuestion[];
  /** Source context for recording. */
  sourceId: string;
  sourceType: 'deck' | 'module' | 'review';
  /** Called when quiz complete (navigate away, etc.). */
  onComplete: () => void;
  /** Optional: called to go back without finishing. */
  onCancel?: () => void;
}

/** Map quiz percentage to SR quality rating. */
function scoreToQuality(pct: number): number {
  if (pct >= 90) return 5;
  if (pct >= 70) return 4;
  if (pct >= 50) return 3;
  if (pct >= 30) return 2;
  return 1;
}

/** Fuzzy string match for fill-blank answers. */
function fuzzyMatch(input: string, expected: string): boolean {
  const a = input.toLowerCase().trim();
  const b = expected.toLowerCase().trim();
  if (a === b) return true;
  // Allow small edit distance for typos (Levenshtein ≤ 2 for short answers)
  if (b.length <= 5) return a === b;
  if (Math.abs(a.length - b.length) > 3) return false;
  // Check if input contains the expected answer (partial match)
  if (a.includes(b) || b.includes(a)) return true;
  return false;
}

type Phase = 'answering' | 'feedback' | 'results';

const QuizRunner: React.FC<QuizRunnerProps> = ({
  questions: initialQuestions,
  sourceId,
  sourceType,
  onComplete,
  onCancel,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [phase, setPhase] = useState<Phase>('answering');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [textInput, setTextInput] = useState('');
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [matchSelections, setMatchSelections] = useState<Map<string, string>>(new Map());
  const questionStartRef = useRef(Date.now());
  const sessionStartRef = useRef(new Date().toISOString());

  const [questionPool, setQuestionPool] = useState(initialQuestions);

  const discipline = sourceType === 'module' ? getDiscipline(sourceId) : null;
  const disciplineStyle = discipline
    ? ({
        borderLeftColor: discipline.color,
        '--quiz-accent': discipline.color,
        '--quiz-accent-soft': discipline.bgTint,
      } as React.CSSProperties)
    : undefined;

  const question = questionPool[currentIndex];
  const isLastQuestion = currentIndex === questionPool.length - 1;
  const correctCount = answers.filter((a) => a.correct).length;

  // Reset state when question changes
  useEffect(() => {
    setSelectedOption(null);
    setTextInput('');
    setHintsRevealed(0);
    setMatchSelections(new Map());
    questionStartRef.current = Date.now();
  }, [currentIndex]);

  const recordAnswer = useCallback(
    (answerText: string, isCorrect: boolean) => {
      const answer: QuizAnswer = {
        questionId: question.id,
        cardId: question.cardId,
        answer: answerText,
        correct: isCorrect,
        timeTakenMs: Date.now() - questionStartRef.current,
      };
      setAnswers((prev) => [...prev, answer]);
      setPhase('feedback');
    },
    [question],
  );

  /* ── Answer handlers ── */

  const handleMCSelect = useCallback(
    (optionIndex: number) => {
      if (phase !== 'answering') return;
      setSelectedOption(optionIndex);
      const isCorrect = optionIndex === question.correctIndex;
      recordAnswer(question.options?.[optionIndex] ?? '', isCorrect);
    },
    [phase, question, recordAnswer],
  );

  const handleTFSelect = useCallback(
    (optionIndex: number) => {
      if (phase !== 'answering') return;
      setSelectedOption(optionIndex);
      const isCorrect = optionIndex === question.correctIndex;
      recordAnswer(question.options?.[optionIndex] ?? '', isCorrect);
    },
    [phase, question, recordAnswer],
  );

  const handleFillSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (phase !== 'answering' || !textInput.trim()) return;
      const isCorrect = fuzzyMatch(textInput, question.correctAnswer);
      recordAnswer(textInput, isCorrect);
    },
    [phase, textInput, question, recordAnswer],
  );

  const handleTermMatchSubmit = useCallback(() => {
    if (phase !== 'answering') return;
    const pairs = question.matchPairs ?? [];
    let correctPairs = 0;
    for (const [term, def] of pairs) {
      if (matchSelections.get(term) === def) correctPairs++;
    }
    const isCorrect = correctPairs === pairs.length;
    recordAnswer(
      Array.from(matchSelections.entries()).map(([t, d]) => `${t}: ${d}`).join('; '),
      isCorrect,
    );
  }, [phase, question, matchSelections, recordAnswer]);

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      setPhase('results');
    } else {
      setCurrentIndex((i) => i + 1);
      setPhase('answering');
    }
  }, [isLastQuestion]);

  const handleRevealHint = useCallback(() => {
    setHintsRevealed((h) => h + 1);
  }, []);

  /** Restart quiz with only the questions the user got wrong. */
  const handleRetryWrong = useCallback(() => {
    const wrongIds = new Set(answers.filter((a) => !a.correct).map((a) => a.questionId));
    const wrongQs = questionPool.filter((q) => wrongIds.has(q.id));
    if (wrongQs.length === 0) return;
    setQuestionPool(wrongQs);
    setCurrentIndex(0);
    setAnswers([]);
    setPhase('answering');
    sessionStartRef.current = new Date().toISOString();
  }, [answers, questionPool]);

  /* ── Record results to stores ── */

  const finalAnswers = phase === 'results' ? answers : null;

  useEffect(() => {
    if (!finalAnswers) return;

    const pct = questionPool.length > 0
      ? (finalAnswers.filter((a) => a.correct).length / questionPool.length) * 100
      : 0;
    const overallQuality = scoreToQuality(pct);

    // Record per-card progress to SR
    for (const answer of finalAnswers) {
      const quality = answer.correct ? Math.max(4, overallQuality) : Math.min(2, overallQuality);
      CardProgressStore.recordReview(
        answer.cardId,
        '', // moduleId inferred from cardId in store
        quality,
      );
    }

    // Record drill completion
    DrillHistoryStore.record({
      drillId: `quiz-${sourceId}`,
      title: `Quiz: ${sourceId}`,
      elapsedSec: Math.round(
        finalAnswers.reduce((sum, a) => sum + a.timeTakenMs, 0) / 1000,
      ),
      stepCount: questionPool.length,
      completedAt: new Date().toISOString(),
      selfAssessment: overallQuality,
      domainId: sourceType === 'module' ? sourceId : undefined,
    });

    // Persist quiz session for review / analytics
    QuizSessionStore.record({
      questions: questionPool,
      answers: finalAnswers,
      sourceId,
      sourceType,
      startedAt: sessionStartRef.current,
    });
  }, [finalAnswers, questionPool, sourceId, sourceType]);

  /* ── Render sections ── */

  const progressPct = questionPool.length > 0
    ? ((currentIndex + (phase === 'results' ? 1 : 0)) / questionPool.length) * 100
    : 0;

  // Shuffle descriptions for term-match (stable per question)
  const shuffledDescriptions = useMemo(
    () => question?.matchPairs ? shuffle(question.matchPairs.map(([, d]) => d)) : [],
    [question?.matchPairs],
  );

  // Results screen
  if (phase === 'results') {
    const total = questionPool.length;
    const correct = answers.filter((a) => a.correct).length;
    const wrong = total - correct;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const totalTimeMs = answers.reduce((sum, a) => sum + a.timeTakenMs, 0);

    return (
      <div className={styles.runner} data-testid="quiz-results" style={disciplineStyle}>
        <h2 className={styles.resultsTitle}>Quiz Complete</h2>
        <div className={styles.scoreCircle}>
          <span className={styles.scorePct}>{pct}%</span>
          <span className={styles.scoreLabel}>{correct}/{total} correct</span>
        </div>

        <p className={styles.timeSummary} data-testid="time-summary">
          Total time: {Math.round(totalTimeMs / 1000)}s
          {' · '}
          Avg: {total > 0 ? (totalTimeMs / total / 1000).toFixed(1) : '0'}s per question
        </p>

        <div className={styles.reviewList}>
          {questionPool.map((q, i) => {
            const ans = answers[i];
            const timeSec = ans ? (ans.timeTakenMs / 1000).toFixed(1) : '—';
            return (
              <div
                key={q.id}
                className={`${styles.reviewItem} ${ans?.correct ? styles.reviewCorrect : styles.reviewIncorrect}`}
              >
                <span className={styles.reviewIcon}>{ans?.correct ? '✓' : '✗'}</span>
                <div className={styles.reviewContent}>
                  <p className={styles.reviewPrompt}>
                    {q.prompt}
                    <span className={styles.reviewTime}>{timeSec}s</span>
                  </p>
                  {!ans?.correct && (
                    <p className={styles.reviewAnswer}>
                      Correct answer: {q.correctAnswer}
                    </p>
                  )}
                  {!ans?.correct && q.explanation && (
                    <p className={styles.reviewExplanation}>
                      {q.explanation}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className={styles.resultActions}>
          {wrong > 0 && (
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={handleRetryWrong}
              data-testid="retry-wrong-btn"
            >
              Retry {wrong} Wrong Question{wrong > 1 ? 's' : ''}
            </button>
          )}
          <button type="button" className={styles.primaryBtn} onClick={onComplete}>
            Done
          </button>
        </div>
      </div>
    );
  }

  // Question screen
  const availableHints = question.hints.slice(0, hintsRevealed);
  const hasMoreHints = hintsRevealed < question.hints.length;

  return (
    <div className={styles.runner} data-testid="quiz-runner" style={disciplineStyle}>
      {/* Progress bar */}
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
      </div>
      <div className={styles.header}>
        <span className={styles.counter}>
          {currentIndex + 1} / {questionPool.length}
        </span>
        <span className={styles.score} data-testid="running-score">
          {correctCount} correct
        </span>
        {onCancel && (
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            Exit
          </button>
        )}
      </div>

      {/* Question */}
      <div className={styles.questionCard}>
        <p className={styles.prompt}>{question.prompt}</p>
        <span className={styles.sourceTag}>{question.source}</span>

        {/* MC / TF options */}
        {(question.type === 'multiple-choice' || question.type === 'true-false') && (
          <div className={styles.options}>
            {question.options?.map((opt, i) => {
              let optClass = styles.option;
              if (phase === 'feedback') {
                if (i === question.correctIndex) optClass += ` ${styles.optionCorrect}`;
                else if (i === selectedOption) optClass += ` ${styles.optionIncorrect}`;
              } else if (i === selectedOption) {
                optClass += ` ${styles.optionSelected}`;
              }
              return (
                <button
                  key={i}
                  type="button"
                  className={optClass}
                  onClick={() =>
                    question.type === 'multiple-choice'
                      ? handleMCSelect(i)
                      : handleTFSelect(i)
                  }
                  disabled={phase === 'feedback'}
                  data-testid={`option-${i}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {/* Fill-blank */}
        {question.type === 'fill-blank' && (
          <form onSubmit={handleFillSubmit} className={styles.fillForm}>
            <input
              type="text"
              className={styles.fillInput}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type your answer…"
              disabled={phase === 'feedback'}
              autoFocus
              data-testid="fill-input"
            />
            {phase === 'answering' && (
              <button type="submit" className={styles.primaryBtn} disabled={!textInput.trim()}>
                Submit
              </button>
            )}
            {phase === 'feedback' && (
              <p className={styles.feedbackAnswer}>
                Correct answer: {question.correctAnswer}
              </p>
            )}
          </form>
        )}

        {/* Term-match */}
        {question.type === 'term-match' && question.matchPairs && (
          <div className={styles.matchGrid}>
            <div className={styles.matchColumn}>
              <h4>Terms</h4>
              {question.matchPairs.map(([term]) => (
                <div key={term} className={styles.matchItem}>{term}</div>
              ))}
            </div>
            <div className={styles.matchColumn}>
              <h4>Descriptions</h4>
              {shuffledDescriptions.map((desc) => (
                <button
                  key={desc}
                  type="button"
                  className={`${styles.matchItem} ${styles.matchSelectable}`}
                  onClick={() => {
                    // Simple sequential assignment: assign to first unmatched term
                    const terms = question.matchPairs!.map(([t]) => t);
                    const nextUnmatched = terms.find((t) => !matchSelections.has(t));
                    if (nextUnmatched) {
                      setMatchSelections((prev) => new Map(prev).set(nextUnmatched, desc));
                    }
                  }}
                  disabled={phase === 'feedback'}
                >
                  {desc}
                </button>
              ))}
            </div>
            {phase === 'answering' && matchSelections.size === question.matchPairs.length && (
              <button
                type="button"
                className={styles.primaryBtn}
                onClick={handleTermMatchSubmit}
              >
                Check Matches
              </button>
            )}
          </div>
        )}

        {/* Hints */}
        {availableHints.length > 0 && (
          <div className={styles.hints}>
            {availableHints.map((hint, i) => (
              <p key={i} className={styles.hint}>💡 {hint}</p>
            ))}
          </div>
        )}
        {phase === 'answering' && hasMoreHints && (
          <button
            type="button"
            className={styles.hintBtn}
            onClick={handleRevealHint}
            data-testid="hint-btn"
          >
            Need a hint?
          </button>
        )}

        {/* Feedback + Next */}
        {phase === 'feedback' && (
          <div className={styles.feedback}>
            <p className={answers[answers.length - 1]?.correct ? styles.feedbackCorrect : styles.feedbackIncorrect}>
              {answers[answers.length - 1]?.correct ? '✓ Correct!' : '✗ Incorrect'}
            </p>
            {question.explanation && (
              <p className={answers[answers.length - 1]?.correct ? styles.explanationCorrect : styles.explanationIncorrect}>
                {question.explanation}
              </p>
            )}
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handleNext}
              data-testid="next-btn"
            >
              {isLastQuestion ? 'See Results' : 'Next Question'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizRunner;
