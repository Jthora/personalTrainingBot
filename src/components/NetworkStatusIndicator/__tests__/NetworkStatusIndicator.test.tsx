import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NetworkStatusIndicator from '../NetworkStatusIndicator';

vi.mock('../../../hooks/useNetworkStatus', () => ({
  useNetworkStatus: vi.fn(),
}));

import { useNetworkStatus } from '../../../hooks/useNetworkStatus';
const mockUseNetworkStatus = useNetworkStatus as ReturnType<typeof vi.fn>;

describe('NetworkStatusIndicator', () => {
  it('shows "Ready" when online', () => {
    mockUseNetworkStatus.mockReturnValue(true);
    render(<NetworkStatusIndicator />);
    expect(screen.getByRole('status').textContent).toMatch(/Ready/i);
  });

  it('shows offline message when offline', () => {
    mockUseNetworkStatus.mockReturnValue(false);
    render(<NetworkStatusIndicator />);
    expect(screen.getByRole('status').textContent).toMatch(/Offline/i);
  });
});
