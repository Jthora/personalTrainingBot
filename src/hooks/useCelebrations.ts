import { useState, useEffect, useCallback } from 'react';
import { subscribeCelebrations, CelebrationEvent } from '../store/celebrationEvents';

/**
 * Hook that collects celebration events and dequeues them one at a time.
 * Consumers render the current event, then call `dismiss()` to advance.
 */
export function useCelebrations() {
  const [queue, setQueue] = useState<CelebrationEvent[]>([]);

  useEffect(() => {
    return subscribeCelebrations((event) => {
      setQueue((prev) => [...prev, event]);
    });
  }, []);

  const current = queue[0] ?? null;

  const dismiss = useCallback(() => {
    setQueue((prev) => prev.slice(1));
  }, []);

  return { current, dismiss, pending: queue.length };
}
