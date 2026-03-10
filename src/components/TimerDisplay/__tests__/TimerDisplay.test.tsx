import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TimerDisplay, { formatTime } from '../TimerDisplay';

describe('formatTime', () => {
  it('formats 0 as 00:00', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  it('formats 65 as 01:05', () => {
    expect(formatTime(65)).toBe('01:05');
  });

  it('formats 3661 as 61:01', () => {
    expect(formatTime(3661)).toBe('61:01');
  });
});

describe('TimerDisplay', () => {
  it('renders elapsed time', () => {
    render(<TimerDisplay seconds={125} state="running" />);
    expect(screen.getByText('02:05')).toBeTruthy();
    expect(screen.getByText('Elapsed')).toBeTruthy();
  });

  it('accepts custom label', () => {
    render(<TimerDisplay seconds={30} state="running" label="Remaining" />);
    expect(screen.getByText('Remaining')).toBeTruthy();
  });

  it('shows Pause button when running', () => {
    const onPause = vi.fn();
    render(<TimerDisplay seconds={10} state="running" onPause={onPause} />);
    const btn = screen.getByTestId('timer-pause');
    fireEvent.click(btn);
    expect(onPause).toHaveBeenCalledTimes(1);
  });

  it('shows Resume and Reset when paused', () => {
    const onResume = vi.fn();
    const onReset = vi.fn();
    render(<TimerDisplay seconds={10} state="paused" onResume={onResume} onReset={onReset} />);
    expect(screen.getByTestId('timer-resume')).toBeTruthy();
    expect(screen.getByTestId('timer-reset')).toBeTruthy();
    fireEvent.click(screen.getByTestId('timer-resume'));
    expect(onResume).toHaveBeenCalledTimes(1);
  });

  it('shows Reset when complete', () => {
    const onReset = vi.fn();
    render(<TimerDisplay seconds={0} state="complete" onReset={onReset} />);
    expect(screen.getByTestId('timer-reset')).toBeTruthy();
    expect(screen.queryByTestId('timer-pause')).toBeNull();
  });

  it('hides controls when showControls=false', () => {
    render(<TimerDisplay seconds={10} state="running" showControls={false} onPause={vi.fn()} />);
    expect(screen.queryByTestId('timer-pause')).toBeNull();
  });

  it('sets data-state attribute', () => {
    render(<TimerDisplay seconds={10} state="paused" />);
    const el = screen.getByTestId('timer-display');
    expect(el.getAttribute('data-state')).toBe('paused');
  });
});
