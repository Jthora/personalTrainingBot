import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MissionKitPanel from '../MissionKitPanel';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));

const mockKit = {
  title: 'Starter Kit',
  synopsis: 'Core drills for Level 3',
  drills: [
    { id: 'd-1', type: 'scenario', difficulty: 2, title: 'Recon Drill', durationMinutes: 15, lastCompleted: null, steps: undefined },
    { id: 'd-2', type: 'tactical', difficulty: 4, title: 'Breach Drill', durationMinutes: 20, lastCompleted: Date.now() - 86400000, steps: [{ id: 's1', label: 'Step 1' }] },
  ],
};

vi.mock('../../../store/MissionKitStore', () => ({
  MissionKitStore: {
    getPrimaryKit: vi.fn(() => mockKit),
    isVisible: vi.fn(() => true),
    setVisible: vi.fn((v: boolean) => v),
    toggleVisible: vi.fn(() => false),
  },
}));

vi.mock('../../../store/DrillRunStore', () => ({
  DrillRunStore: { start: vi.fn() },
}));

import { MissionKitStore } from '../../../store/MissionKitStore';
import { DrillRunStore } from '../../../store/DrillRunStore';

describe('MissionKitPanel', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders kit title, synopsis, and drill cards', () => {
    render(<MissionKitPanel />);
    expect(screen.getByText('Starter Kit')).toBeTruthy();
    expect(screen.getByText('Core drills for Level 3')).toBeTruthy();
    expect(screen.getByText('Recon Drill')).toBeTruthy();
    expect(screen.getByText('Breach Drill')).toBeTruthy();
    expect(screen.getByRole('list', { name: 'Drills' })).toBeTruthy();
  });

  it('shows "New" for uncompleted drill and date for completed', () => {
    render(<MissionKitPanel />);
    expect(screen.getByText('New')).toBeTruthy();
    expect(screen.getByText(/Last:/)).toBeTruthy();
  });

  it('toggle button hides kit via MissionKitStore.toggleVisible', () => {
    render(<MissionKitPanel />);
    fireEvent.click(screen.getByRole('button', { name: 'Hide kit' }));
    expect(MissionKitStore.toggleVisible).toHaveBeenCalled();
  });

  it('Run offline button starts drill and navigates', () => {
    render(<MissionKitPanel />);
    const runBtns = screen.getAllByRole('button', { name: 'Run offline' });
    fireEvent.click(runBtns[0]);
    expect(DrillRunStore.start).toHaveBeenCalledWith('d-1', 'Recon Drill', expect.any(Array));
    expect(mockNavigate).toHaveBeenCalledWith('/training/run');
  });

  it('hidden state shows "Mission kit is hidden" with Show kit button', () => {
    (MissionKitStore.isVisible as ReturnType<typeof vi.fn>).mockReturnValue(false);
    render(<MissionKitPanel />);
    expect(screen.getByText('Mission kit is hidden')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Show kit' }));
    expect(MissionKitStore.setVisible).toHaveBeenCalledWith(true);
  });
});
