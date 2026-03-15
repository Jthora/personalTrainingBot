import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProfileSurface from '../ProfileSurface';
import { MISSION_MODE_STORAGE_KEY } from '../appShellTabs';

vi.mock('../../../store/OperativeProfileStore', () => ({
  default: {
    get: vi.fn(() => ({
      callsign: 'SHADOW-7',
      archetypeId: 'red-team',
      handlerId: 'handler-alpha',
      enrolledAt: '2025-01-15T00:00:00.000Z',
    })),
  },
}));

describe('ProfileSurface', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders profile title', () => {
    render(<ProfileSurface />);
    expect(screen.getByText('Profile')).toBeTruthy();
  });

  it('shows cadet dossier', () => {
    render(<ProfileSurface />);
    expect(screen.getByText('SHADOW-7')).toBeTruthy();
    expect(screen.getByText('red-team')).toBeTruthy();
    expect(screen.getByText('handler-alpha')).toBeTruthy();
  });

  it('shows active duty toggle (off by default)', () => {
    render(<ProfileSurface />);
    const toggle = screen.getByRole('switch');
    expect(toggle.getAttribute('aria-checked')).toBe('false');
  });

  it('toggles active duty on click', () => {
    render(<ProfileSurface />);
    const toggle = screen.getByRole('switch');
    fireEvent.click(toggle);
    expect(toggle.getAttribute('aria-checked')).toBe('true');
    expect(localStorage.getItem(MISSION_MODE_STORAGE_KEY)).toBe('enabled');
  });

  it('toggles active duty off on second click', () => {
    render(<ProfileSurface />);
    const toggle = screen.getByRole('switch');
    fireEvent.click(toggle); // on
    fireEvent.click(toggle); // off
    expect(toggle.getAttribute('aria-checked')).toBe('false');
    expect(localStorage.getItem(MISSION_MODE_STORAGE_KEY)).toBeNull();
  });

  it('renders export data button', () => {
    render(<ProfileSurface />);
    expect(screen.getByText('Export Data')).toBeTruthy();
  });
});
