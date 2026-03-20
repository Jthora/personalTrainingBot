import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SignalsPanel from '../SignalsPanel';
import type { SignalEntry } from '../../../data/signals/sampleSignals';

const makeSig = (overrides: Partial<SignalEntry> = {}): SignalEntry => ({
  id: `sig-${Math.random()}`,
  title: 'Alpha Signal',
  detail: 'Detail text',
  role: 'ops',
  status: 'open',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
});


const mockSignals: SignalEntry[] = [
  makeSig({ id: 'sig-1', title: 'Signal One', role: 'ops', status: 'open' }),
  makeSig({ id: 'sig-2', title: 'Signal Two', role: 'intel', status: 'ack' }),
  makeSig({ id: 'sig-3', title: 'Signal Three', role: 'ops', status: 'resolved' }),
];

vi.mock('../../../store/SignalsStore', () => ({
  SignalsStore: {
    list: vi.fn(() => mockSignals),
    queueLength: vi.fn(() => 0),
    subscribe: vi.fn((_cb: (signals: SignalEntry[], queue: number) => void) => {
      return () => {};
    }),
    add: vi.fn(),
    acknowledge: vi.fn(),
    resolve: vi.fn(),
  },
}));

import { SignalsStore } from '../../../store/SignalsStore';

describe('SignalsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders existing signals from store', () => {
    render(<SignalsPanel />);
    expect(screen.getByText('Signal One')).toBeTruthy();
    expect(screen.getByText('Signal Two')).toBeTruthy();
    expect(screen.getByText('Signal Three')).toBeTruthy();
  });

  it('renders sync status as "Ready" when queue is 0', () => {
    render(<SignalsPanel />);
    expect(screen.getByText('Ready')).toBeTruthy();
  });

  it('renders sync required when queue > 0', () => {
    (SignalsStore.queueLength as ReturnType<typeof vi.fn>).mockReturnValue(3);
    render(<SignalsPanel />);
    expect(screen.getByText(/Sync required: 3 queued/)).toBeTruthy();
  });

  it('role filter shows only matching signals', () => {
    render(<SignalsPanel />);
    const intelButton = screen.getByRole('button', { name: 'Intel' });
    fireEvent.click(intelButton);
    expect(screen.queryByText('Signal One')).toBeNull();
    expect(screen.getByText('Signal Two')).toBeTruthy();
    expect(screen.queryByText('Signal Three')).toBeNull();
  });

  it('create form submits new signal', () => {
    render(<SignalsPanel />);
    const titleInput = screen.getByPlaceholderText('Signal title');
    const detailInput = screen.getByPlaceholderText(/What changed/);
    const submitBtn = screen.getByRole('button', { name: 'Add signal' });

    fireEvent.change(titleInput, { target: { value: 'New Alert' } });
    fireEvent.change(detailInput, { target: { value: 'Something important' } });
    fireEvent.click(submitBtn);

    expect(SignalsStore.add).toHaveBeenCalledWith('New Alert', 'Something important', 'ops');
  });

  it('create form validates required fields', () => {
    render(<SignalsPanel />);
    const submitBtn = screen.getByRole('button', { name: 'Add signal' });
    fireEvent.click(submitBtn);
    // add should not be called with empty fields
    expect(SignalsStore.add).not.toHaveBeenCalled();
  });

  it('acknowledge button calls store.acknowledge', () => {
    render(<SignalsPanel />);
    const ackButtons = screen.getAllByRole('button', { name: 'Acknowledge' });
    // First signal is 'open' — acknowledge should be enabled
    fireEvent.click(ackButtons[0]);
    expect(SignalsStore.acknowledge).toHaveBeenCalledWith('sig-1');
  });

  it('resolve button calls store.resolve', () => {
    render(<SignalsPanel />);
    const resolveButtons = screen.getAllByRole('button', { name: 'Resolve' });
    fireEvent.click(resolveButtons[0]);
    expect(SignalsStore.resolve).toHaveBeenCalledWith('sig-1');
  });

  it('empty state renders when no signals match filter', () => {
    (SignalsStore.list as ReturnType<typeof vi.fn>).mockReturnValue([]);
    render(<SignalsPanel />);
    expect(screen.getByText(/No signals match/)).toBeTruthy();
  });
});
