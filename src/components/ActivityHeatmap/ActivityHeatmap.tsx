/**
 * ActivityHeatmap — GitHub-style 90-day activity grid.
 *
 * Color intensity = drills + cards reviewed per day.
 * Renders a 13-week × 7-day grid with tooltip on hover/tap.
 */

import React, { useMemo, useState } from 'react';
import DrillHistoryStore from '../../store/DrillHistoryStore';
import CardProgressStore from '../../store/CardProgressStore';
import styles from './ActivityHeatmap.module.css';

interface DayData {
  date: string;
  drills: number;
  cards: number;
  total: number;
}

/** Map total activity count to intensity level (0-4). */
function intensityLevel(total: number): number {
  if (total === 0) return 0;
  if (total <= 1) return 1;
  if (total <= 3) return 2;
  if (total <= 6) return 3;
  return 4;
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const CELL_SIZE = 12;
const CELL_GAP = 2;
const WEEKS = 13;
const DAYS_PER_WEEK = 7;
const TOTAL_DAYS = WEEKS * DAYS_PER_WEEK; // 91

const ActivityHeatmap: React.FC = () => {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; data: DayData } | null>(null);

  const dayGrid = useMemo(() => {
    // Build date → drillCount map
    const drillMap = new Map<string, number>();
    for (const entry of DrillHistoryStore.list()) {
      const date = entry.completedAt.slice(0, 10);
      drillMap.set(date, (drillMap.get(date) ?? 0) + 1);
    }

    // Build date → cardCount map
    const cardMap = new Map<string, number>();
    for (const entry of CardProgressStore.list()) {
      const date = entry.lastReviewedAt?.slice(0, 10);
      if (date) {
        cardMap.set(date, (cardMap.get(date) ?? 0) + 1);
      }
    }

    // Generate grid: 91 days ending today
    const grid: DayData[] = [];
    const now = new Date();
    for (let i = TOTAL_DAYS - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const drills = drillMap.get(iso) ?? 0;
      const cards = cardMap.get(iso) ?? 0;
      grid.push({ date: iso, drills, cards, total: drills + cards });
    }

    return grid;
  }, []);

  // Split into weeks (columns)
  const columns: DayData[][] = [];
  for (let w = 0; w < WEEKS; w++) {
    columns.push(dayGrid.slice(w * DAYS_PER_WEEK, (w + 1) * DAYS_PER_WEEK));
  }

  const svgWidth = WEEKS * (CELL_SIZE + CELL_GAP) + 24; // 24px left margin for day labels
  const svgHeight = DAYS_PER_WEEK * (CELL_SIZE + CELL_GAP) + 4;

  const handleCellEnter = (e: React.MouseEvent, data: DayData) => {
    const rect = (e.target as SVGElement).getBoundingClientRect();
    setTooltip({ x: rect.left + rect.width / 2, y: rect.top - 4, data });
  };

  const handleCellLeave = () => setTooltip(null);

  const handleCellClick = (e: React.MouseEvent, data: DayData) => {
    if (tooltip?.data.date === data.date) {
      setTooltip(null);
    } else {
      const rect = (e.target as SVGElement).getBoundingClientRect();
      setTooltip({ x: rect.left + rect.width / 2, y: rect.top - 4, data });
    }
  };

  // Month labels on top
  const monthLabels = useMemo(() => {
    const labels: Array<{ weekIndex: number; label: string }> = [];
    let lastMonth = '';
    for (let w = 0; w < columns.length; w++) {
      const firstDay = columns[w][0];
      if (firstDay) {
        const month = new Date(firstDay.date).toLocaleString('en', { month: 'short' });
        if (month !== lastMonth) {
          labels.push({ weekIndex: w, label: month });
          lastMonth = month;
        }
      }
    }
    return labels;
  }, [columns]);

  return (
    <div className={styles.heatmapContainer} data-testid="activity-heatmap">
      <h3 className={styles.heading}>Activity</h3>

      {/* Month labels */}
      <div className={styles.monthRow} style={{ paddingLeft: 24 }}>
        {monthLabels.map(({ weekIndex, label }) => (
          <span
            key={`${label}-${weekIndex}`}
            className={styles.monthLabel}
            style={{ left: 24 + weekIndex * (CELL_SIZE + CELL_GAP) }}
          >
            {label}
          </span>
        ))}
      </div>

      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className={styles.svg}
        aria-label="Activity heatmap — last 90 days"
      >
        {/* Day labels (Mon, Wed, Fri) */}
        {[1, 3, 5].map((dayIdx) => (
          <text
            key={dayIdx}
            x={0}
            y={dayIdx * (CELL_SIZE + CELL_GAP) + CELL_SIZE - 2}
            className={styles.dayLabel}
          >
            {DAY_NAMES[dayIdx].charAt(0)}
          </text>
        ))}

        {/* Cells */}
        {columns.map((week, wIdx) =>
          week.map((day, dIdx) => (
            <rect
              key={day.date}
              x={24 + wIdx * (CELL_SIZE + CELL_GAP)}
              y={dIdx * (CELL_SIZE + CELL_GAP)}
              width={CELL_SIZE}
              height={CELL_SIZE}
              rx={2}
              className={styles[`level${intensityLevel(day.total)}`] ?? styles.level0}
              data-testid={`cell-${day.date}`}
              onMouseEnter={(e) => handleCellEnter(e, day)}
              onMouseLeave={handleCellLeave}
              onClick={(e) => handleCellClick(e, day)}
            />
          )),
        )}
      </svg>

      {/* Tooltip (portal-less, positioned absolutely) */}
      {tooltip && (
        <div
          className={styles.tooltip}
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
          }}
          data-testid="heatmap-tooltip"
        >
          <strong>{formatDate(tooltip.data.date)}</strong>
          <span>{tooltip.data.drills} drill{tooltip.data.drills !== 1 ? 's' : ''}</span>
          <span>{tooltip.data.cards} card{tooltip.data.cards !== 1 ? 's' : ''} reviewed</span>
        </div>
      )}

      {/* Intensity legend */}
      <div className={styles.intensityLegend}>
        <span className={styles.legendLabel}>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span key={level} className={`${styles.legendCell} ${styles[`level${level}`]}`} />
        ))}
        <span className={styles.legendLabel}>More</span>
      </div>
    </div>
  );
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
}

export default ActivityHeatmap;
