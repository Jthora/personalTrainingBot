import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InstallBanner from '../InstallBanner';

const mockUseInstallPrompt = vi.fn();

vi.mock('../../../hooks/useInstallPrompt', () => ({
  useInstallPrompt: () => mockUseInstallPrompt(),
}));

describe('InstallBanner', () => {
  beforeEach(() => {
    mockUseInstallPrompt.mockReturnValue({
      canInstall: false,
      isInstalled: false,
      promptInstall: vi.fn(),
    });
  });

  it('renders nothing when canInstall is false', () => {
    const { container } = render(<InstallBanner />);
    expect(container.innerHTML).toBe('');
  });

  it('renders banner when canInstall is true', () => {
    mockUseInstallPrompt.mockReturnValue({
      canInstall: true,
      isInstalled: false,
      promptInstall: vi.fn(),
    });

    render(<InstallBanner />);
    expect(screen.getByTestId('install-banner')).toBeTruthy();
    expect(screen.getByText(/Install the Training Console/)).toBeTruthy();
  });

  it('calls promptInstall when Install button is clicked', () => {
    const promptInstall = vi.fn();
    mockUseInstallPrompt.mockReturnValue({
      canInstall: true,
      isInstalled: false,
      promptInstall,
    });

    render(<InstallBanner />);
    fireEvent.click(screen.getByTestId('install-btn'));
    expect(promptInstall).toHaveBeenCalled();
  });

  it('hides banner when dismiss is clicked', () => {
    mockUseInstallPrompt.mockReturnValue({
      canInstall: true,
      isInstalled: false,
      promptInstall: vi.fn(),
    });

    render(<InstallBanner />);
    expect(screen.getByTestId('install-banner')).toBeTruthy();

    fireEvent.click(screen.getByTestId('install-dismiss'));
    expect(screen.queryByTestId('install-banner')).toBeNull();
  });

  it('has correct aria-label for accessibility', () => {
    mockUseInstallPrompt.mockReturnValue({
      canInstall: true,
      isInstalled: false,
      promptInstall: vi.fn(),
    });

    render(<InstallBanner />);
    expect(screen.getByRole('status', { name: /install app/i })).toBeTruthy();
  });
});
