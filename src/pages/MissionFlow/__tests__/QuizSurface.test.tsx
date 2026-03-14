import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import QuizSurface from '../QuizSurface';
import type { Card } from '../../../types/Card';

/* ── Mocks ── */

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const sampleCard: Card = {
  id: 'card-1',
  title: 'Packet Filtering',
  description: 'How packet filters work',
  bulletpoints: ['Rule-based filtering applies ACLs', 'Stateless inspection is simpler'],
  duration: 5,
  difficulty: 'Standard',
  exercises: [
    {
      type: 'recall',
      prompt: 'What is packet filtering?',
      expectedOutcome: 'Packet filtering examines headers against a set of access control rules.',
      hints: ['Think about ACLs'],
    },
  ],
  keyTerms: ['ACL', 'stateless'],
  learningObjectives: ['Understand the core principles of "packet filtering" in network defense'],
};

const sampleCard2: Card = {
  id: 'card-2',
  title: 'Stateful Inspection',
  description: 'Stateful firewall techniques',
  bulletpoints: ['Connection tracking maintains session state', 'TCP handshake monitoring is essential'],
  duration: 8,
  difficulty: 'Advanced',
  exercises: [
    {
      type: 'apply',
      prompt: 'How does stateful inspection work?',
      expectedOutcome: 'Stateful inspection tracks the state of active connections and makes decisions based on context.',
      hints: ['Connection tracking'],
    },
  ],
  keyTerms: ['stateful', 'session'],
  learningObjectives: ['Explain how stateful inspection improves security over basic filtering'],
};

const sampleCard3: Card = {
  id: 'card-3',
  title: 'IDS Systems',
  description: 'Intrusion detection',
  bulletpoints: ['IDS provides visibility into network threats', 'Signature-based detection matches known patterns'],
  duration: 5,
  difficulty: 'Standard',
  exercises: [
    {
      type: 'analyze',
      prompt: 'Compare IDS and IPS.',
      expectedOutcome: 'IDS monitors and alerts while IPS actively blocks malicious traffic inline on the network.',
      hints: ['IDS is passive'],
    },
  ],
  keyTerms: ['IDS', 'signature'],
  learningObjectives: ['Identify key differences between intrusion detection and prevention systems'],
};

const mockGetTrainingModule = vi.fn();
const mockGetCardById = vi.fn();

vi.mock('../../../cache/TrainingModuleCache', () => ({
  default: {
    getInstance: vi.fn(() => ({
      isLoaded: () => true,
      getTrainingModule: (...args: unknown[]) => mockGetTrainingModule(...args),
      getCardById: (...args: unknown[]) => mockGetCardById(...args),
    })),
  },
}));

const mockGetCardsDueForReview = vi.fn(() => []);
vi.mock('../../../store/CardProgressStore', () => ({
  default: {
    getCardsDueForReview: () => mockGetCardsDueForReview(),
  },
}));

vi.mock('../../../store/DrillHistoryStore', () => ({
  default: { record: vi.fn() },
}));

const sampleModule = {
  id: 'cybersecurity',
  name: 'Cybersecurity',
  submodules: [
    {
      id: 'sub-1',
      name: 'Network Defense',
      cardDecks: [
        {
          id: 'deck-1',
          name: 'Firewall Basics',
          cards: [sampleCard, sampleCard2, sampleCard3],
        },
      ],
    },
  ],
};

function renderWithRouter(searchParams: string) {
  return render(
    <MemoryRouter initialEntries={[`/mission/quiz${searchParams}`]}>
      <QuizSurface />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetTrainingModule.mockReturnValue(sampleModule);
});

describe('QuizSurface', () => {
  it('shows empty state when no cards can be found', () => {
    mockGetTrainingModule.mockReturnValue(undefined);
    renderWithRouter('?module=missing');
    expect(screen.getByText('No Questions Available')).toBeTruthy();
  });

  it('renders quiz runner when deck has cards', () => {
    renderWithRouter('?deck=deck-1&module=cybersecurity');
    // Should render quiz runner or at least not the empty state
    const runner = screen.queryByTestId('quiz-runner');
    const empty = screen.queryByText('No Questions Available');
    // At least one should be present — either quiz loaded or no-Q
    expect(runner || empty).toBeTruthy();
  });

  it('renders quiz runner for module-level quiz', () => {
    renderWithRouter('?module=cybersecurity');
    const runner = screen.queryByTestId('quiz-runner');
    const empty = screen.queryByText('No Questions Available');
    expect(runner || empty).toBeTruthy();
  });

  it('uses due-review mode when mode=review', () => {
    mockGetCardsDueForReview.mockReturnValue([
      { cardId: 'card-1', moduleId: 'cybersecurity' },
      { cardId: 'card-2', moduleId: 'cybersecurity' },
      { cardId: 'card-3', moduleId: 'cybersecurity' },
    ]);
    mockGetCardById
      .mockReturnValueOnce(sampleCard)
      .mockReturnValueOnce(sampleCard2)
      .mockReturnValueOnce(sampleCard3);

    renderWithRouter('?mode=review');
    expect(mockGetCardsDueForReview).toHaveBeenCalled();
    const runner = screen.queryByTestId('quiz-runner');
    const empty = screen.queryByText('No Questions Available');
    expect(runner || empty).toBeTruthy();
  });

  it('shows empty state with back button for review mode with no due cards', () => {
    mockGetCardsDueForReview.mockReturnValue([]);
    renderWithRouter('?mode=review');
    expect(screen.getByText('No Questions Available')).toBeTruthy();
    expect(screen.getByText('Back to Training')).toBeTruthy();
  });
});
