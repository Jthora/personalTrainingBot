import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MissionIntakePanel from '../MissionIntakePanel';

describe('MissionIntakePanel', () => {
  it('renders intake content with title and info blocks', () => {
    render(<MissionIntakePanel onStartBriefing={vi.fn()} onDismiss={vi.fn()} />);
    expect(screen.getByRole('region', { name: 'Mission intake' })).toBeTruthy();
    expect(screen.getByText(/Psi Operative Super Hero/)).toBeTruthy();
    expect(screen.getByText('Who this is for')).toBeTruthy();
    expect(screen.getByText('Objective')).toBeTruthy();
    expect(screen.getByText('Session outcome')).toBeTruthy();
  });

  it('calls onStartBriefing and onDismiss callbacks', () => {
    const onStart = vi.fn();
    const onDismiss = vi.fn();
    render(<MissionIntakePanel onStartBriefing={onStart} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: 'Start Briefing' }));
    expect(onStart).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
