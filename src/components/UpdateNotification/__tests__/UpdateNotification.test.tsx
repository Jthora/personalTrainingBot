import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UpdateNotification from '../UpdateNotification';

const mockUseServiceWorkerUpdate = vi.fn();

vi.mock('../../../hooks/useServiceWorkerUpdate', () => ({
  useServiceWorkerUpdate: () => mockUseServiceWorkerUpdate(),
}));

describe('UpdateNotification', () => {
  beforeEach(() => {
    mockUseServiceWorkerUpdate.mockReturnValue({
      updateAvailable: false,
      applyUpdate: vi.fn(),
    });
  });

  it('renders nothing when no update is available', () => {
    const { container } = render(<UpdateNotification />);
    expect(container.innerHTML).toBe('');
  });

  it('renders notification when update is available', () => {
    mockUseServiceWorkerUpdate.mockReturnValue({
      updateAvailable: true,
      applyUpdate: vi.fn(),
    });

    render(<UpdateNotification />);
    expect(screen.getByTestId('update-notification')).toBeTruthy();
    expect(screen.getByText('A new version is available.')).toBeTruthy();
  });

  it('calls applyUpdate when Reload is clicked', () => {
    const applyUpdate = vi.fn();
    mockUseServiceWorkerUpdate.mockReturnValue({
      updateAvailable: true,
      applyUpdate,
    });

    render(<UpdateNotification />);
    fireEvent.click(screen.getByTestId('update-reload'));
    expect(applyUpdate).toHaveBeenCalled();
  });

  it('has alert role for accessibility', () => {
    mockUseServiceWorkerUpdate.mockReturnValue({
      updateAvailable: true,
      applyUpdate: vi.fn(),
    });

    render(<UpdateNotification />);
    expect(screen.getByRole('alert', { name: /update available/i })).toBeTruthy();
  });
});
