import { useCallback, useSyncExternalStore } from 'react';
import MissionEntityStore from '../domain/mission/MissionEntityStore';
import type { MissionEntityCollection } from '../domain/mission/types';

/**
 * React hook that subscribes to `MissionEntityStore` and re-renders
 * whenever the canonical collection is mutated.
 *
 * Returns `null` before hydration completes (same contract as
 * `getCanonicalCollection()`).
 */
export function useMissionEntityCollection(): MissionEntityCollection | null {
  const store = MissionEntityStore.getInstance();

  const subscribe = useCallback(
    (onStoreChange: () => void) => store.subscribe(onStoreChange),
    [store],
  );

  const getSnapshot = useCallback(
    () => store.getCanonicalCollection(),
    [store],
  );

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
