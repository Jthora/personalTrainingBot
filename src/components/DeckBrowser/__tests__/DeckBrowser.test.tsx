import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DeckBrowser from '../DeckBrowser';

/* ── Mocks ── */
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

const mockGetTrainingModule = vi.fn();
const mockIsCardDeckSelected = vi.fn(() => true);
const mockToggleCardDeckSelection = vi.fn();
const mockSubscribeToSelectionChanges = vi.fn(() => vi.fn());

vi.mock('../../../cache/TrainingModuleCache', () => ({
  default: {
    getInstance: vi.fn(() => ({
      getTrainingModule: mockGetTrainingModule,
      isCardDeckSelected: mockIsCardDeckSelected,
      toggleCardDeckSelection: mockToggleCardDeckSelection,
      subscribeToSelectionChanges: mockSubscribeToSelectionChanges,
    })),
  },
}));

const mockBuildDrillStepsFromDeck = vi.fn(() => [
  { id: 'step-1', label: 'Card One', cardId: 'card-1' },
  { id: 'step-2', label: 'Card Two', cardId: 'card-2' },
]);
const mockBuildDrillStepsFromModule = vi.fn(() => [
  { id: 'step-1', label: 'Module Card', cardId: 'card-m1' },
]);

vi.mock('../../../utils/drillStepBuilder', () => ({
  buildDrillStepsFromDeck: (...args: unknown[]) => mockBuildDrillStepsFromDeck(...args),
  buildDrillStepsFromModule: (...args: unknown[]) => mockBuildDrillStepsFromModule(...args),
}));

const mockDrillRunStoreStart = vi.fn();
vi.mock('../../../store/DrillRunStore', () => ({
  DrillRunStore: {
    start: (...args: unknown[]) => mockDrillRunStoreStart(...args),
  },
}));

vi.mock('../../../utils/readiness/domainProgress', () => ({
  DOMAIN_CATALOG: [
    { id: 'cybersecurity', name: 'Cybersecurity' },
  ],
}));

const sampleModule = {
  id: 'cybersecurity',
  name: 'Cybersecurity',
  description: 'Cyber ops training',
  color: '#00ff00',
  submodules: [
    {
      id: 'sub-1',
      name: 'Network Defense',
      description: 'Network security fundamentals',
      difficulty: 'Intermediate',
      estimated_time: '2h',
      focus: 'defense',
      cardDecks: [
        {
          id: 'deck-1',
          name: 'Firewall Basics',
          description: 'Introduction to firewalls',
          focus: 'fundamentals',
          cards: [
            {
              id: 'card-1',
              title: 'Packet Filtering',
              description: 'How packet filters work',
              bulletpoints: ['Rule-based', 'Stateless'],
              duration: 5,
              difficulty: 'Standard',
              exercises: [{ type: 'multiple-choice', question: 'What is a firewall?', options: ['A', 'B'], answer: 'A' }],
              learningObjectives: ['Understand packet filtering'],
              keyTerms: ['ACL', 'stateless'],
            },
            {
              id: 'card-2',
              title: 'Stateful Inspection',
              description: 'Stateful firewall techniques',
              bulletpoints: ['Connection tracking'],
              duration: 8,
              difficulty: 'Advanced',
            },
          ],
        },
        {
          id: 'deck-2',
          name: 'IDS/IPS',
          description: 'Intrusion detection and prevention',
          focus: 'detection',
          cards: [
            {
              id: 'card-3',
              title: 'Signature-based Detection',
              description: 'Matching known patterns',
              bulletpoints: [],
              duration: 5,
              difficulty: 'Standard',
            },
          ],
        },
      ],
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  mockGetTrainingModule.mockReturnValue(sampleModule);
});

describe('DeckBrowser', () => {
  it('renders decks for a given module with card counts', () => {
    const onBack = vi.fn();
    const onDrillStarted = vi.fn();
    render(<DeckBrowser moduleId="cybersecurity" onBack={onBack} onDrillStarted={onDrillStarted} />);

    expect(screen.getByTestId('deck-browser')).toBeTruthy();
    expect(screen.getByText('Firewall Basics')).toBeTruthy();
    expect(screen.getByText('IDS/IPS')).toBeTruthy();

    // Deck card counts
    expect(screen.getByText('2 cards')).toBeTruthy();
    expect(screen.getByText('1 cards')).toBeTruthy();
  });

  it('shows card previews with exercise indicators', () => {
    const onBack = vi.fn();
    const onDrillStarted = vi.fn();
    render(<DeckBrowser moduleId="cybersecurity" onBack={onBack} onDrillStarted={onDrillStarted} />);

    expect(screen.getByText('Packet Filtering')).toBeTruthy();
    expect(screen.getByText('Stateful Inspection')).toBeTruthy();
    // Exercise badge: Firewall Basics deck has 1 card with exercises
    expect(screen.getByText('1 with exercises')).toBeTruthy();
  });

  it('renders breadcrumb with back navigation', () => {
    const onBack = vi.fn();
    const onDrillStarted = vi.fn();
    render(<DeckBrowser moduleId="cybersecurity" onBack={onBack} onDrillStarted={onDrillStarted} />);

    const breadcrumbLink = screen.getByText('Training');
    expect(breadcrumbLink).toBeTruthy();
    fireEvent.click(breadcrumbLink);
    expect(onBack).toHaveBeenCalled();
  });

  it('calls DrillRunStore.start when "Train this deck" is clicked', () => {
    const onBack = vi.fn();
    const onDrillStarted = vi.fn();
    render(<DeckBrowser moduleId="cybersecurity" onBack={onBack} onDrillStarted={onDrillStarted} />);

    fireEvent.click(screen.getByTestId('train-deck-deck-1'));
    expect(mockBuildDrillStepsFromDeck).toHaveBeenCalledWith('deck-1');
    expect(mockDrillRunStoreStart).toHaveBeenCalledWith(
      'deck-deck-1',
      'Firewall Basics',
      expect.any(Array),
    );
    expect(onDrillStarted).toHaveBeenCalled();
  });

  it('calls DrillRunStore.start when "Train module" is clicked', () => {
    const onBack = vi.fn();
    const onDrillStarted = vi.fn();
    render(<DeckBrowser moduleId="cybersecurity" onBack={onBack} onDrillStarted={onDrillStarted} />);

    fireEvent.click(screen.getByTestId('train-module-btn'));
    expect(mockBuildDrillStepsFromModule).toHaveBeenCalledWith('cybersecurity', 10);
    expect(mockDrillRunStoreStart).toHaveBeenCalled();
    expect(onDrillStarted).toHaveBeenCalled();
  });

  it('toggles deck selection when checkbox area is clicked', () => {
    const onBack = vi.fn();
    const onDrillStarted = vi.fn();
    render(<DeckBrowser moduleId="cybersecurity" onBack={onBack} onDrillStarted={onDrillStarted} />);

    const checkbox = screen.getByLabelText('Select Firewall Basics');
    fireEvent.click(checkbox.closest('span')!);
    expect(mockToggleCardDeckSelection).toHaveBeenCalledWith('deck-1');
  });

  it('shows empty state when module not loaded', () => {
    mockGetTrainingModule.mockReturnValue(undefined);
    const onBack = vi.fn();
    const onDrillStarted = vi.fn();
    render(<DeckBrowser moduleId="cybersecurity" onBack={onBack} onDrillStarted={onDrillStarted} />);

    expect(screen.getByText(/module not loaded/i)).toBeTruthy();
  });

  /* ── Quiz buttons ── */

  it('renders "Quiz module" button that navigates to module quiz', () => {
    const onBack = vi.fn();
    const onDrillStarted = vi.fn();
    render(<DeckBrowser moduleId="cybersecurity" onBack={onBack} onDrillStarted={onDrillStarted} />);

    const btn = screen.getByTestId('quiz-module-btn');
    expect(btn).toBeTruthy();
    fireEvent.click(btn);
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining('/mission/quiz?module=cybersecurity'),
    );
  });

  it('renders "Quiz this deck" buttons for each deck', () => {
    const onBack = vi.fn();
    const onDrillStarted = vi.fn();
    render(<DeckBrowser moduleId="cybersecurity" onBack={onBack} onDrillStarted={onDrillStarted} />);

    const quizDeck1 = screen.getByTestId('quiz-deck-deck-1');
    const quizDeck2 = screen.getByTestId('quiz-deck-deck-2');
    expect(quizDeck1).toBeTruthy();
    expect(quizDeck2).toBeTruthy();

    fireEvent.click(quizDeck1);
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.stringContaining('/mission/quiz?deck=deck-1'),
    );
  });
});
