import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DrillRunner from '../DrillRunner';

/* ── Mocks ── */
const { mockDrillRunStore } = vi.hoisted(() => ({
  mockDrillRunStore: {
    get: vi.fn(() => null) as any,
    subscribe: vi.fn((cb: (s: null) => void) => {
      cb(null as any);
      return vi.fn();
    }),
    start: vi.fn(),
    toggleStep: vi.fn(),
    clear: vi.fn(),
  },
}));
vi.mock('../../../store/DrillRunStore', () => ({
  DrillRunStore: mockDrillRunStore,
}));

vi.mock('../../../store/MissionKitStore', () => ({
  MissionKitStore: {
    getPrimaryKit: vi.fn(() => ({
      id: 'kit-1',
      title: 'Test Kit',
      drills: [
        {
          id: 'drill-1',
          title: 'Drill Alpha',
          type: 'rapid-response',
          difficulty: 3,
          durationMinutes: 18,
          steps: [
            { id: 'step-1', label: 'Step one' },
            { id: 'step-2', label: 'Step two' },
          ],
        },
      ],
    })),
    recordDrillCompletion: vi.fn(),
  },
}));

vi.mock('../../../hooks/useMissionSchedule', () => ({
  default: () => ({
    schedule: null,
    completeCurrentDrill: vi.fn(),
  }),
}));

const { mockDrillHistoryRecord, mockStatsForDrill, mockLastForDrill } = vi.hoisted(() => ({
  mockDrillHistoryRecord: vi.fn(),
  mockStatsForDrill: vi.fn(() => ({ runs: 0, avgElapsedSec: 0, bestElapsedSec: 0, avgAssessment: null })),
  mockLastForDrill: vi.fn(() => null),
}));

vi.mock('../../../store/DrillHistoryStore', () => ({
  default: {
    record: mockDrillHistoryRecord,
    statsForDrill: mockStatsForDrill,
    lastForDrill: mockLastForDrill,
  },
}));

const { mockGetCardById, mockGetCardMeta, mockIsLoaded } = vi.hoisted(() => ({
  mockGetCardById: vi.fn(() => undefined) as any,
  mockGetCardMeta: vi.fn(() => undefined) as any,
  mockIsLoaded: vi.fn(() => false) as any,
}));

vi.mock('../../../cache/TrainingModuleCache', () => ({
  default: {
    getInstance: vi.fn(() => ({
      getCardById: mockGetCardById,
      getCardMeta: mockGetCardMeta,
      isLoaded: mockIsLoaded,
    })),
  },
}));

vi.mock('../../../utils/telemetry', () => ({
  trackEvent: vi.fn(),
}));

vi.mock('../../../utils/drillStepBuilder', () => ({
  buildDrillStepsFromModule: vi.fn(() => []),
}));

vi.mock('../../../config/featureFlags', () => ({
  isFeatureEnabled: vi.fn((flag: string) => flag === 'drillRunnerUpgrade'),
}));

const { mockProfileGet } = vi.hoisted(() => ({
  mockProfileGet: vi.fn(() => null) as any,
}));
vi.mock('../../../store/OperativeProfileStore', () => ({
  default: {
    get: mockProfileGet,
    set: vi.fn(),
    patch: vi.fn(),
    reset: vi.fn(),
    subscribe: vi.fn(() => vi.fn()),
  },
}));

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();
  mockDrillRunStore.get.mockReturnValue(null);
  mockProfileGet.mockReturnValue(null);
  // Clear fast-path flag
  window.localStorage.removeItem('mission:fast-path:v1');
});

afterEach(() => {
  vi.useRealTimers();
});

describe('DrillRunner', () => {
  it('renders empty state when no active run', () => {
    render(<DrillRunner />);
    expect(screen.getByText('No active drill')).toBeTruthy();
    expect(screen.getByText('Start drill')).toBeTruthy();
  });

  it('renders drill steps when run is active', () => {
    mockDrillRunStore.get.mockReturnValue({
      drillId: 'drill-1',
      title: 'Drill Alpha',
      steps: [
        { id: 'step-1', label: 'Step one', done: false },
        { id: 'step-2', label: 'Step two', done: false },
      ],
      startedAt: Date.now(),
      updatedAt: Date.now(),
      completed: false,
    });
    mockDrillRunStore.subscribe.mockImplementation((cb: any) => {
      cb(mockDrillRunStore.get());
      return vi.fn();
    });

    render(<DrillRunner />);
    expect(screen.getByText('Drill Alpha')).toBeTruthy();
    expect(screen.getByText('Step one')).toBeTruthy();
    expect(screen.getByText('Step two')).toBeTruthy();
  });

  it('shows timer display when enhanced and drill active', () => {
    mockDrillRunStore.get.mockReturnValue({
      drillId: 'drill-1',
      title: 'Drill Alpha',
      steps: [{ id: 'step-1', label: 'Step one', done: false }],
      startedAt: Date.now(),
      updatedAt: Date.now(),
      completed: false,
    });
    mockDrillRunStore.subscribe.mockImplementation((cb: any) => {
      cb(mockDrillRunStore.get());
      return vi.fn();
    });

    render(<DrillRunner />);
    expect(screen.getByTestId('timer-display')).toBeTruthy();
    expect(screen.getByText('Elapsed')).toBeTruthy();
  });

  it('shows engagement warning when drill completed too quickly', () => {
    mockDrillRunStore.get.mockReturnValue({
      drillId: 'drill-1',
      title: 'Drill Alpha',
      steps: [{ id: 'step-1', label: 'Step one', done: true }],
      startedAt: Date.now(),
      updatedAt: Date.now(),
      completed: true,
    });
    mockDrillRunStore.subscribe.mockImplementation((cb: any) => {
      cb(mockDrillRunStore.get());
      return vi.fn();
    });

    render(<DrillRunner />);
    // With timer at 0 and 1 step (min 15s), engagement warning should appear
    expect(screen.getByTestId('engagement-warning')).toBeTruthy();
    expect(screen.getByText(/Did you review the card content/i)).toBeTruthy();
  });

  it('shows reflection form after dismissing engagement warning', () => {
    mockDrillRunStore.get.mockReturnValue({
      drillId: 'drill-1',
      title: 'Drill Alpha',
      steps: [{ id: 'step-1', label: 'Step one', done: true }],
      startedAt: Date.now(),
      updatedAt: Date.now(),
      completed: true,
    });
    mockDrillRunStore.subscribe.mockImplementation((cb: any) => {
      cb(mockDrillRunStore.get());
      return vi.fn();
    });

    render(<DrillRunner />);
    // Dismiss engagement warning
    fireEvent.click(screen.getByText('Yes, continue to reflection'));
    // Enhanced mode now shows reflection form
    expect(screen.getByTestId('drill-reflection')).toBeTruthy();
    expect(screen.getByText(/reflect before recording/i)).toBeTruthy();
  });

  it('transitions to rest interval after recording from reflection form', () => {
    mockDrillRunStore.get.mockReturnValue({
      drillId: 'drill-1',
      title: 'Drill Alpha',
      steps: [{ id: 'step-1', label: 'Step one', done: true }],
      startedAt: Date.now(),
      updatedAt: Date.now(),
      completed: true,
    });
    mockDrillRunStore.subscribe.mockImplementation((cb: any) => {
      cb(mockDrillRunStore.get());
      return vi.fn();
    });

    render(<DrillRunner />);
    // Dismiss engagement warning
    fireEvent.click(screen.getByText('Yes, continue to reflection'));
    // Select required self-assessment
    fireEvent.click(screen.getByLabelText('Rate 4 out of 5'));
    // Click "Record drill" to finalize
    fireEvent.click(screen.getByText('Record drill'));
    // After recording, rest interval should appear
    expect(screen.getByTestId('rest-interval')).toBeTruthy();
  });

  // ── Expandable card content ──

  it('shows card content by default when step has cardId and card is found', () => {
    mockGetCardById.mockImplementation((id: string) =>
      id === 'card-1'
        ? { id: 'card-1', title: 'Card One', description: 'Test description', bulletpoints: ['Point A', 'Point B'], duration: 10, difficulty: 'Standard', summaryText: 'A test summary' }
        : undefined
    );

    mockDrillRunStore.get.mockReturnValue({
      drillId: 'drill-1',
      title: 'Drill Alpha',
      steps: [
        { id: 'step-1', label: 'Step with card', done: false, cardId: 'card-1' },
        { id: 'step-2', label: 'Step without card', done: false },
      ],
      startedAt: Date.now(),
      updatedAt: Date.now(),
      completed: false,
    });
    mockDrillRunStore.subscribe.mockImplementation((cb: any) => {
      cb(mockDrillRunStore.get());
      return vi.fn();
    });

    render(<DrillRunner />);
    // Card content visible by default (steps start expanded)
    expect(screen.getByText('Test description')).toBeTruthy();
    expect(screen.getByText('Point A')).toBeTruthy();
    expect(screen.getByText('Point B')).toBeTruthy();
    expect(screen.getByText('A test summary')).toBeTruthy();

    // Step with cardId should have collapse toggle (already expanded)
    const toggles = screen.getAllByLabelText('Collapse card content');
    expect(toggles).toHaveLength(1);

    // Collapse hides content
    fireEvent.click(toggles[0]);
    expect(screen.queryByText('Test description')).toBeNull();
  });

  it('steps without cardId render as plain checkboxes (no expand toggle)', () => {
    mockDrillRunStore.get.mockReturnValue({
      drillId: 'drill-1',
      title: 'Drill Alpha',
      steps: [
        { id: 'step-1', label: 'Plain step', done: false },
      ],
      startedAt: Date.now(),
      updatedAt: Date.now(),
      completed: false,
    });
    mockDrillRunStore.subscribe.mockImplementation((cb: any) => {
      cb(mockDrillRunStore.get());
      return vi.fn();
    });

    render(<DrillRunner />);
    expect(screen.getByText('Plain step')).toBeTruthy();
    expect(screen.queryByLabelText('Expand card content')).toBeNull();
  });

  // ── Notes and self-assessment in reflection form ──

  it('reflection form accepts notes and requires self-assessment', () => {
    mockDrillRunStore.get.mockReturnValue({
      drillId: 'drill-1',
      title: 'Drill Alpha',
      steps: [{ id: 'step-1', label: 'Step one', done: true }],
      startedAt: Date.now(),
      updatedAt: Date.now(),
      completed: true,
    });
    mockDrillRunStore.subscribe.mockImplementation((cb: any) => {
      cb(mockDrillRunStore.get());
      return vi.fn();
    });

    render(<DrillRunner />);
    // Dismiss engagement warning
    fireEvent.click(screen.getByText('Yes, continue to reflection'));

    // Record drill button should be disabled without self-assessment
    const recordBtn = screen.getByText('Record drill');
    expect(recordBtn.hasAttribute('disabled')).toBe(true);

    // Fill in notes
    const textarea = screen.getByPlaceholderText(/what did you learn/i);
    fireEvent.change(textarea, { target: { value: 'Great drill session' } });
    expect((textarea as HTMLTextAreaElement).value).toBe('Great drill session');

    // Select a rating (required)
    const ratingBtn = screen.getByLabelText('Rate 4 out of 5');
    fireEvent.click(ratingBtn);
    expect(ratingBtn.getAttribute('aria-pressed')).toBe('true');

    // Now Record drill should be enabled
    expect(recordBtn.hasAttribute('disabled')).toBe(false);
    fireEvent.click(recordBtn);
    expect(screen.getByTestId('rest-interval')).toBeTruthy();
  });

  // ── Learning objectives rendering ──

  it('renders learning objectives when card has them (default expanded)', () => {
    mockGetCardById.mockImplementation((id: string) =>
      id === 'card-obj'
        ? {
            id: 'card-obj',
            title: 'Card With Objectives',
            description: 'Desc',
            bulletpoints: [],
            duration: 5,
            difficulty: 'Standard',
            summaryText: '',
            learningObjectives: ['Understand threat modeling', 'Apply STRIDE framework'],
            keyTerms: [],
          }
        : undefined
    );

    mockDrillRunStore.get.mockReturnValue({
      drillId: 'drill-1',
      title: 'Drill Alpha',
      steps: [
        { id: 'step-1', label: 'Objectives step', done: false, cardId: 'card-obj' },
      ],
      startedAt: Date.now(),
      updatedAt: Date.now(),
      completed: false,
    });
    mockDrillRunStore.subscribe.mockImplementation((cb: any) => {
      cb(mockDrillRunStore.get());
      return vi.fn();
    });

    render(<DrillRunner />);
    // Content visible by default (steps start expanded)
    expect(screen.getByTestId('objectives-step-1')).toBeTruthy();
    expect(screen.getByText('Learning Objectives')).toBeTruthy();
    expect(screen.getByText('Understand threat modeling')).toBeTruthy();
    expect(screen.getByText('Apply STRIDE framework')).toBeTruthy();
  });

  // ── Key terms rendering ──

  it('renders key terms when card has them (default expanded)', () => {
    mockGetCardById.mockImplementation((id: string) =>
      id === 'card-terms'
        ? {
            id: 'card-terms',
            title: 'Card With Terms',
            description: 'Desc',
            bulletpoints: [],
            duration: 5,
            difficulty: 'Standard',
            summaryText: '',
            learningObjectives: [],
            keyTerms: ['OSINT', 'HUMINT', 'SIGINT'],
          }
        : undefined
    );

    mockDrillRunStore.get.mockReturnValue({
      drillId: 'drill-1',
      title: 'Drill Alpha',
      steps: [
        { id: 'step-1', label: 'Terms step', done: false, cardId: 'card-terms' },
      ],
      startedAt: Date.now(),
      updatedAt: Date.now(),
      completed: false,
    });
    mockDrillRunStore.subscribe.mockImplementation((cb: any) => {
      cb(mockDrillRunStore.get());
      return vi.fn();
    });

    render(<DrillRunner />);
    // Content visible by default (steps start expanded)
    expect(screen.getByTestId('keyterms-step-1')).toBeTruthy();
    expect(screen.getByText('Key Terms')).toBeTruthy();
    expect(screen.getByText('OSINT')).toBeTruthy();
    expect(screen.getByText('HUMINT')).toBeTruthy();
    expect(screen.getByText('SIGINT')).toBeTruthy();
  });

  it('omits objectives and terms sections when card lacks them (default expanded)', () => {
    mockGetCardById.mockImplementation((id: string) =>
      id === 'card-plain'
        ? {
            id: 'card-plain',
            title: 'Plain Card',
            description: 'Desc',
            bulletpoints: ['Bullet'],
            duration: 5,
            difficulty: 'Standard',
            summaryText: 'Summary',
          }
        : undefined
    );

    mockDrillRunStore.get.mockReturnValue({
      drillId: 'drill-1',
      title: 'Drill Alpha',
      steps: [
        { id: 'step-1', label: 'Plain card step', done: false, cardId: 'card-plain' },
      ],
      startedAt: Date.now(),
      updatedAt: Date.now(),
      completed: false,
    });
    mockDrillRunStore.subscribe.mockImplementation((cb: any) => {
      cb(mockDrillRunStore.get());
      return vi.fn();
    });

    render(<DrillRunner />);
    // Content visible by default — verify card content shows but no objectives/terms
    expect(screen.getByText('Desc')).toBeTruthy();
    expect(screen.queryByTestId('objectives-step-1')).toBeNull();
    expect(screen.queryByTestId('keyterms-step-1')).toBeNull();
  });

  // ── Domain ID resolution via card metadata ──

  it('passes resolved domainId from card metadata when recording drill', () => {
    mockIsLoaded.mockReturnValue(true);
    mockGetCardMeta.mockImplementation((id: string) =>
      id === 'card-cyber'
        ? { moduleId: 'cybersecurity', moduleName: 'Cybersecurity', submoduleId: 'sub-1', deckId: 'deck-1' }
        : undefined
    );

    mockDrillRunStore.get.mockReturnValue({
      drillId: 'drill-1',
      title: 'Drill Alpha',
      steps: [{ id: 'step-1', label: 'Cyber step', done: true, cardId: 'card-cyber' }],
      startedAt: Date.now(),
      updatedAt: Date.now(),
      completed: true,
    });
    mockDrillRunStore.subscribe.mockImplementation((cb: any) => {
      cb(mockDrillRunStore.get());
      return vi.fn();
    });

    render(<DrillRunner />);
    // Dismiss engagement warning → select self-assessment → record
    fireEvent.click(screen.getByText('Yes, continue to reflection'));
    fireEvent.click(screen.getByLabelText('Rate 4 out of 5'));
    fireEvent.click(screen.getByText('Record drill'));

    expect(mockDrillHistoryRecord).toHaveBeenCalledWith(
      expect.objectContaining({ domainId: 'cybersecurity' })
    );
  });

  it('passes undefined domainId when steps lack cardId', () => {
    mockIsLoaded.mockReturnValue(true);
    mockGetCardMeta.mockReturnValue(undefined);

    mockDrillRunStore.get.mockReturnValue({
      drillId: 'drill-1',
      title: 'Drill Alpha',
      steps: [{ id: 'step-1', label: 'Generic step', done: true }],
      startedAt: Date.now(),
      updatedAt: Date.now(),
      completed: true,
    });
    mockDrillRunStore.subscribe.mockImplementation((cb: any) => {
      cb(mockDrillRunStore.get());
      return vi.fn();
    });

    render(<DrillRunner />);
    // Dismiss engagement warning → select self-assessment → record
    fireEvent.click(screen.getByText('Yes, continue to reflection'));
    fireEvent.click(screen.getByLabelText('Rate 4 out of 5'));
    fireEvent.click(screen.getByText('Record drill'));

    expect(mockDrillHistoryRecord).toHaveBeenCalledWith(
      expect.objectContaining({ domainId: undefined })
    );
  });

  // ── 5.4.1.7: Post-drill archetype prompt ──

  it('shows archetype prompt after first drill for fast-path users', () => {
    // Simulate fast-path user (no profile, fast-path flag set)
    window.localStorage.setItem('mission:fast-path:v1', 'active');
    mockProfileGet.mockReturnValue(null);

    mockDrillRunStore.get.mockReturnValue({
      drillId: 'drill-1',
      title: 'Drill Alpha',
      steps: [{ id: 'step-1', label: 'Step one', done: true }],
      startedAt: Date.now(),
      updatedAt: Date.now(),
      completed: true,
    });
    mockDrillRunStore.subscribe.mockImplementation((cb: any) => {
      cb(mockDrillRunStore.get());
      return vi.fn();
    });

    render(<DrillRunner />);
    // Dismiss engagement warning → select self-assessment → record
    fireEvent.click(screen.getByText('Yes, continue to reflection'));
    fireEvent.click(screen.getByLabelText('Rate 4 out of 5'));
    fireEvent.click(screen.getByText('Record drill'));

    // Archetype prompt should appear instead of rest interval
    expect(screen.getByTestId('post-drill-archetype-prompt')).toBeTruthy();
    expect(screen.queryByTestId('rest-interval')).toBeNull();
  });

  it('skips archetype prompt when user already has a profile', () => {
    window.localStorage.setItem('mission:fast-path:v1', 'active');
    mockProfileGet.mockReturnValue({
      archetypeId: 'rescue_ranger',
      handlerId: 'handler-1',
      callsign: 'Test',
      enrolledAt: '2025-01-01',
    });

    mockDrillRunStore.get.mockReturnValue({
      drillId: 'drill-1',
      title: 'Drill Alpha',
      steps: [{ id: 'step-1', label: 'Step one', done: true }],
      startedAt: Date.now(),
      updatedAt: Date.now(),
      completed: true,
    });
    mockDrillRunStore.subscribe.mockImplementation((cb: any) => {
      cb(mockDrillRunStore.get());
      return vi.fn();
    });

    render(<DrillRunner />);
    // Dismiss engagement warning → select self-assessment → record
    fireEvent.click(screen.getByText('Yes, continue to reflection'));
    fireEvent.click(screen.getByLabelText('Rate 4 out of 5'));
    fireEvent.click(screen.getByText('Record drill'));

    // Should go straight to rest, not archetype prompt
    expect(screen.queryByTestId('post-drill-archetype-prompt')).toBeNull();
    expect(screen.getByTestId('rest-interval')).toBeTruthy();
  });

  it('skips archetype prompt when fast-path flag is not set', () => {
    // No fast-path flag
    mockProfileGet.mockReturnValue(null);

    mockDrillRunStore.get.mockReturnValue({
      drillId: 'drill-1',
      title: 'Drill Alpha',
      steps: [{ id: 'step-1', label: 'Step one', done: true }],
      startedAt: Date.now(),
      updatedAt: Date.now(),
      completed: true,
    });
    mockDrillRunStore.subscribe.mockImplementation((cb: any) => {
      cb(mockDrillRunStore.get());
      return vi.fn();
    });

    render(<DrillRunner />);
    // Dismiss engagement warning → select self-assessment → record
    fireEvent.click(screen.getByText('Yes, continue to reflection'));
    fireEvent.click(screen.getByLabelText('Rate 4 out of 5'));
    fireEvent.click(screen.getByText('Record drill'));

    // Should go straight to rest, not archetype prompt
    expect(screen.queryByTestId('post-drill-archetype-prompt')).toBeNull();
    expect(screen.getByTestId('rest-interval')).toBeTruthy();
  });
});