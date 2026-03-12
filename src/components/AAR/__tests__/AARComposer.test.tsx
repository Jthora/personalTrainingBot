import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import AARComposer from '../AARComposer';
import type { AAREntry } from '../../../store/AARStore';

const makeEntry = (overrides: Partial<AAREntry> = {}): AAREntry => ({
  id: `aar-${Math.random()}`,
  title: 'Test AAR',
  context: 'context',
  actions: 'actions taken',
  outcomes: 'outcomes',
  lessons: 'lessons',
  followups: 'followups',
  owner: 'Operator',
  role: 'ops',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
});

const mockEntries: AAREntry[] = [
  makeEntry({ id: 'aar-1', title: 'First AAR' }),
  makeEntry({ id: 'aar-2', title: 'Second AAR' }),
];

let subscribeCb: ((entries: AAREntry[]) => void) | null = null;

vi.mock('../../../store/AARStore', () => ({
  AARStore: {
    list: vi.fn(() => mockEntries),
    subscribe: vi.fn((cb: (entries: AAREntry[]) => void) => {
      subscribeCb = cb;
      return () => { subscribeCb = null; };
    }),
    create: vi.fn(() => makeEntry({ id: 'aar-new', title: '' })),
    save: vi.fn(),
    exportEntry: vi.fn((id: string) => JSON.stringify({ id, data: 'export' })),
  },
}));

import { AARStore } from '../../../store/AARStore';

describe('AARComposer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    subscribeCb = null;
  });

  it('renders entry list from store', () => {
    render(<AARComposer />);
    expect(screen.getByText('First AAR')).toBeTruthy();
    // Entry picker should exist
    const select = screen.getByLabelText(/Saved entries/i) as HTMLSelectElement;
    expect(select.options.length).toBe(2);
  });

  it('renders form fields when draft exists', () => {
    render(<AARComposer />);
    expect(screen.getByText('Title')).toBeTruthy();
    expect(screen.getByText('Owner')).toBeTruthy();
    expect(screen.getByText('Context')).toBeTruthy();
    expect(screen.getByText('Actions taken')).toBeTruthy();
    expect(screen.getByText('Outcomes')).toBeTruthy();
    expect(screen.getByText('Lessons')).toBeTruthy();
    expect(screen.getByText('Follow-ups')).toBeTruthy();
  });

  it('creating new entry calls AARStore.create', () => {
    render(<AARComposer />);
    const newBtn = screen.getByRole('button', { name: 'New' });
    fireEvent.click(newBtn);
    expect(AARStore.create).toHaveBeenCalled();
  });

  it('save button calls AARStore.save', () => {
    render(<AARComposer />);
    const saveBtn = screen.getByRole('button', { name: /Save locally/i });
    fireEvent.click(saveBtn);
    expect(AARStore.save).toHaveBeenCalled();
  });

  it('export button creates downloadable JSON', () => {
    const createObjectURL = vi.fn(() => 'blob:test');
    const revokeObjectURL = vi.fn();
    globalThis.URL.createObjectURL = createObjectURL;
    globalThis.URL.revokeObjectURL = revokeObjectURL;

    render(<AARComposer />);
    const exportBtn = screen.getByRole('button', { name: /Export JSON/i });
    fireEvent.click(exportBtn);
    expect(AARStore.exportEntry).toHaveBeenCalled();
    expect(createObjectURL).toHaveBeenCalled();
  });

  it('empty state renders "No AAR entries yet."', () => {
    (AARStore.list as ReturnType<typeof vi.fn>).mockReturnValue([]);
    render(<AARComposer />);
    expect(screen.getByText(/No AAR entries yet/i)).toBeTruthy();
  });

  it('editing form field triggers auto-save via debounce', async () => {
    vi.useFakeTimers();
    // Ensure list returns entries for the form to render
    (AARStore.list as ReturnType<typeof vi.fn>).mockReturnValue(mockEntries);
    const { container } = render(<AARComposer />);
    const inputs = container.querySelectorAll('input');
    expect(inputs.length).toBeGreaterThan(0);
    fireEvent.change(inputs[0], { target: { value: 'Updated Title' } });
    await act(async () => {
      vi.advanceTimersByTime(800);
    });
    expect(AARStore.save).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('selecting entry changes active draft', () => {
    (AARStore.list as ReturnType<typeof vi.fn>).mockReturnValue(mockEntries);
    const { container } = render(<AARComposer />);
    const select = screen.getByLabelText(/Saved entries/i) as HTMLSelectElement;
    fireEvent.change(select, { target: { value: 'aar-2' } });
    // After selecting entry 2, the first input field should show its title
    const inputs = container.querySelectorAll('input');
    expect(inputs.length).toBeGreaterThan(0);
    expect((inputs[0] as HTMLInputElement).value).toBe('Second AAR');
  });
});
