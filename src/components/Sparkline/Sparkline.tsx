/**
 * Sparkline — Tiny SVG line for inline trend display.
 *
 * Renders a minimal polyline suitable for embedding inside tiles/lists.
 * No axes, labels, or interactivity — just the shape of the trend.
 */

import React, { useMemo } from 'react';
import type { ScoreDataPoint } from '../../store/ProgressSnapshotStore';

export interface SparklineProps {
  /** Score datapoints sorted by date. */
  data: ScoreDataPoint[];
  /** SVG width (default 60). */
  width?: number;
  /** SVG height (default 20). */
  height?: number;
  /** Stroke color (default var(--accent)). */
  color?: string;
  /** Stroke width (default 1.5). */
  strokeWidth?: number;
}

const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 60,
  height = 20,
  color = '#5A7FFF',
  strokeWidth = 1.5,
}) => {
  const points = useMemo(() => {
    if (data.length === 0) return '';
    const scores = data.map((d) => d.score);
    const min = Math.min(...scores, 0);
    const max = Math.max(...scores, 100);
    const range = max - min || 1;
    const pad = 2; // px padding

    return data
      .map((d, i) => {
        const x = pad + (i / Math.max(data.length - 1, 1)) * (width - pad * 2);
        const y = pad + (1 - (d.score - min) / range) * (height - pad * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [data, width, height]);

  if (data.length < 2) return null;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-label="Score trend"
      data-testid="sparkline"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default Sparkline;
