/**
 * disciplineTheme.ts — Visual identity for each of the 19 training disciplines.
 *
 * Each discipline has a unique accent color, icon, and label.
 * Used by ModuleBrowser tiles, DrillRunner ambient tinting,
 * ReviewDashboard badges, and anywhere domain identity appears.
 */

export interface DisciplineVisual {
  id: string;
  icon: string;
  color: string;
  /** A softer version at 15% opacity for backgrounds. */
  bgTint: string;
  /** Optional display label. Falls back to formatted id when absent. */
  label?: string;
}

const DISCIPLINE_MAP: Record<string, DisciplineVisual> = {
  agencies:         { id: 'agencies',         icon: '🏛️', color: '#6366f1', bgTint: 'rgba(99, 102, 241, 0.12)', label: 'Division Command' },
  combat:           { id: 'combat',           icon: '⚔️', color: '#ef4444', bgTint: 'rgba(239, 68, 68, 0.12)' },
  counter_biochem:  { id: 'counter_biochem',  icon: '☣️', color: '#84cc16', bgTint: 'rgba(132, 204, 22, 0.12)' },
  counter_psyops:   { id: 'counter_psyops',   icon: '🛡️', color: '#f43f5e', bgTint: 'rgba(244, 63, 94, 0.12)' },
  cybersecurity:    { id: 'cybersecurity',     icon: '🔐', color: '#5A7FFF', bgTint: 'rgba(90, 127, 255, 0.12)' },
  dance:            { id: 'dance',             icon: '💃', color: '#ec4899', bgTint: 'rgba(236, 72, 153, 0.12)' },
  equations:        { id: 'equations',         icon: '📐', color: '#14b8a6', bgTint: 'rgba(20, 184, 166, 0.12)' },
  espionage:        { id: 'espionage',         icon: '🕵️', color: '#a855f7', bgTint: 'rgba(168, 85, 247, 0.12)' },
  fitness:          { id: 'fitness',           icon: '💪', color: '#22c55e', bgTint: 'rgba(34, 197, 94, 0.12)' },
  intelligence:     { id: 'intelligence',      icon: '🧠', color: '#06b6d4', bgTint: 'rgba(6, 182, 212, 0.12)' },
  investigation:    { id: 'investigation',     icon: '🔍', color: '#64748b', bgTint: 'rgba(100, 116, 139, 0.12)' },
  martial_arts:     { id: 'martial_arts',      icon: '🥋', color: '#f97316', bgTint: 'rgba(249, 115, 22, 0.12)' },
  psiops:           { id: 'psiops',            icon: '🔮', color: '#8b5cf6', bgTint: 'rgba(139, 92, 246, 0.12)', label: 'Psi Corps Training' },
  war_strategy:     { id: 'war_strategy',      icon: '♟️', color: '#eab308', bgTint: 'rgba(234, 179, 8, 0.12)', label: 'Tactical Doctrine' },
  web_three:        { id: 'web_three',         icon: '⛓️', color: '#3b82f6', bgTint: 'rgba(59, 130, 246, 0.12)' },
  self_sovereignty: { id: 'self_sovereignty',  icon: '👑', color: '#d946ef', bgTint: 'rgba(217, 70, 239, 0.12)' },
  anti_psn:         { id: 'anti_psn',          icon: '📡', color: '#0ea5e9', bgTint: 'rgba(14, 165, 233, 0.12)' },
  anti_tcs_idc_cbc: { id: 'anti_tcs_idc_cbc', icon: '🚫', color: '#78716c', bgTint: 'rgba(120, 113, 108, 0.12)' },
  space_force:      { id: 'space_force',       icon: '🚀', color: '#818cf8', bgTint: 'rgba(129, 140, 248, 0.12)', label: 'Fleet Ops' },
};

const DEFAULT_VISUAL: DisciplineVisual = {
  id: 'unknown',
  icon: '📚',
  color: '#5A7FFF',
  bgTint: 'rgba(90, 127, 255, 0.12)',
};

/**
 * Get the visual identity for a discipline/module by ID.
 */
export function getDiscipline(moduleId: string): DisciplineVisual {
  return DISCIPLINE_MAP[moduleId] ?? DEFAULT_VISUAL;
}

/**
 * Get just the accent color for a discipline (for charts, sparklines, etc.).
 * Drop-in replacement for the old getDomainColor in ScoreLineChart.
 */
export function getDisciplineColor(moduleId: string): string {
  return DISCIPLINE_MAP[moduleId]?.color ?? '#5A7FFF';
}

/**
 * Get the display label for a discipline.
 * Returns the custom label if set, otherwise formats the id
 * (e.g. 'counter_biochem' → 'Counter Biochem').
 */
export function getDisciplineLabel(moduleId: string): string {
  const vis = DISCIPLINE_MAP[moduleId];
  if (vis?.label) return vis.label;
  return moduleId
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * All disciplines as an array for iteration.
 */
export const ALL_DISCIPLINES: DisciplineVisual[] = Object.values(DISCIPLINE_MAP);
