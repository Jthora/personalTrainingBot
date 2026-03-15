import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProfileEditor from '../ProfileEditor';

/* ── Mocks ── */
const { mockProfileStore } = vi.hoisted(() => ({
  mockProfileStore: {
    get: vi.fn(),
    patch: vi.fn(),
    subscribe: vi.fn(() => vi.fn()),
    getVersion: vi.fn(() => 0),
  },
}));
vi.mock('../../../store/OperativeProfileStore', () => ({
  default: mockProfileStore,
}));

vi.mock('../../../data/archetypes', () => ({
  findArchetype: vi.fn((id: string) => {
    if (id === 'guardian') {
      return {
        id: 'guardian',
        name: 'Guardian',
        icon: '🛡️',
        description: 'Protects and serves.',
        coreModules: ['fitness', 'combat'],
        secondaryModules: [],
        recommendedHandler: 'tiger_fitness_god',
        milestoneLabels: {},
        competencyWeights: {},
        tier3Gate: '',
        tier4Gate: '',
      };
    }
    return undefined;
  }),
  getArchetypeCatalog: vi.fn(() => [
    {
      id: 'guardian',
      name: 'Guardian',
      icon: '🛡️',
      description: 'Protects and serves.',
      coreModules: ['fitness', 'combat'],
      secondaryModules: [],
      recommendedHandler: 'tiger_fitness_god',
      milestoneLabels: {},
      competencyWeights: {},
      tier3Gate: '',
      tier4Gate: '',
    },
  ]),
}));

vi.mock('../../../data/handlers', () => ({
  handlers: [
    {
      id: 'tiger_fitness_god',
      name: 'Commander Tygan',
      icon: '/tiger.png',
      personality: 'Ferocious Motivator',
      description: '',
      traits: {},
      specializations: {},
      additionalDetails: {},
    },
  ],
}));

vi.mock('../../../utils/telemetry', () => ({
  trackEvent: vi.fn(),
}));

const baseProfile = {
  archetypeId: 'guardian',
  handlerId: 'tiger_fitness_god',
  callsign: 'Raven',
  enrolledAt: '2025-01-01T00:00:00Z',
};

beforeEach(() => {
  vi.clearAllMocks();
  mockProfileStore.get.mockReturnValue(baseProfile);
  mockProfileStore.getVersion.mockReturnValue(0);
});

describe('ProfileEditor', () => {
  it('renders nothing when no profile exists', () => {
    mockProfileStore.get.mockReturnValue(null);
    const { container } = render(<ProfileEditor />);
    expect(container.innerHTML).toBe('');
  });

  it('renders the edit panel with callsign input', () => {
    render(<ProfileEditor />);
    expect(screen.getByTestId('profile-editor')).toBeTruthy();
    expect(screen.getByTestId('callsign-input')).toBeTruthy();
    const input = screen.getByTestId('callsign-input') as HTMLInputElement;
    expect(input.value).toBe('Raven');
  });

  it('shows Change Archetype and Change Handler buttons', () => {
    render(<ProfileEditor />);
    expect(screen.getByTestId('change-archetype-btn')).toBeTruthy();
    expect(screen.getByTestId('change-handler-btn')).toBeTruthy();
  });

  it('saves callsign via store patch on blur', () => {
    render(<ProfileEditor />);
    const input = screen.getByTestId('callsign-input');
    fireEvent.change(input, { target: { value: 'Phoenix' } });
    fireEvent.blur(input);
    expect(mockProfileStore.patch).toHaveBeenCalledWith({ callsign: 'Phoenix' });
  });

  it('opens archetype picker overlay', () => {
    render(<ProfileEditor />);
    expect(screen.queryByTestId('archetype-overlay')).toBeNull();
    fireEvent.click(screen.getByTestId('change-archetype-btn'));
    expect(screen.getByTestId('archetype-overlay')).toBeTruthy();
    expect(screen.getByTestId('archetype-picker')).toBeTruthy();
  });

  it('opens handler picker overlay', () => {
    render(<ProfileEditor />);
    expect(screen.queryByTestId('handler-overlay')).toBeNull();
    fireEvent.click(screen.getByTestId('change-handler-btn'));
    expect(screen.getByTestId('handler-overlay')).toBeTruthy();
    expect(screen.getByTestId('handler-picker')).toBeTruthy();
  });

  it('closes archetype overlay via Cancel button', () => {
    render(<ProfileEditor />);
    fireEvent.click(screen.getByTestId('change-archetype-btn'));
    expect(screen.getByTestId('archetype-overlay')).toBeTruthy();
    fireEvent.click(screen.getByTestId('overlay-close'));
    expect(screen.queryByTestId('archetype-overlay')).toBeNull();
  });

  it('patches archetypeId when archetype is confirmed', () => {
    render(<ProfileEditor />);
    fireEvent.click(screen.getByTestId('change-archetype-btn'));
    // Click the existing archetype card to select it, then confirm
    fireEvent.click(screen.getByTestId('archetype-card-guardian'));
    fireEvent.click(screen.getByTestId('archetype-confirm'));
    expect(mockProfileStore.patch).toHaveBeenCalledWith({ archetypeId: 'guardian' });
    // Overlay should close
    expect(screen.queryByTestId('archetype-overlay')).toBeNull();
  });

  it('patches handlerId when handler is confirmed', () => {
    render(<ProfileEditor />);
    fireEvent.click(screen.getByTestId('change-handler-btn'));
    // Click handler card then confirm
    fireEvent.click(screen.getByTestId('handler-card-tiger_fitness_god'));
    fireEvent.click(screen.getByTestId('handler-confirm'));
    expect(mockProfileStore.patch).toHaveBeenCalledWith({ handlerId: 'tiger_fitness_god' });
    expect(screen.queryByTestId('handler-overlay')).toBeNull();
  });
});
