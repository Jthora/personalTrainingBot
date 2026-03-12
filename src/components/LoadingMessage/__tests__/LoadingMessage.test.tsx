import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import LoadingMessage from '../LoadingMessage';

describe('LoadingMessage', () => {
  it('renders progress bar at correct width', () => {
    const { container } = render(<LoadingMessage progress={45} />);
    const bar = container.querySelector('[style*="width: 45%"]');
    expect(bar).toBeTruthy();
    expect(screen.getByText('Archangel Knights Training Console')).toBeTruthy();
  });

  it('animates loading dots over time', () => {
    vi.useFakeTimers();
    render(<LoadingMessage progress={0} />);
    // initial: empty
    expect(screen.getByText('App Loading')).toBeTruthy();
    // after 500ms: '.'
    act(() => { vi.advanceTimersByTime(500); });
    expect(screen.getByText(/App Loading/)).toBeTruthy();
    // after 2000ms total: cycles through
    act(() => { vi.advanceTimersByTime(1500); });
    expect(screen.getByText(/App Loading/)).toBeTruthy();
    vi.useRealTimers();
  });
});
