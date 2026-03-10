import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import OperativeIdentityCard from '../OperativeIdentityCard';

/* ── Mocks ── */
vi.mock('../../../store/OperativeProfileStore', () => ({
  default: {
    get: vi.fn(() => null),
  },
}));

vi.mock('../../../data/archetypes', () => ({
  findArchetype: vi.fn((id: string) => {
    if (id === 'rescue_ranger') {
      return {
        id: 'rescue_ranger',
        name: 'Rescue Ranger',
        icon: '🦅',
        description: 'Rescue-focused operative specialising in disaster triage.',
        coreModules: ['combat', 'fitness', 'martial_arts'],
        secondaryModules: ['investigation'],
        recommendedHandler: 'tiger_fitness_god',
        milestoneLabels: {},
        competencyWeights: {},
        tier3Gate: '',
        tier4Gate: '',
      };
    }
    return undefined;
  }),
}));

vi.mock('../../../data/handlers', () => ({
  handlers: [
    {
      id: 'tiger_fitness_god',
      name: 'Tiger War God',
      icon: '/tiger.png',
      personality: 'Ferocious Motivator',
      description: '',
      traits: {},
      specializations: {},
      additionalDetails: {},
    },
  ],
}));

import OperativeProfileStore from '../../../store/OperativeProfileStore';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('OperativeIdentityCard', () => {
  it('renders empty state when no profile exists', () => {
    render(<OperativeIdentityCard />);
    expect(screen.getByText('No operative profile configured.')).toBeTruthy();
  });

  it('renders archetype + handler when profile props provided', () => {
    render(
      <OperativeIdentityCard
        archetypeId="rescue_ranger"
        handlerId="tiger_fitness_god"
        callsign="Phoenix"
      />,
    );
    expect(screen.getByText('Phoenix')).toBeTruthy();
    expect(screen.getByText('Rescue Ranger')).toBeTruthy();
    expect(screen.getByText('Tiger War God')).toBeTruthy();
  });

  it('renders core module tags', () => {
    render(<OperativeIdentityCard archetypeId="rescue_ranger" />);
    expect(screen.getByText('combat')).toBeTruthy();
    expect(screen.getByText('fitness')).toBeTruthy();
    expect(screen.getByText('martial arts')).toBeTruthy();
  });

  it('falls back to OperativeProfileStore when no props given', () => {
    (OperativeProfileStore.get as ReturnType<typeof vi.fn>).mockReturnValue({
      archetypeId: 'rescue_ranger',
      handlerId: 'tiger_fitness_god',
      callsign: 'Shadow',
      enrolledAt: '2026-01-01',
    });
    render(<OperativeIdentityCard />);
    expect(screen.getByText('Shadow')).toBeTruthy();
    expect(screen.getByText('Rescue Ranger')).toBeTruthy();
  });

  it('has aria-label for accessibility', () => {
    render(<OperativeIdentityCard archetypeId="rescue_ranger" />);
    expect(screen.getByLabelText('Operative identity')).toBeTruthy();
  });

  it('renders handler icon as img', () => {
    render(<OperativeIdentityCard handlerId="tiger_fitness_god" />);
    const img = screen.getByAltText('Tiger War God') as HTMLImageElement;
    expect(img.src).toContain('tiger.png');
  });
});
