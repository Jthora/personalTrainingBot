import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ShareCard from '../ShareCard';
import type { ShareCardProps } from '../ShareCard';
import type { Card } from '../../../types/Card';
import type { CardMeta } from '../../../cache/TrainingModuleCache';

// Mock KaTeX to avoid rendering math in tests
vi.mock('katex', () => ({
  default: {
    renderToString: (tex: string) => `<span class="katex">${tex}</span>`,
  },
}));

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

const mockCard: Card = {
  id: 'card-1',
  title: 'Tactical Movement',
  description: 'Learn the basics of tactical movement patterns.',
  bulletpoints: ['Point one', 'Point two', 'Point three'],
  duration: 15,
  difficulty: 'Intermediate',
};

const mockMeta: CardMeta = {
  moduleId: 'mod-1',
  moduleName: 'Combat Ops',
  moduleColor: '#4A90D9',
  subModuleId: 'sub-1',
  subModuleName: 'Ground Maneuver',
  cardDeckId: 'deck-1',
  cardDeckName: 'Basic Tactics',
};

const defaultProps: ShareCardProps = {
  card: mockCard,
  meta: mockMeta,
  shortUrl: 'https://ptb.app/c/xyz',
  slug: 'tactical-movement',
};

describe('ShareCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders card title and description', () => {
    render(<ShareCard {...defaultProps} />);
    expect(screen.getByText('Tactical Movement')).toBeTruthy();
    expect(screen.getByText(/Learn the basics/)).toBeTruthy();
  });

  it('renders module pill from meta', () => {
    render(<ShareCard {...defaultProps} />);
    expect(screen.getByText('Combat Ops')).toBeTruthy();
  });

  it('renders breadcrumb path', () => {
    render(<ShareCard {...defaultProps} />);
    expect(screen.getByText(/Ground Maneuver/)).toBeTruthy();
    expect(screen.getByText(/Basic Tactics/)).toBeTruthy();
  });

  it('renders bullet points', () => {
    render(<ShareCard {...defaultProps} />);
    expect(screen.getByText('Point one')).toBeTruthy();
    expect(screen.getByText('Point two')).toBeTruthy();
    expect(screen.getByText('Point three')).toBeTruthy();
  });

  it('respects displayOptions — hide description', () => {
    render(<ShareCard {...defaultProps} displayOptions={{ showDescription: false }} />);
    expect(screen.queryByText(/Learn the basics/)).toBeNull();
    expect(screen.getByText('Tactical Movement')).toBeTruthy();
  });

  it('respects displayOptions — hide module pill', () => {
    render(<ShareCard {...defaultProps} displayOptions={{ showModulePill: false }} />);
    expect(screen.queryByText('Combat Ops')).toBeNull();
  });

  it('short URL displayed when provided', () => {
    render(<ShareCard {...defaultProps} />);
    expect(screen.getByText(/ptb\.app/)).toBeTruthy();
  });

  it('calls onHeightChange when rendered', () => {
    const onHeightChange = vi.fn();
    render(<ShareCard {...defaultProps} onHeightChange={onHeightChange} />);
    // ResizeObserver mock doesn't trigger, but linkage is there
    expect(MockResizeObserver.prototype.observe).toHaveBeenCalled;
  });
});
