import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MissionFlow.module.css';
import planStyles from './PlanSurface.module.css';
import useMissionSchedule from '../../hooks/useMissionSchedule';
import CustomMissionSchedulesStore from '../../store/CustomMissionSchedulesStore';
import UserProgressStore from '../../store/UserProgressStore';
import { MissionSet, MissionBlock } from '../../types/MissionSchedule';
import { DrillRunStore } from '../../store/DrillRunStore';

/** Day-of-week labels (Mon–Sun). */
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

/** Compute the Monday-based week containing `today`. */
const getWeekDates = (today: Date): Date[] => {
  const d = new Date(today);
  const dayOfWeek = d.getDay(); // 0=Sun
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // offset to Monday
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return day;
  });
};

/** Format a Date as YYYY-MM-DD. */
const formatDateKey = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Format a Date as "Mar 9". */
const formatShortDate = (d: Date): string =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

/** Represents one drill entry for display. */
interface PlanDrill {
  id: string;
  name: string;
  duration: string;
  intensity: string;
  completed: boolean;
}

/** Represents a rest block for display. */
interface PlanRest {
  name: string;
  durationMin: number;
}

/** Union item in day detail. */
type PlanItem = { type: 'drill'; drill: PlanDrill } | { type: 'rest'; rest: PlanRest };

/** Extract displayable items from the schedule for a given day key. */
const extractItemsForDay = (dayKey: string, schedule: { date: string; scheduleItems: ReadonlyArray<unknown> } | null): PlanItem[] => {
  if (!schedule) return [];

  // The schedule is date-stamped; if today's schedule matches dayKey, use it
  if (schedule.date !== dayKey) return [];

  const items: PlanItem[] = [];
  for (const item of schedule.scheduleItems) {
    if (item instanceof MissionSet) {
      for (const [drill, completed] of item.drills) {
        items.push({
          type: 'drill',
          drill: {
            id: drill.id,
            name: drill.name,
            duration: drill.duration,
            intensity: drill.intensity,
            completed,
          },
        });
      }
    } else if (item instanceof MissionBlock) {
      items.push({
        type: 'rest',
        rest: { name: item.name, durationMin: item.duration },
      });
    }
  }
  return items;
};

const PlanSurface: React.FC = () => {
  const { schedule, createNewSchedule } = useMissionSchedule();
  const navigate = useNavigate();
  const today = useMemo(() => new Date(), []);
  const todayKey = formatDateKey(today);
  const weekDates = useMemo(() => getWeekDates(today), [today]);
  const [selectedDay, setSelectedDay] = useState<string>(todayKey);

  // Build a map of dayKey → items
  const dayItemsMap = useMemo(() => {
    const map = new Map<string, PlanItem[]>();
    for (const d of weekDates) {
      const key = formatDateKey(d);
      map.set(key, extractItemsForDay(key, schedule));
    }
    return map;
  }, [weekDates, schedule]);

  const selectedItems = dayItemsMap.get(selectedDay) ?? [];
  const selectedDate = weekDates.find((d) => formatDateKey(d) === selectedDay) ?? today;

  // Custom schedules count
  const customSchedules = useMemo(() => CustomMissionSchedulesStore.getCustomSchedules(), []);

  // Progress summary
  const vm = UserProgressStore.getViewModel();

  // Weekly drill count
  const weeklyDrillCount = useMemo(() => {
    let count = 0;
    for (const items of dayItemsMap.values()) {
      count += items.filter((i) => i.type === 'drill').length;
    }
    return count;
  }, [dayItemsMap]);

  const weeklyCompletedCount = useMemo(() => {
    let count = 0;
    for (const items of dayItemsMap.values()) {
      count += items.filter((i) => i.type === 'drill' && i.drill.completed).length;
    }
    return count;
  }, [dayItemsMap]);

  const handleRegenerate = () => {
    createNewSchedule();
  };

  const handleRunDrill = useCallback((drill: PlanDrill) => {
    const steps = [{ id: `plan-${drill.id}`, label: drill.name }];
    DrillRunStore.start(drill.id, drill.name, steps);
    navigate('/mission/checklist');
  }, [navigate]);

  return (
    <section id="section-mission-plan" className={styles.surface} aria-label="Training Plan">
      <h2 className={styles.title}>Training Plan</h2>

      {/* Weekly summary chips */}
      <div className={planStyles.weeklySummary} data-testid="weekly-summary">
        <div className={planStyles.summaryChip}>
          <span className={planStyles.summaryLabel}>This Week</span>
          <span className={planStyles.summaryValue}>{weeklyDrillCount} drills</span>
        </div>
        <div className={planStyles.summaryChip}>
          <span className={planStyles.summaryLabel}>Completed</span>
          <span className={planStyles.summaryValue}>{weeklyCompletedCount}</span>
        </div>
        <div className={planStyles.summaryChip}>
          <span className={planStyles.summaryLabel}>Weekly Goal</span>
          <span className={planStyles.summaryValue}>{Math.round(vm.weeklyGoalPercent)}%</span>
        </div>
        <div className={planStyles.summaryChip}>
          <span className={planStyles.summaryLabel}>Saved Plans</span>
          <span className={planStyles.summaryValue}>{customSchedules.length}</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className={planStyles.actions}>
        <button
          type="button"
          className={planStyles.actionBtn}
          onClick={handleRegenerate}
          data-testid="plan-regenerate"
        >
          Regenerate Schedule
        </button>
      </div>

      {/* Week grid */}
      <div className={planStyles.planGrid} role="grid" aria-label="Weekly plan">
        {weekDates.map((d, i) => {
          const key = formatDateKey(d);
          const items = dayItemsMap.get(key) ?? [];
          const drillCount = items.filter((it) => it.type === 'drill').length;
          const isToday = key === todayKey;
          const isSelected = key === selectedDay;

          return (
            <button
              key={key}
              type="button"
              role="gridcell"
              aria-selected={isSelected}
              aria-current={isToday ? 'date' : undefined}
              className={[
                planStyles.dayCard,
                isSelected ? planStyles.dayCardActive : '',
                isToday ? planStyles.dayCardToday : '',
              ].filter(Boolean).join(' ')}
              onClick={() => setSelectedDay(key)}
              data-testid={`day-${key}`}
            >
              <span className={planStyles.dayLabel}>{DAY_LABELS[i]}</span>
              <span className={planStyles.dayDate}>{d.getDate()}</span>
              {drillCount > 0 && (
                <span className={planStyles.dayDrillCount}>
                  {drillCount} drill{drillCount !== 1 ? 's' : ''}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Day detail panel */}
      <div className={planStyles.detailPanel} data-testid="day-detail">
        <h3 className={planStyles.detailHeading}>
          {formatShortDate(selectedDate)} — {DAY_LABELS[selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1]}
        </h3>

        {selectedItems.length === 0 ? (
          <p className={planStyles.emptyDay}>No drills scheduled for this day.</p>
        ) : (
          <ul className={planStyles.drillList}>
            {selectedItems.map((item, idx) => {
              if (item.type === 'drill') {
                return (
                  <li
                    key={`drill-${idx}`}
                    className={`${planStyles.drillItem} ${item.drill.completed ? planStyles.drillDone : ''}`}
                  >
                    <span className={planStyles.drillIcon}>{item.drill.completed ? '✅' : '🎯'}</span>
                    <div className={planStyles.drillInfo}>
                      <div className={planStyles.drillName}>{item.drill.name}</div>
                      <div className={planStyles.drillMeta}>
                        {item.drill.duration} · {item.drill.intensity}
                      </div>
                    </div>
                    {!item.drill.completed && (
                      <button
                        type="button"
                        className={planStyles.actionBtn}
                        onClick={() => handleRunDrill(item.drill)}
                        data-testid={`run-drill-${idx}`}
                        aria-label={`Run ${item.drill.name}`}
                      >
                        ▶ Run
                      </button>
                    )}
                  </li>
                );
              }
              return (
                <li key={`rest-${idx}`} className={planStyles.restBlock}>
                  ⏸️ {item.rest.name} — {item.rest.durationMin}min
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
};

export default PlanSurface;
