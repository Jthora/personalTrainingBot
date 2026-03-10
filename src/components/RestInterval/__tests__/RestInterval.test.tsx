import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import RestInterval from '../RestInterval';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('RestInterval', () => {
  it('renders with countdown display', () => {
    render(<RestInterval durationSec={30} onComplete={vi.fn()} />);
    expect(screen.getByTestId('rest-interval')).toBeTruthy();
    expect(screen.getByText('Rest Period')).toBeTruthy();
    expect(screen.getByText('Remaining')).toBeTruthy();
    expect(screen.getByText('00:30')).toBeTruthy();
  });

  it('counts down each second', () => {
    render(<RestInterval durationSec={5} onComplete={vi.fn()} />);
    act(() => { vi.advanceTimersByTime(2000); });
    expect(screen.getByText('00:03')).toBeTruthy();
  });

  it('calls onComplete when countdown finishes', () => {
    const onComplete = vi.fn();
    render(<RestInterval durationSec={3} onComplete={onComplete} />);
    act(() => { vi.advanceTimersByTime(3000); });
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('calls onComplete immediately when skip is clicked', () => {
    const onComplete = vi.fn();
    render(<RestInterval durationSec={60} onComplete={onComplete} />);
    fireEvent.click(screen.getByTestId('rest-skip'));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('renders hint text when provided', () => {
    render(<RestInterval durationSec={10} onComplete={vi.fn()} hint="Hydrate" />);
    expect(screen.getByText('Hydrate')).toBeTruthy();
  });

  it('does not render hint when omitted', () => {
    render(<RestInterval durationSec={10} onComplete={vi.fn()} />);
    expect(screen.queryByText('Hydrate')).toBeNull();
  });
});
