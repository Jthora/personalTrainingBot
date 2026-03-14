import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MissionEntityStore from '../domain/mission/MissionEntityStore';
import {
  buildMissionUrlState,
  parseMissionUrlState,
  upsertMissionFlowContext,
  writeMissionCheckpoint,
} from '../store/missionFlow/continuity';

export const useMissionFlowContinuity = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const canonicalCollection = useMemo(
    () => MissionEntityStore.getInstance().getCanonicalCollection(),
    [location.pathname],
  );

  useEffect(() => {
    if (!location.pathname.startsWith('/mission/')) return;

    const candidate = parseMissionUrlState(location.search);
    const { context } = upsertMissionFlowContext(canonicalCollection, candidate);
    const missionSearch = buildMissionUrlState(context);

    // Merge mission-context params with any extra surface-specific params
    // (e.g. ?mode=review, ?deck=..., ?module=...) so they are not stripped.
    const current = new URLSearchParams(location.search);
    const mission = new URLSearchParams(missionSearch);
    const merged = new URLSearchParams(current);
    // Overwrite mission keys with canonical values
    for (const [k, v] of mission) merged.set(k, v);
    // Remove mission keys that resolved to empty
    for (const key of ['op', 'case', 'signal']) {
      if (!mission.has(key)) merged.delete(key);
    }
    const nextSearch = merged.toString();
    const normalizedCurrent = location.search.startsWith('?') ? location.search.slice(1) : location.search;

    writeMissionCheckpoint(location.pathname);

    if (normalizedCurrent !== nextSearch) {
      navigate(
        {
          pathname: location.pathname,
          search: nextSearch ? `?${nextSearch}` : '',
        },
        { replace: true },
      );
    }
  }, [canonicalCollection, location.pathname, location.search, navigate]);

  const routeSearch = useMemo(() => {
    const candidate = parseMissionUrlState(location.search);
    const { context } = upsertMissionFlowContext(canonicalCollection, candidate);
    return buildMissionUrlState(context);
  }, [canonicalCollection, location.search]);

  return {
    routeSearch,
  };
};
