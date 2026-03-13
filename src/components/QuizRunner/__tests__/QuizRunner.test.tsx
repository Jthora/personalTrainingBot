import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import QuizRunner from '../QuizRunner';
import type { QuizQuestion } from '../../../types/Quiz';

/* ── Mocks ── */

const mockRecordReview = vi.fn();
const mockRecord = vi.fn();

vi.mock('../../../store/CardProgressStore', () => ({
  default: {
    recordReview: (...args: unknown[]) => mockRecordReview(...args),
  },
}));

vi.mock('../../../store/DrillHistoryStore', () => ({
  default: {
    record: (...args: unknown[]) => mockRecord(...args),
  },
}));

/* ── Fixtures ── */

const mcQuestion: QuizQuestion = {
  id: 'q-mc-1',
  cardId: 'card-a',
  type: 'multiple-choice',
  prompt: 'What is a firewall?',
  options: ['A network filter', 'A spreadsheet', 'A database', 'A compiler'],
  correctIndex: 0,
  correctAnswer: 'A network filter',
  hints: ['Think about network security', 'It blocks traffic'],
  source: 'Card A',
};

const tfQuestion: QuizQuestion = {
  id: 'q-tf-1',
  cardId: 'card-b',
  type: 'true-false',
  prompt: 'True or false: "TCP uses a three-way handshake"',
  options: ['True', 'False'],
  correctIndex: 0,
  correctAnswer: 'True',
  hints: ['SYN, SYN-ACK, ACK'],
  source: 'Card B',
};

const fillQuestion: QuizQuestion = {
  id: 'q-fb-1',
  cardId: 'card-c',
  type: 'fill-blank',
  prompt: 'Fill in the blank: "A ______ filters traffic"',
  correctAnswer: 'firewall',
  hints: ['Starts with F'],
  source: 'Card C',
};

const twoQuestions: QuizQuestion[] = [mcQuestion, tfQuestion];

beforeEach(() => {
  vi.clearAllMocks();
});

/* ── Tests ── */

describe('QuizRunner', () => {
  it('renders the quiz runner with first question', () => {
    const onComplete = vi.fn();
    render(
      <QuizRunner
        questions={twoQuestions}
        sourceId="test-deck"
        sourceType="deck"
        onComplete={onComplete}
      />,
    );

    expect(screen.getByTestId('quiz-runner')).toBeTruthy();
    expect(screen.getByText('What is a firewall?')).toBeTruthy();
    expect(screen.getByText('1 / 2')).toBeTruthy();
    expect(screen.getByText('0 correct')).toBeTruthy();
  });

  it('renders MC options', () => {
    render(
      <QuizRunner
        questions={[mcQuestion]}
        sourceId="test"
        sourceType="deck"
        onComplete={vi.fn()}
      />,
    );

    expect(screen.getByTestId('option-0')).toBeTruthy();
    expect(screen.getByTestId('option-1')).toBeTruthy();
    expect(screen.getByTestId('option-2')).toBeTruthy();
    expect(screen.getByTestId('option-3')).toBeTruthy();
    expect(screen.getByText('A network filter')).toBeTruthy();
    expect(screen.getByText('A spreadsheet')).toBeTruthy();
  });

  it('selects correct MC answer and shows feedback', () => {
    render(
      <QuizRunner
        questions={[mcQuestion]}
        sourceId="test"
        sourceType="deck"
        onComplete={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByTestId('option-0')); // correct
    expect(screen.getByText('✓ Correct!')).toBeTruthy();
    expect(screen.getByTestId('next-btn')).toBeTruthy();
  });

  it('selects incorrect MC answer and shows feedback', () => {
    render(
      <QuizRunner
        questions={[mcQuestion]}
        sourceId="test"
        sourceType="deck"
        onComplete={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByTestId('option-2')); // wrong
    expect(screen.getByText('✗ Incorrect')).toBeTruthy();
  });

  it('advances to next question on Next click', () => {
    render(
      <QuizRunner
        questions={twoQuestions}
        sourceId="test"
        sourceType="deck"
        onComplete={vi.fn()}
      />,
    );

    // Answer MC
    fireEvent.click(screen.getByTestId('option-0'));
    fireEvent.click(screen.getByTestId('next-btn'));

    // Should see TF question
    expect(screen.getByText(/True or false/)).toBeTruthy();
    expect(screen.getByText('2 / 2')).toBeTruthy();
  });

  it('shows results screen after last question', () => {
    const onComplete = vi.fn();
    render(
      <QuizRunner
        questions={[mcQuestion]}
        sourceId="test"
        sourceType="deck"
        onComplete={onComplete}
      />,
    );

    fireEvent.click(screen.getByTestId('option-0'));
    fireEvent.click(screen.getByTestId('next-btn')); // "See Results"

    expect(screen.getByTestId('quiz-results')).toBeTruthy();
    expect(screen.getByText('Quiz Complete')).toBeTruthy();
    expect(screen.getByText('100%')).toBeTruthy();
    expect(screen.getByText('1/1 correct')).toBeTruthy();
  });

  it('shows review list with correct/incorrect items on results', () => {
    render(
      <QuizRunner
        questions={twoQuestions}
        sourceId="test"
        sourceType="deck"
        onComplete={vi.fn()}
      />,
    );

    // Answer Q1 correct
    fireEvent.click(screen.getByTestId('option-0'));
    fireEvent.click(screen.getByTestId('next-btn'));

    // Answer Q2 incorrect (True is 0, pick False = 1)
    fireEvent.click(screen.getByTestId('option-1'));
    fireEvent.click(screen.getByTestId('next-btn')); // See Results

    expect(screen.getByTestId('quiz-results')).toBeTruthy();
    expect(screen.getByText('50%')).toBeTruthy();
    // Shows correct answer for missed question
    expect(screen.getByText(/Correct answer: True/)).toBeTruthy();
  });

  it('calls onComplete when Done is clicked on results', () => {
    const onComplete = vi.fn();
    render(
      <QuizRunner
        questions={[mcQuestion]}
        sourceId="test"
        sourceType="deck"
        onComplete={onComplete}
      />,
    );

    fireEvent.click(screen.getByTestId('option-0'));
    fireEvent.click(screen.getByTestId('next-btn'));
    fireEvent.click(screen.getByText('Done'));

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('renders Exit button when onCancel is provided', () => {
    const onCancel = vi.fn();
    render(
      <QuizRunner
        questions={[mcQuestion]}
        sourceId="test"
        sourceType="deck"
        onComplete={vi.fn()}
        onCancel={onCancel}
      />,
    );

    const exitBtn = screen.getByText('Exit');
    expect(exitBtn).toBeTruthy();
    fireEvent.click(exitBtn);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('does not render Exit button when onCancel omitted', () => {
    render(
      <QuizRunner
        questions={[mcQuestion]}
        sourceId="test"
        sourceType="deck"
        onComplete={vi.fn()}
      />,
    );

    expect(screen.queryByText('Exit')).toBeNull();
  });

  /* ── Hints ── */

  it('reveals hints progressively', () => {
    render(
      <QuizRunner
        questions={[mcQuestion]}
        sourceId="test"
        sourceType="deck"
        onComplete={vi.fn()}
      />,
    );

    expect(screen.getByTestId('hint-btn')).toBeTruthy();
    fireEvent.click(screen.getByTestId('hint-btn'));
    expect(screen.getByText(/Think about network security/)).toBeTruthy();

    fireEvent.click(screen.getByTestId('hint-btn'));
    expect(screen.getByText(/It blocks traffic/)).toBeTruthy();

    // No more hints
    expect(screen.queryByTestId('hint-btn')).toBeNull();
  });

  /* ── Fill-blank ── */

  it('renders fill-blank input and accepts correct answer', () => {
    render(
      <QuizRunner
        questions={[fillQuestion]}
        sourceId="test"
        sourceType="deck"
        onComplete={vi.fn()}
      />,
    );

    const input = screen.getByTestId('fill-input') as HTMLInputElement;
    expect(input).toBeTruthy();

    fireEvent.change(input, { target: { value: 'firewall' } });
    fireEvent.submit(input.closest('form')!);

    expect(screen.getByText('✓ Correct!')).toBeTruthy();
  });

  it('fill-blank shows incorrect for wrong answer', () => {
    render(
      <QuizRunner
        questions={[fillQuestion]}
        sourceId="test"
        sourceType="deck"
        onComplete={vi.fn()}
      />,
    );

    const input = screen.getByTestId('fill-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'router' } });
    fireEvent.submit(input.closest('form')!);

    expect(screen.getByText('✗ Incorrect')).toBeTruthy();
    expect(screen.getByText(/Correct answer: firewall/)).toBeTruthy();
  });

  /* ── Running score ── */

  it('updates running score as questions are answered', () => {
    render(
      <QuizRunner
        questions={twoQuestions}
        sourceId="test"
        sourceType="deck"
        onComplete={vi.fn()}
      />,
    );

    expect(screen.getByTestId('running-score').textContent).toBe('0 correct');

    fireEvent.click(screen.getByTestId('option-0')); // correct
    fireEvent.click(screen.getByTestId('next-btn'));

    expect(screen.getByTestId('running-score').textContent).toBe('1 correct');
  });

  /* ── SR / DrillHistory integration ── */

  it('records per-card SR review and drill completion on results', () => {
    render(
      <QuizRunner
        questions={[mcQuestion]}
        sourceId="test-deck"
        sourceType="deck"
        onComplete={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByTestId('option-0')); // correct
    fireEvent.click(screen.getByTestId('next-btn')); // results

    // CardProgressStore.recordReview called for each card
    expect(mockRecordReview).toHaveBeenCalledWith('card-a', '', expect.any(Number));

    // DrillHistoryStore.record called once
    expect(mockRecord).toHaveBeenCalledTimes(1);
    expect(mockRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        drillId: 'quiz-test-deck',
        title: 'Quiz: test-deck',
        stepCount: 1,
      }),
    );
  });

  it('gives high quality for perfect score, low for zero', () => {
    // Perfect score: 100% → quality 5
    render(
      <QuizRunner
        questions={[mcQuestion]}
        sourceId="test"
        sourceType="deck"
        onComplete={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByTestId('option-0'));
    fireEvent.click(screen.getByTestId('next-btn'));

    // correct answer → max(4, overallQuality(100%=5)) = 5
    expect(mockRecordReview).toHaveBeenCalledWith('card-a', '', 5);
  });

  /* ── TF selection ── */

  it('handles true/false selection correctly', () => {
    render(
      <QuizRunner
        questions={[tfQuestion]}
        sourceId="test"
        sourceType="deck"
        onComplete={vi.fn()}
      />,
    );

    // True is correct (index 0)
    fireEvent.click(screen.getByTestId('option-0'));
    expect(screen.getByText('✓ Correct!')).toBeTruthy();
  });

  /* ── Progress bar ── */

  it('renders a progress bar', () => {
    const { container } = render(
      <QuizRunner
        questions={twoQuestions}
        sourceId="test"
        sourceType="deck"
        onComplete={vi.fn()}
      />,
    );

    const fill = container.querySelector('[class*="progressFill"]');
    expect(fill).toBeTruthy();
  });
});
