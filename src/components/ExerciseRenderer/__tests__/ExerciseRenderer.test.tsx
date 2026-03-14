import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExerciseRenderer from '../ExerciseRenderer';
import type { Exercise } from '../../../types/Card';

const recall: Exercise = {
  type: 'recall',
  prompt: 'What is the capital of France?',
  expectedOutcome: 'Paris',
};

const apply: Exercise = {
  type: 'apply',
  prompt: 'Implement a binary search.',
  hints: ['Use two pointers', 'Compare middle element'],
  expectedOutcome: 'O(log n) algorithm',
};

const analyze: Exercise = {
  type: 'analyze',
  prompt: 'Why is caching useful?',
  hints: ['Consider latency', 'Think about repeated reads'],
  expectedOutcome: 'Reduces redundant computation and I/O.',
};

const selfCheck: Exercise = {
  type: 'self-check',
  prompt: 'Check your understanding:',
  hints: ['I understand HTTP verbs', 'I can explain REST constraints'],
  expectedOutcome: 'Core REST concepts mastered.',
};

describe('ExerciseRenderer', () => {
  it('renders nothing when exercises is empty', () => {
    const { container } = render(<ExerciseRenderer exercises={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders the exercise container with a heading', () => {
    render(<ExerciseRenderer exercises={[recall]} />);
    expect(screen.getByTestId('exercise-renderer')).toBeTruthy();
    expect(screen.getByText('Exercises')).toBeTruthy();
  });

  it('renders correct type labels', () => {
    render(<ExerciseRenderer exercises={[recall, apply, analyze, selfCheck]} />);
    expect(screen.getByText('🧠 Recall')).toBeTruthy();
    expect(screen.getByText('🔧 Apply')).toBeTruthy();
    expect(screen.getByText('🔍 Analyze')).toBeTruthy();
    expect(screen.getByText('✅ Self-Check')).toBeTruthy();
  });

  // -- Recall ----------------------------------------------------------------
  describe('recall exercise', () => {
    it('shows prompt and a reveal button', () => {
      render(<ExerciseRenderer exercises={[recall]} />);
      expect(screen.getByText('What is the capital of France?')).toBeTruthy();
      expect(screen.getByText('Reveal Answer')).toBeTruthy();
    });

    it('reveals answer on click and hides the button', () => {
      render(<ExerciseRenderer exercises={[recall]} />);
      fireEvent.click(screen.getByText('Reveal Answer'));
      expect(screen.getByText(/Paris/)).toBeTruthy();
      expect(screen.queryByText('Reveal Answer')).toBeNull();
    });

    it('calls onInteraction with attempted on reveal', () => {
      const handler = vi.fn();
      render(<ExerciseRenderer exercises={[recall]} onInteraction={handler} />);
      fireEvent.click(screen.getByText('Reveal Answer'));
      expect(handler).toHaveBeenCalledWith(0, 'attempted');
    });
  });

  // -- Apply -----------------------------------------------------------------
  describe('apply exercise', () => {
    it('shows prompt and hint button', () => {
      render(<ExerciseRenderer exercises={[apply]} />);
      expect(screen.getByText('Implement a binary search.')).toBeTruthy();
      expect(screen.getByText('Show Hint (0/2)')).toBeTruthy();
    });

    it('reveals hints incrementally', () => {
      render(<ExerciseRenderer exercises={[apply]} />);
      fireEvent.click(screen.getByText('Show Hint (0/2)'));
      expect(screen.getByText('Use two pointers')).toBeTruthy();
      expect(screen.queryByText('Compare middle element')).toBeNull();
      fireEvent.click(screen.getByText('Show Hint (1/2)'));
      expect(screen.getByText('Compare middle element')).toBeTruthy();
    });

    it('shows expected outcome after button click', () => {
      render(<ExerciseRenderer exercises={[apply]} />);
      fireEvent.click(screen.getByText('Show Expected Outcome'));
      expect(screen.getByText(/O\(log n\) algorithm/)).toBeTruthy();
    });

    it('calls onInteraction when outcome is revealed', () => {
      const handler = vi.fn();
      render(<ExerciseRenderer exercises={[apply]} onInteraction={handler} />);
      fireEvent.click(screen.getByText('Show Expected Outcome'));
      expect(handler).toHaveBeenCalledWith(0, 'attempted');
    });
  });

  // -- Analyze ---------------------------------------------------------------
  describe('analyze exercise', () => {
    it('shows prompt and reflection button', () => {
      render(<ExerciseRenderer exercises={[analyze]} />);
      expect(screen.getByText('Why is caching useful?')).toBeTruthy();
      expect(screen.getByText("I've reflected on this")).toBeTruthy();
    });

    it('reveals key insight and consideration points on click', () => {
      render(<ExerciseRenderer exercises={[analyze]} />);
      fireEvent.click(screen.getByText("I've reflected on this"));
      expect(screen.getByText(/Reduces redundant computation/)).toBeTruthy();
      expect(screen.getByText('Consider latency')).toBeTruthy();
      expect(screen.getByText('Think about repeated reads')).toBeTruthy();
    });

    it('calls onInteraction on reflection', () => {
      const handler = vi.fn();
      render(<ExerciseRenderer exercises={[analyze]} onInteraction={handler} />);
      fireEvent.click(screen.getByText("I've reflected on this"));
      expect(handler).toHaveBeenCalledWith(0, 'attempted');
    });
  });

  // -- Self-Check ------------------------------------------------------------
  describe('self-check exercise', () => {
    it('shows prompt and checklist items', () => {
      render(<ExerciseRenderer exercises={[selfCheck]} />);
      expect(screen.getByText('Check your understanding:')).toBeTruthy();
      expect(screen.getByText('I understand HTTP verbs')).toBeTruthy();
      expect(screen.getByText('I can explain REST constraints')).toBeTruthy();
    });

    it('does not show summary until all items checked', () => {
      render(<ExerciseRenderer exercises={[selfCheck]} />);
      const checkboxes = screen.getAllByRole('checkbox');
      expect(screen.queryByText(/Core REST concepts mastered/)).toBeNull();
      fireEvent.click(checkboxes[0]);
      expect(screen.queryByText(/Core REST concepts mastered/)).toBeNull();
      fireEvent.click(checkboxes[1]);
      expect(screen.getByText(/Core REST concepts mastered/)).toBeTruthy();
    });

    it('calls onInteraction when all checked', () => {
      const handler = vi.fn();
      render(<ExerciseRenderer exercises={[selfCheck]} onInteraction={handler} />);
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      expect(handler).not.toHaveBeenCalled();
      fireEvent.click(checkboxes[1]);
      expect(handler).toHaveBeenCalledWith(0, 'attempted');
    });

    it('allows unchecking items', () => {
      render(<ExerciseRenderer exercises={[selfCheck]} />);
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      fireEvent.click(checkboxes[1]);
      expect(screen.getByText(/Core REST concepts mastered/)).toBeTruthy();
      fireEvent.click(checkboxes[0]);
      expect(screen.queryByText(/Core REST concepts mastered/)).toBeNull();
    });
  });

  // -- Multiple exercises ----------------------------------------------------
  it('renders multiple exercises with correct indices for onInteraction', () => {
    const handler = vi.fn();
    render(<ExerciseRenderer exercises={[recall, selfCheck]} onInteraction={handler} />);
    // Interact with second exercise (self-check)
    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);
    expect(handler).toHaveBeenCalledWith(1, 'attempted');
    // Interact with first exercise (recall)
    fireEvent.click(screen.getByText('Reveal Answer'));
    expect(handler).toHaveBeenCalledWith(0, 'attempted');
  });

  // -- Completion signal (onAllCompleted) ------------------------------------
  describe('onAllCompleted', () => {
    it('fires when all exercises have been interacted with', () => {
      const onAll = vi.fn();
      render(
        <ExerciseRenderer exercises={[recall, selfCheck]} onAllCompleted={onAll} />,
      );
      // Complete first exercise (recall)
      fireEvent.click(screen.getByText('Reveal Answer'));
      expect(onAll).not.toHaveBeenCalled();
      // Complete second exercise (self-check)
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      fireEvent.click(checkboxes[1]);
      expect(onAll).toHaveBeenCalledTimes(1);
    });

    it('fires when single exercise is completed', () => {
      const onAll = vi.fn();
      render(<ExerciseRenderer exercises={[recall]} onAllCompleted={onAll} />);
      fireEvent.click(screen.getByText('Reveal Answer'));
      expect(onAll).toHaveBeenCalledTimes(1);
    });

    it('does not fire until every exercise is interacted with', () => {
      const onAll = vi.fn();
      render(
        <ExerciseRenderer exercises={[recall, apply, analyze]} onAllCompleted={onAll} />,
      );
      // Complete only recall
      fireEvent.click(screen.getByText('Reveal Answer'));
      expect(onAll).not.toHaveBeenCalled();
      // Complete apply
      fireEvent.click(screen.getByText('Show Expected Outcome'));
      expect(onAll).not.toHaveBeenCalled();
      // Complete analyze
      fireEvent.click(screen.getByText("I've reflected on this"));
      expect(onAll).toHaveBeenCalledTimes(1);
    });

    it('does not fire more than once for repeated interactions', () => {
      const onAll = vi.fn();
      render(<ExerciseRenderer exercises={[recall]} onAllCompleted={onAll} />);
      fireEvent.click(screen.getByText('Reveal Answer'));
      expect(onAll).toHaveBeenCalledTimes(1);
      // Re-renders shouldn't re-fire (recall has no second interaction)
    });

    it('works without onAllCompleted prop (no crash)', () => {
      render(<ExerciseRenderer exercises={[recall]} />);
      // Should not throw
      fireEvent.click(screen.getByText('Reveal Answer'));
    });

    it('fires with all four exercise types', () => {
      const onAll = vi.fn();
      render(
        <ExerciseRenderer exercises={[recall, apply, analyze, selfCheck]} onAllCompleted={onAll} />,
      );
      // Complete recall
      fireEvent.click(screen.getByText('Reveal Answer'));
      expect(onAll).not.toHaveBeenCalled();
      // Complete apply
      fireEvent.click(screen.getByText('Show Expected Outcome'));
      expect(onAll).not.toHaveBeenCalled();
      // Complete analyze
      fireEvent.click(screen.getByText("I've reflected on this"));
      expect(onAll).not.toHaveBeenCalled();
      // Complete self-check
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[0]);
      fireEvent.click(checkboxes[1]);
      expect(onAll).toHaveBeenCalledTimes(1);
    });
  });
});
