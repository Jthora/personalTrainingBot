import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Skeleton from '../Skeleton';

describe('Skeleton', () => {
  it('renders container with ARIA busy state', () => {
    render(
      <Skeleton label="Loading test">
        <Skeleton.Line />
        <Skeleton.LineShort />
      </Skeleton>,
    );
    const el = screen.getByRole('status', { name: 'Loading test' });
    expect(el).toBeTruthy();
    expect(el.getAttribute('aria-busy')).toBe('true');
  });

  it('renders all primitive variants', () => {
    const { container } = render(
      <Skeleton>
        <Skeleton.Line />
        <Skeleton.LineShort />
        <Skeleton.LineNarrow />
        <Skeleton.Block />
        <Skeleton.Chip />
        <Skeleton.Row>
          <Skeleton.Chip />
          <Skeleton.Chip />
        </Skeleton.Row>
      </Skeleton>,
    );
    expect(container.querySelector('[class*="line"]')).toBeTruthy();
    expect(container.querySelector('[class*="lineShort"]')).toBeTruthy();
    expect(container.querySelector('[class*="lineNarrow"]')).toBeTruthy();
    expect(container.querySelector('[class*="block"]')).toBeTruthy();
    expect(container.querySelector('[class*="chip"]')).toBeTruthy();
    expect(container.querySelector('[class*="row"]')).toBeTruthy();
  });
});
