/**
 * ScoreLineChart — Pure SVG line chart showing domain scores over time.
 *
 * Renders a 30-day (configurable) score history for one or more domains.
 * No external charting library — just SVG polylines, axes, and labels.
 */

import React, { useMemo, useState } from 'react';
import type { ScoreDataPoint } from '../../store/ProgressSnapshotStore';
import styles from './ScoreLineChart.module.css';

export interface DomainSeries {
  domainId: string;
  domainName: string;
  color: string;
  data: ScoreDataPoint[];
}

export interface ScoreLineChartProps {
  /** One or more domain series to plot. */
  series: DomainSeries[];
  /** Chart width in pixels (default 600). */
  width?: number;
  /** Chart height in pixels (default 200). */
  height?: number;
  /** Number of days to show. Data is expected to cover this range. */
  days?: number;
}

/* ── Domain color palette ── */
const DOMAIN_COLORS: Record<string, string> = {
  cybersecurity: '#5A7FFF',
  fitness: '#22c55e',
  combat: '#ef4444',
  espionage: '#a855f7',
  intelligence: '#06b6d4',
  martial_arts: '#f97316',
  dance: '#ec4899',
  equations: '#14b8a6',
  psiops: '#8b5cf6',
  war_strategy: '#eab308',
  web_three: '#3b82f6',
  investigation: '#64748b',
  agencies: '#6366f1',
  counter_biochem: '#84cc16',
  counter_psyops: '#f43f5e',
  self_sovereignty: '#d946ef',
  anti_psn: '#0ea5e9',
  anti_tcs_idc_cbc: '#78716c',
  space_force: '#818cf8',
};

export function getDomainColor(domainId: string): string {
  return DOMAIN_COLORS[domainId] ?? '#5A7FFF';
}

const PADDING = { top: 20, right: 16, bottom: 28, left: 36 };

const ScoreLineChart: React.FC<ScoreLineChartProps> = ({
  series,
  width = 600,
  height = 200,
  days = 30,
}) => {
  const [hoveredSeries, setHoveredSeries] = useState<string | null>(null);

  const plotW = width - PADDING.left - PADDING.right;
  const plotH = height - PADDING.top - PADDING.bottom;

  // Date range: last N days
  const dateRange = useMemo(() => {
    const dates: string[] = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
  }, [days]);

  const xScale = (dateIndex: number) =>
    PADDING.left + (dateIndex / Math.max(dateRange.length - 1, 1)) * plotW;

  const yScale = (score: number) =>
    PADDING.top + plotH - (score / 100) * plotH;

  // Build polyline points for each series
  const polylines = useMemo(() => {
    return series.map((s) => {
      const dataMap = new Map(s.data.map((d) => [d.date, d.score]));
      const points: string[] = [];
      let lastScore: number | null = null;

      for (let i = 0; i < dateRange.length; i++) {
        const score = dataMap.get(dateRange[i]);
        if (score !== undefined) {
          points.push(`${xScale(i)},${yScale(score)}`);
          lastScore = score;
        } else if (lastScore !== null) {
          // Carry forward last known score for continuity
          points.push(`${xScale(i)},${yScale(lastScore)}`);
        }
      }

      return {
        domainId: s.domainId,
        domainName: s.domainName,
        color: s.color,
        pointsStr: points.join(' '),
        lastScore,
      };
    });
  }, [series, dateRange, plotW, plotH]);

  // Y-axis ticks
  const yTicks = [0, 25, 50, 75, 100];

  // X-axis labels (show ~5 evenly spaced dates)
  const xLabels = useMemo(() => {
    const step = Math.max(1, Math.floor(dateRange.length / 5));
    const labels: Array<{ index: number; label: string }> = [];
    for (let i = 0; i < dateRange.length; i += step) {
      const d = dateRange[i];
      labels.push({
        index: i,
        label: d.slice(5), // MM-DD
      });
    }
    return labels;
  }, [dateRange]);

  if (series.length === 0 || series.every((s) => s.data.length === 0)) {
    return (
      <div className={styles.chartContainer} data-testid="score-line-chart-empty">
        <p className={styles.emptyMsg}>No score history yet. Complete a drill to start tracking progress.</p>
      </div>
    );
  }

  return (
    <div className={styles.chartContainer} data-testid="score-line-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={styles.svg}
        aria-label="Domain score trend chart"
      >
        {/* Grid lines */}
        {yTicks.map((tick) => (
          <line
            key={tick}
            x1={PADDING.left}
            y1={yScale(tick)}
            x2={width - PADDING.right}
            y2={yScale(tick)}
            className={styles.gridLine}
          />
        ))}

        {/* Y-axis labels */}
        {yTicks.map((tick) => (
          <text
            key={`y-${tick}`}
            x={PADDING.left - 6}
            y={yScale(tick) + 3}
            className={styles.axisLabel}
            textAnchor="end"
          >
            {tick}
          </text>
        ))}

        {/* X-axis labels */}
        {xLabels.map(({ index, label }) => (
          <text
            key={`x-${index}`}
            x={xScale(index)}
            y={height - 6}
            className={styles.axisLabel}
            textAnchor="middle"
          >
            {label}
          </text>
        ))}

        {/* Data lines */}
        {polylines.map((pl) => (
          <polyline
            key={pl.domainId}
            points={pl.pointsStr}
            fill="none"
            stroke={pl.color}
            strokeWidth={hoveredSeries === pl.domainId ? 3 : 2}
            opacity={hoveredSeries && hoveredSeries !== pl.domainId ? 0.3 : 1}
            className={styles.dataLine}
            onMouseEnter={() => setHoveredSeries(pl.domainId)}
            onMouseLeave={() => setHoveredSeries(null)}
          />
        ))}
      </svg>

      {/* Legend */}
      {series.length > 1 && (
        <div className={styles.legend}>
          {polylines.map((pl) => (
            <button
              key={pl.domainId}
              type="button"
              className={styles.legendItem}
              onMouseEnter={() => setHoveredSeries(pl.domainId)}
              onMouseLeave={() => setHoveredSeries(null)}
              style={{ opacity: hoveredSeries && hoveredSeries !== pl.domainId ? 0.4 : 1 }}
            >
              <span className={styles.legendDot} style={{ background: pl.color }} />
              <span className={styles.legendLabel}>{pl.domainName}</span>
              {pl.lastScore !== null && (
                <span className={styles.legendScore}>{pl.lastScore}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScoreLineChart;
