import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MissionIntakePanel from '../MissionIntakePanel';

describe('MissionIntakePanel', () => {
  it('renders intake content with title and info blocks', () => {
    render(<MissionIntakePanel onStartBriefing={vi.fn()} onDismiss={vi.fn()} />);
    expect(screen.getByRole('region', { name: 'Mission intake' })).toBeTruthy();
    expect(screen.getByText('Your Training Hub')).toBeTruthy();
    expect(screen.getByText('How it works')).toBeTruthy();
    expect(screen.getByText('Your first session')).toBeTruthy();
    expect(screen.getByText('Track your growth')).toBeTruthy();
  });

  it('calls onStartBriefing and onDismiss callbacks', () => {
    const onStart = vi.fn();
    const onDismiss = vi.fn();
    render(<MissionIntakePanel onStartBriefing={onStart} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: 'Start Training' }));
    expect(onStart).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'Skip' }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
