import { MissionKit } from '../../data/missionKits/sampleMissionKit';

export type ValidationIssue = { path: string; message: string };

const drillTypes = new Set(['simulation', 'tabletop', 'rapid-response']);

export function validateMissionKit(kit: MissionKit): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!kit.id) issues.push({ path: 'id', message: 'Missing kit id' });
  if (!kit.title) issues.push({ path: 'title', message: 'Missing kit title' });
  if (!kit.synopsis) issues.push({ path: 'synopsis', message: 'Missing synopsis' });
  if (!kit.missionType) issues.push({ path: 'missionType', message: 'Missing missionType' });

  if (!Array.isArray(kit.drills) || kit.drills.length === 0) {
    issues.push({ path: 'drills', message: 'Drills must be a non-empty array' });
    return issues;
  }

  kit.drills.forEach((drill, idx) => {
    const basePath = `drills[${idx}]`;

    if (!drill.id) issues.push({ path: `${basePath}.id`, message: 'Missing drill id' });
    if (!drill.title) issues.push({ path: `${basePath}.title`, message: 'Missing drill title' });
    if (!drillTypes.has(drill.type)) {
      issues.push({ path: `${basePath}.type`, message: `Invalid drill type: ${drill.type}` });
    }
    if (drill.difficulty < 1 || drill.difficulty > 5) {
      issues.push({ path: `${basePath}.difficulty`, message: 'Difficulty must be between 1-5' });
    }
    if (typeof drill.durationMinutes !== 'number' || drill.durationMinutes <= 0) {
      issues.push({ path: `${basePath}.durationMinutes`, message: 'Duration must be a positive number' });
    }
    if (drill.lastCompleted && Number.isNaN(new Date(drill.lastCompleted).getTime())) {
      issues.push({ path: `${basePath}.lastCompleted`, message: 'lastCompleted must be an ISO date string' });
    }
    if (typeof drill.successRate !== 'undefined') {
      if (typeof drill.successRate !== 'number' || drill.successRate < 0 || drill.successRate > 1) {
        issues.push({ path: `${basePath}.successRate`, message: 'successRate must be between 0 and 1' });
      }
    }
  });

  return issues;
}
