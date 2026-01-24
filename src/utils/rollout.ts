import { v4 as uuid } from 'uuid';

export type Cohort = 'internal' | 'beta' | 'ga';

const COHORT_OVERRIDE_KEY = 'rollout:cohort';
const ROLLOUT_ID_KEY = 'rollout:id';

const cohorts: { name: Cohort; start: number; end: number }[] = [
  { name: 'internal', start: 0, end: 4 }, // 5%
  { name: 'beta', start: 5, end: 29 },    // 25%
  { name: 'ga', start: 30, end: 99 },     // 70%
];

const getRolloutId = (): string => {
  if (typeof window === 'undefined') return 'server';
  const existing = window.localStorage.getItem(ROLLOUT_ID_KEY);
  if (existing) return existing;
  const id = uuid();
  window.localStorage.setItem(ROLLOUT_ID_KEY, id);
  return id;
};

const hashPercent = (id: string): number => {
  let hash = 5381;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 33) ^ id.charCodeAt(i);
  }
  return Math.abs(hash) % 100;
};

export const getCohortOverride = (): Cohort | null => {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(COHORT_OVERRIDE_KEY) as Cohort | null;
  return value && ['internal', 'beta', 'ga'].includes(value) ? value : null;
};

export const setCohortOverride = (cohort: Cohort | null) => {
  if (typeof window === 'undefined') return;
  if (cohort) {
    window.localStorage.setItem(COHORT_OVERRIDE_KEY, cohort);
  } else {
    window.localStorage.removeItem(COHORT_OVERRIDE_KEY);
  }
};

export const getAssignedCohort = (): Cohort => {
  const override = getCohortOverride();
  if (override) return override;
  const id = getRolloutId();
  const bucket = hashPercent(id);
  const match = cohorts.find((c) => bucket >= c.start && bucket <= c.end);
  return match ? match.name : 'ga';
};

export const isInCohort = (name: Cohort) => getAssignedCohort() === name;

export const getRolloutContext = () => ({
  id: getRolloutId(),
  cohort: getAssignedCohort(),
  override: getCohortOverride(),
});
