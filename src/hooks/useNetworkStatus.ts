import { useEffect, useRef, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Network status hook with debounced offline detection.
 *
 * - Waits `offlineDelayMs` (default 3s) before reporting offline to avoid
 *   false positives from brief connectivity blips.
 * - Reports online immediately (no delay).
 * - Triggers React Query refetch on reconnection.
 */
export function useNetworkStatus(offlineDelayMs = 3000) {
  const [isOffline, setIsOffline] = useState(false);
  const queryClient = useQueryClient();
  const offlineTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = state.isConnected !== false && state.isInternetReachable !== false;

      if (connected) {
        // Clear any pending offline timer
        if (offlineTimerRef.current) {
          clearTimeout(offlineTimerRef.current);
          offlineTimerRef.current = null;
        }

        // If we were offline, trigger refetch on reconnect
        if (wasOfflineRef.current) {
          wasOfflineRef.current = false;
          setIsOffline(false);
          queryClient.invalidateQueries();
        } else {
          setIsOffline(false);
        }
      } else {
        // Debounce: only mark offline after sustained disconnection
        if (!offlineTimerRef.current) {
          offlineTimerRef.current = setTimeout(() => {
            offlineTimerRef.current = null;
            wasOfflineRef.current = true;
            setIsOffline(true);
          }, offlineDelayMs);
        }
      }
    });

    return () => {
      unsubscribe();
      if (offlineTimerRef.current) {
        clearTimeout(offlineTimerRef.current);
      }
    };
  }, [offlineDelayMs, queryClient]);

  return isOffline;
}
