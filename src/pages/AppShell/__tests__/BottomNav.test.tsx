import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BottomNav from '../BottomNav';
import { primaryTabs, missionTabs, type AppShellTab } from '../appShellTabs';

const mockNavigate = vi.fn();
let mockPathname = '/train';
vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: mockPathname }),
  useNavigate: () => mockNavigate,
}));

describe('BottomNav', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = '/train';
  });

  it('renders 4 primary tabs', () => {
    render(<BottomNav tabs={primaryTabs} />);
    expect(screen.getByText('Train')).toBeTruthy();
    expect(screen.getByText('Review')).toBeTruthy();
    expect(screen.getByText('Progress')).toBeTruthy();
    expect(screen.getByText('Profile')).toBeTruthy();
  });

  it('marks active tab with aria-current', () => {
    render(<BottomNav tabs={primaryTabs} />);
    const trainBtn = screen.getByText('Train').closest('button')!;
    expect(trainBtn.getAttribute('aria-current')).toBe('page');
    const reviewBtn = screen.getByText('Review').closest('button')!;
    expect(reviewBtn.getAttribute('aria-current')).toBeNull();
  });

  it('navigates on tap', () => {
    render(<BottomNav tabs={primaryTabs} />);
    fireEvent.click(screen.getByText('Review').closest('button')!);
    expect(mockNavigate).toHaveBeenCalledWith('/review');
  });

  it('shows due badge on Review tab', () => {
    render(<BottomNav tabs={primaryTabs} dueBadge={42} />);
    expect(screen.getByText('42')).toBeTruthy();
  });

  it('shows 99+ for large badge counts', () => {
    render(<BottomNav tabs={primaryTabs} dueBadge={150} />);
    expect(screen.getByText('99+')).toBeTruthy();
  });

  it('does not show badge when dueBadge is 0', () => {
    render(<BottomNav tabs={primaryTabs} dueBadge={0} />);
    expect(screen.queryByText('0')).toBeNull();
  });

  it('filters out mission-only tabs', () => {
    const allTabs: AppShellTab[] = [...primaryTabs, ...missionTabs];
    render(<BottomNav tabs={allTabs} />);
    // Should have 4 bottom buttons, not 9
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);
    expect(screen.queryByText('Brief')).toBeNull();
    expect(screen.queryByText('Triage')).toBeNull();
  });
});
