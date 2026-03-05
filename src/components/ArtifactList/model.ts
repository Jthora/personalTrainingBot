import type { ArtifactType, MissionArtifact } from '../../domain/mission/types';

export type ArtifactSortMode = 'recent' | 'oldest' | 'title';

export type ArtifactFilters = {
  query: string;
  type: ArtifactType | 'all';
  sort: ArtifactSortMode;
};

export const defaultArtifactFilters: ArtifactFilters = {
  query: '',
  type: 'all',
  sort: 'recent',
};

const sortArtifacts = (items: MissionArtifact[], sort: ArtifactSortMode): MissionArtifact[] => {
  const next = [...items];

  if (sort === 'title') {
    return next.sort((a, b) => a.title.localeCompare(b.title));
  }

  return next.sort((a, b) => {
    const aMs = new Date(a.collectedAt).getTime();
    const bMs = new Date(b.collectedAt).getTime();
    if (sort === 'oldest') {
      return aMs - bMs;
    }
    return bMs - aMs;
  });
};

export const filterAndSortArtifacts = (items: MissionArtifact[], filters: ArtifactFilters): MissionArtifact[] => {
  const normalizedQuery = filters.query.trim().toLowerCase();

  const filtered = items.filter((item) => {
    if (filters.type !== 'all' && item.artifactType !== filters.type) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = `${item.title} ${item.description} ${item.source}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  return sortArtifacts(filtered, filters.sort);
};

export type ArtifactDetailField = {
  label: string;
  value: string;
};

export const buildArtifactDetailFields = (artifact: MissionArtifact): ArtifactDetailField[] => {
  return [
    { label: 'Type', value: artifact.artifactType.toUpperCase() },
    { label: 'Source', value: artifact.source },
    { label: 'Collected', value: new Date(artifact.collectedAt).toLocaleString() },
    { label: 'Case ID', value: artifact.caseId },
    { label: 'Hash', value: artifact.hash ?? 'Unavailable' },
  ];
};

export const buildArtifactActionLabels = (reviewed: boolean, promoted: boolean) => {
  return {
    review: reviewed ? 'Reviewed' : 'Mark reviewed',
    promote: promoted ? 'Promoted to Intel' : 'Promote to Intel',
    copy: 'Copy source',
  };
};