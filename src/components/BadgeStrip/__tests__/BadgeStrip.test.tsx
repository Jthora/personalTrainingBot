import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import BadgeStrip from '../BadgeStrip';

vi.mock('../../../store/UserProgressStore', () => ({
  default: {
    get: vi.fn(() => ({
      badges: ['alpha', 'bravo', 'charlie', 'delta', 'echo'],
      flags: { badgeStripEnabled: true },
    })),
    isDisabled: vi.fn(() => false),
  },
}));

describe('BadgeStrip', () => {
  it('renders last 3 badges in reverse order with overflow count', () => {
    render(<BadgeStrip />);
    expect(screen.getByText('echo')).toBeTruthy();
    expect(screen.getByText('delta')).toBeTruthy();
    expect(screen.getByText('charlie')).toBeTruthy();
    expect(screen.getByText('+2')).toBeTruthy();
  });

  it('returns null when disabled', async () => {
    const mod = await import('../../../store/UserProgressStore');
    (mod.default.isDisabled as ReturnType<typeof vi.fn>).mockReturnValueOnce(true);
    const { container } = render(<BadgeStrip />);
    expect(container.innerHTML).toBe('');
  });
});
