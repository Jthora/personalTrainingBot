import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ModuleBrowser from '../ModuleBrowser';

/* ── Mocks ── */
const mockGetModuleStats = vi.fn(() => ({ totalCards: 50, totalDecks: 5 }));
const mockIsModuleSelected = vi.fn(() => true);
const mockToggleModuleSelection = vi.fn();
const mockIsLoaded = vi.fn(() => true);
const mockSubscribeToSelectionChanges = vi.fn(() => vi.fn());

vi.mock('../../../cache/TrainingModuleCache', () => ({
  default: {
    getInstance: vi.fn(() => ({
      getModuleStats: mockGetModuleStats,
      isModuleSelected: mockIsModuleSelected,
      toggleModuleSelection: mockToggleModuleSelection,
      isLoaded: mockIsLoaded,
      subscribeToSelectionChanges: mockSubscribeToSelectionChanges,
    })),
  },
}));

const mockProfileGet = vi.fn(() => null as { archetypeId: string; handlerId: string } | null);
const mockProfileSubscribe = vi.fn(() => vi.fn());

vi.mock('../../../store/OperativeProfileStore', () => ({
  default: {
    get: (...args: unknown[]) => mockProfileGet(...args),
    subscribe: (...args: unknown[]) => mockProfileSubscribe(...args),
  },
}));

vi.mock('../../../data/archetypes', async (importOriginal) => {
  const orig = await importOriginal<typeof import('../../../data/archetypes')>();
  return { ...orig };
});

vi.mock('../../../utils/readiness/domainProgress', async (importOriginal) => {
  const orig = await importOriginal<typeof import('../../../utils/readiness/domainProgress')>();
  return {
    ...orig,
    deriveDomainSnapshot: vi.fn(() => ({
      domains: orig.DOMAIN_CATALOG.map((d) => ({
        domainId: d.id,
        domainName: d.name,
        score: 42,
        drillCount: 3,
        avgAssessment: 4,
        uniqueDrills: 2,
        lastActiveDate: '2026-03-01',
        trend: 'stable' as const,
        coverageRatio: 0.4,
      })),
      weightedScore: 42,
    })),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
  mockIsLoaded.mockReturnValue(true);
});

describe('ModuleBrowser', () => {
  it('renders all 19 domain tiles', () => {
    const onSelect = vi.fn();
    render(<ModuleBrowser onSelectModule={onSelect} />);

    expect(screen.getByTestId('module-browser')).toBeTruthy();
    // Check a sampling of the 19 domains
    expect(screen.getByText('Cybersecurity')).toBeTruthy();
    expect(screen.getByText('Combat')).toBeTruthy();
    expect(screen.getByText('Fitness')).toBeTruthy();
    expect(screen.getByText('Espionage')).toBeTruthy();
    expect(screen.getByText('Space Force')).toBeTruthy();

    // Should have 19 tiles
    const tiles = screen.getAllByTestId(/^module-tile-/);
    expect(tiles).toHaveLength(19);
  });

  it('shows card counts from TrainingModuleCache', () => {
    mockGetModuleStats.mockReturnValue({ totalCards: 120, totalDecks: 8 });
    const onSelect = vi.fn();
    render(<ModuleBrowser onSelectModule={onSelect} />);

    // Each tile shows card and deck counts
    const cardLabels = screen.getAllByText('120 cards');
    expect(cardLabels.length).toBeGreaterThan(0);
    const deckLabels = screen.getAllByText('8 decks');
    expect(deckLabels.length).toBeGreaterThan(0);
  });

  it('calls onSelectModule when a tile is clicked', () => {
    const onSelect = vi.fn();
    render(<ModuleBrowser onSelectModule={onSelect} />);

    fireEvent.click(screen.getByTestId('module-tile-cybersecurity'));
    expect(onSelect).toHaveBeenCalledWith('cybersecurity');
  });

  it('toggles module selection when checkbox area is clicked', () => {
    const onSelect = vi.fn();
    render(<ModuleBrowser onSelectModule={onSelect} />);

    const checkbox = screen.getByLabelText('Select Cybersecurity');
    fireEvent.click(checkbox.closest('span')!);
    expect(mockToggleModuleSelection).toHaveBeenCalledWith('cybersecurity');
    // Should NOT navigate to deck view
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('shows loading state when cache not loaded', () => {
    mockIsLoaded.mockReturnValue(false);
    const onSelect = vi.fn();
    render(<ModuleBrowser onSelectModule={onSelect} />);

    expect(screen.getByText(/loading training modules/i)).toBeTruthy();
    expect(screen.queryByTestId('module-browser')).toBeNull();
  });

  it('displays domain score bar and coverage ratio', () => {
    const onSelect = vi.fn();
    render(<ModuleBrowser onSelectModule={onSelect} />);

    // Coverage should be rendered as "40% coverage"
    const coverageLabels = screen.getAllByText('40% coverage');
    expect(coverageLabels.length).toBeGreaterThan(0);
  });

  it('shows drill count when domain has drills', () => {
    const onSelect = vi.fn();
    render(<ModuleBrowser onSelectModule={onSelect} />);

    const drillLabels = screen.getAllByText('3 drills');
    expect(drillLabels.length).toBeGreaterThan(0);
  });

  it('pins core modules first and shows Core badge when archetype is set', () => {
    mockProfileGet.mockReturnValue({ archetypeId: 'cyber_sentinel', handlerId: 'h-1' });
    const onSelect = vi.fn();
    render(<ModuleBrowser onSelectModule={onSelect} />);

    const tiles = screen.getAllByTestId(/^module-tile-/);
    // cyber_sentinel core: cybersecurity, intelligence, espionage, investigation
    // Order follows DOMAIN_CATALOG: cybersecurity, espionage, intelligence, investigation
    expect(tiles[0].getAttribute('data-testid')).toBe('module-tile-cybersecurity');
    expect(tiles[1].getAttribute('data-testid')).toBe('module-tile-espionage');
    expect(tiles[2].getAttribute('data-testid')).toBe('module-tile-intelligence');
    expect(tiles[3].getAttribute('data-testid')).toBe('module-tile-investigation');

    // Should render Core badges
    const coreBadges = screen.getAllByText('Core');
    expect(coreBadges).toHaveLength(4);

    // Should render Focus badges for secondary modules (agencies, counter_psyops)
    const focusBadges = screen.getAllByText('Focus');
    expect(focusBadges).toHaveLength(2);
  });

  it('renders all 19 tiles unpinned when no archetype is set', () => {
    mockProfileGet.mockReturnValue(null);
    const onSelect = vi.fn();
    render(<ModuleBrowser onSelectModule={onSelect} />);

    const tiles = screen.getAllByTestId(/^module-tile-/);
    expect(tiles).toHaveLength(19);
    expect(screen.queryByText('Core')).toBeNull();
    expect(screen.queryByText('Focus')).toBeNull();
  });
});
