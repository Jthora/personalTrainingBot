import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MissionRouteState from '../MissionRouteState';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));
vi.mock('../../../utils/mission/iconography', () => ({
  missionSeverityIcons: { critical: '🔴', medium: '🟡', low: '🟢' },
}));

describe('MissionRouteState', () => {
  it('loading state renders status with skeleton', () => {
    render(<MissionRouteState state={{ kind: 'loading', title: 'Syncing', body: 'Please wait' }} />);
    const el = screen.getByRole('status');
    expect(el).toBeTruthy();
    expect(screen.getByText(/Syncing/)).toBeTruthy();
    expect(screen.getByText('Please wait')).toBeTruthy();
  });

  it('error state renders alert with action button', () => {
    render(<MissionRouteState state={{ kind: 'error', title: 'Failed', body: 'Something broke', actionLabel: 'Retry', actionPath: '/mission/brief' }} />);
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText('Something broke')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(mockNavigate).toHaveBeenCalledWith('/mission/brief');
  });

  it('empty state renders status with action button', () => {
    render(<MissionRouteState state={{ kind: 'empty', title: 'No data', body: 'Nothing here', actionLabel: 'Go back', actionPath: '/mission' }} />);
    expect(screen.getByRole('status')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Go back' }));
    expect(mockNavigate).toHaveBeenCalledWith('/mission');
  });
});
