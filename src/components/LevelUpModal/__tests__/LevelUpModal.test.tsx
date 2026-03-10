import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import LevelUpModal from '../LevelUpModal';

describe('LevelUpModal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders level transition text', () => {
    render(<LevelUpModal previousLevel={2} newLevel={3} onDismiss={vi.fn()} />);
    expect(screen.getByText(/Level 2 → Level 3/)).toBeTruthy();
    expect(screen.getByText('Level Up!')).toBeTruthy();
  });

  it('has dialog role with correct label', () => {
    render(<LevelUpModal previousLevel={1} newLevel={2} onDismiss={vi.fn()} />);
    expect(screen.getByRole('dialog', { name: /level up/i })).toBeTruthy();
  });

  it('calls onDismiss when Continue is clicked', () => {
    const onDismiss = vi.fn();
    render(<LevelUpModal previousLevel={1} newLevel={2} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByTestId('level-up-dismiss'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('auto-dismisses after default 5000ms', () => {
    const onDismiss = vi.fn();
    render(<LevelUpModal previousLevel={1} newLevel={2} onDismiss={onDismiss} />);

    act(() => { vi.advanceTimersByTime(4999); });
    expect(onDismiss).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(1); });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('respects custom autoDismissMs', () => {
    const onDismiss = vi.fn();
    render(<LevelUpModal previousLevel={1} newLevel={2} onDismiss={onDismiss} autoDismissMs={1000} />);

    act(() => { vi.advanceTimersByTime(1000); });
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not auto-dismiss when autoDismissMs is 0', () => {
    const onDismiss = vi.fn();
    render(<LevelUpModal previousLevel={1} newLevel={2} onDismiss={onDismiss} autoDismissMs={0} />);

    act(() => { vi.advanceTimersByTime(10000); });
    expect(onDismiss).not.toHaveBeenCalled();
  });
});
