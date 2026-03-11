import type { AAREntry } from '../../store/AARStore';
import type { MissionDebriefOutcome, DebriefRating } from '../../domain/mission/types';

/**
 * Maps an AAREntry to a MissionDebriefOutcome so that AAR user input feeds
 * into the readiness model.  We infer a lightweight rating from the text
 * length / completeness of the entry fields, favouring entries where the
 * operative actually filled in meaningful content.
 */
const inferRating = (entry: AAREntry): DebriefRating => {
  const filledFields = [entry.context, entry.actions, entry.outcomes, entry.lessons, entry.followups]
    .filter(f => f.trim().length > 20).length;
  if (filledFields >= 4) return 'strong';
  if (filledFields >= 2) return 'adequate';
  return 'insufficient';
};

const inferReadinessDelta = (entry: AAREntry): number => {
  // Entries with concrete lessons and followups nudge readiness up
  const hasLessons = entry.lessons.trim().length > 10;
  const hasFollowups = entry.followups.trim().length > 10;
  if (hasLessons && hasFollowups) return 4;
  if (hasLessons || hasFollowups) return 2;
  return 0;
};

export const mapAARToDebriefOutcome = (entry: AAREntry): MissionDebriefOutcome => ({
  id: `aar-${entry.id}`,
  version: 'v1' as const,
  kind: 'debrief_outcome',
  operationId: 'aar-derived',
  summary: entry.title,
  lessonsLearned: entry.lessons.split('\n').filter(Boolean),
  followUpActions: entry.followups.split('\n').filter(Boolean),
  rating: inferRating(entry),
  readinessDelta: inferReadinessDelta(entry),
  createdAt: new Date(entry.createdAt).toISOString(),
  updatedAt: new Date(entry.updatedAt).toISOString(),
});

export const mapAllAARsToDebriefOutcomes = (entries: AAREntry[]): MissionDebriefOutcome[] =>
  entries.map(mapAARToDebriefOutcome);
