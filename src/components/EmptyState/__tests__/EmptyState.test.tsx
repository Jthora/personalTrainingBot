import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import EmptyState from '../EmptyState';

describe('EmptyState', () => {
  it('renders icon, title, and message', () => {
    render(
      <EmptyState icon="🎯" title="No Items" message="Nothing to show right now." />,
    );

    expect(screen.getByText('🎯')).toBeTruthy();
    expect(screen.getByText('No Items')).toBeTruthy();
    expect(screen.getByText('Nothing to show right now.')).toBeTruthy();
  });

  it('renders optional children (CTA)', () => {
    render(
      <EmptyState icon="✅" title="All Done" message="You're caught up.">
        <button>Start Training</button>
      </EmptyState>,
    );

    expect(screen.getByRole('button', { name: 'Start Training' })).toBeTruthy();
  });

  it('has status role for accessibility', () => {
    render(
      <EmptyState icon="📭" title="Empty" message="Nothing here." />,
    );

    expect(screen.getByRole('status')).toBeTruthy();
  });
});
