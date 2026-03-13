import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateMissionKit } from '../missionKitGenerator';

/* ── Mocks ── */
const mockIsLoaded = vi.fn(() => true);
const mockIsModuleSelected = vi.fn(() => true);
const mockGetModuleStats = vi.fn(() => ({ totalCards: 50, totalDecks: 5 }));
const mockSubscribeToSelectionChanges = vi.fn(() => vi.fn());

vi.mock('../../cache/TrainingModuleCache', () => ({
  default: {
    getInstance: vi.fn(() => ({
      isLoaded: mockIsLoaded,
      isModuleSelected: mockIsModuleSelected,
      getModuleStats: mockGetModuleStats,
      cache: new Map(),
      selectedModules: new Set(['cybersecurity', 'combat', 'fitness']),
      selectedSubModules: new Set(),
      selectedCardDecks: new Set(),
      selectedCards: new Set(),
      subscribeToSelectionChanges: mockSubscribeToSelectionChanges,
      getTrainingModule: vi.fn(),
    })),
  },
}));

vi.mock('../../store/OperativeProfileStore', () => ({
  default: {
    get: vi.fn(() => ({ archetypeId: 'shadow_agent' })),
  },
}));

vi.mock('../../data/archetypes', () => ({
  findArchetype: vi.fn(() => ({
    id: 'shadow_agent',
    name: 'Shadow Agent',
    coreModules: ['cybersecurity', 'espionage'],
    secondaryModules: ['intelligence', 'combat'],
  })),
}));

vi.mock('../drillStepBuilder', () => ({
  buildDrillStepsFromModule: vi.fn((moduleId: string, maxCards: number) =>
    Array.from({ length: Math.min(maxCards, 5) }, (_, i) => ({
      id: `step-${moduleId}-${i}`,
      label: `Card ${i} from ${moduleId}`,
      cardId: `card-${moduleId}-${i}`,
    }))
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockIsLoaded.mockReturnValue(true);
  mockIsModuleSelected.mockReturnValue(true);
  mockGetModuleStats.mockReturnValue({ totalCards: 50, totalDecks: 5 });
});

describe('missionKitGenerator', () => {
  it('generates a kit with drills from multiple modules', () => {
    const kit = generateMissionKit(3);
    expect(kit).not.toBeNull();
    expect(kit!.drills).toHaveLength(3);
    expect(kit!.id).toMatch(/^generated-kit-/);
    expect(kit!.title).toBe('Dynamic Training Kit');
  });

  it('each generated drill has moduleId and cardId-bearing steps', () => {
    const kit = generateMissionKit(2);
    expect(kit).not.toBeNull();
    for (const drill of kit!.drills) {
      expect(drill.moduleId).toBeDefined();
      expect(drill.steps).toBeDefined();
      expect(drill.steps!.length).toBeGreaterThan(0);
      expect(drill.steps![0].cardId).toBeDefined();
    }
  });

  it('returns null when cache not loaded', () => {
    mockIsLoaded.mockReturnValue(false);
    expect(generateMissionKit()).toBeNull();
  });

  it('returns null when no modules selected', () => {
    mockIsModuleSelected.mockReturnValue(false);
    expect(generateMissionKit()).toBeNull();
  });

  it('returns null when selected modules have no cards', () => {
    mockGetModuleStats.mockReturnValue({ totalCards: 0, totalDecks: 0 });
    expect(generateMissionKit()).toBeNull();
  });

  it('defaults to 4 drills', () => {
    const kit = generateMissionKit();
    expect(kit).not.toBeNull();
    expect(kit!.drills).toHaveLength(4);
  });
});
