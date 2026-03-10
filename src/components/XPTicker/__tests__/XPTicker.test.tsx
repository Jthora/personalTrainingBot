import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import XPTicker from '../XPTicker';

describe('XPTicker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the XP amount', () => {
    render(<XPTicker amount={75} onDone={vi.fn()} />);
    expect(screen.getByText('+75 XP')).toBeTruthy();
  });

  it('has status role with correct aria label', () => {
    render(<XPTicker amount={50} onDone={vi.fn()} />);
    expect(screen.getByRole('status', { name: '+50 XP' })).toBeTruthy();
  });

  it('auto-removes after default 2000ms', () => {
    const onDone = vi.fn();
    render(<XPTicker amount={10} onDone={onDone} />);

    act(() => { vi.advanceTimersByTime(1999); });
    expect(onDone).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(1); });
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('respects custom durationMs', () => {
    const onDone = vi.fn();
    render(<XPTicker amount={10} onDone={onDone} durationMs={500} />);

    act(() => { vi.advanceTimersByTime(500); });
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
