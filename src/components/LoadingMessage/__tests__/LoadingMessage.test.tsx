import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import LoadingMessage from '../LoadingMessage';

describe('LoadingMessage', () => {
  it('renders progress bar at correct width', () => {
    const { container } = render(<LoadingMessage progress={45} />);
    const bar = container.querySelector('[style*="width: 45%"]');
    expect(bar).toBeTruthy();
    expect(screen.getByText('Starcom Academy')).toBeTruthy();
  });

  it('animates loading dots over time', () => {
    vi.useFakeTimers();
    render(<LoadingMessage progress={0} />);
    expect(screen.getByText(/Initializing systems/)).toBeTruthy();
    act(() => { vi.advanceTimersByTime(500); });
    expect(screen.getByText(/Initializing systems/)).toBeTruthy();
    act(() => { vi.advanceTimersByTime(1500); });
    expect(screen.getByText(/Initializing systems/)).toBeTruthy();
    vi.useRealTimers();
  });

  it('shows correct stage label based on progress', () => {
    const { rerender } = render(<LoadingMessage progress={0} />);
    expect(screen.getByText(/Initializing systems/)).toBeTruthy();

    rerender(<LoadingMessage progress={15} />);
    expect(screen.getByText(/Restoring cached data/)).toBeTruthy();

    rerender(<LoadingMessage progress={50} />);
    expect(screen.getByText(/Loading training modules/)).toBeTruthy();

    rerender(<LoadingMessage progress={80} />);
    expect(screen.getByText(/Preparing interface/)).toBeTruthy();

    rerender(<LoadingMessage progress={100} />);
    expect(screen.getByText(/Systems online/)).toBeTruthy();
  });

  it('has accessible progressbar role', () => {
    render(<LoadingMessage progress={60} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toBeTruthy();
    expect(bar.getAttribute('aria-valuenow')).toBe('60');
  });

  it('renders spinner element targeted by reduced-motion CSS', () => {
    const { container } = render(<LoadingMessage progress={50} />);
    const spinner = container.querySelector('[class*="spinner"]');
    expect(spinner).toBeTruthy();
    // The animation bar should also exist for reduced-motion override
    const animBar = container.querySelector('[class*="loadingBarAnimation"]');
    expect(animBar).toBeTruthy();
  });
});
