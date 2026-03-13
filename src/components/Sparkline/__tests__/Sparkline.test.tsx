import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Sparkline from '../Sparkline';

describe('Sparkline', () => {
  it('renders SVG polyline for multiple datapoints', () => {
    const data = [
      { date: '2026-03-06', score: 30 },
      { date: '2026-03-07', score: 45 },
      { date: '2026-03-08', score: 40 },
      { date: '2026-03-09', score: 55 },
      { date: '2026-03-10', score: 60 },
    ];
    const { container } = render(<Sparkline data={data} />);
    expect(screen.getByTestId('sparkline')).toBeTruthy();
    const polyline = container.querySelector('polyline');
    expect(polyline).toBeTruthy();
    expect(polyline!.getAttribute('points')).toBeTruthy();
  });

  it('returns null when fewer than 2 datapoints', () => {
    const { container } = render(<Sparkline data={[{ date: '2026-03-10', score: 50 }]} />);
    expect(container.innerHTML).toBe('');
  });

  it('returns null for empty data', () => {
    const { container } = render(<Sparkline data={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('applies custom color and dimensions', () => {
    const data = [
      { date: '2026-03-09', score: 20 },
      { date: '2026-03-10', score: 80 },
    ];
    const { container } = render(
      <Sparkline data={data} width={100} height={30} color="#ff0000" strokeWidth={2} />,
    );
    const svg = container.querySelector('svg');
    expect(svg!.getAttribute('width')).toBe('100');
    expect(svg!.getAttribute('height')).toBe('30');
    const polyline = container.querySelector('polyline');
    expect(polyline!.getAttribute('stroke')).toBe('#ff0000');
    expect(polyline!.getAttribute('stroke-width')).toBe('2');
  });
});
