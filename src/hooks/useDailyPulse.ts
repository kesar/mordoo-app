import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import { useAuthStore } from '@/src/stores/authStore';
import { useSettingsStore } from '@/src/stores/settingsStore';
import { fetchDailyPulse } from '@/src/services/pulse';
import type { DailyPulseResponse } from '@shared/types';

function getLocalToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function useDailyPulse() {
  const userId = useAuthStore((s) => s.userId);
  const lang = useSettingsStore((s) => s.language);

  // Recompute today on every screen focus so midnight rollovers are picked up
  const [today, setToday] = useState(getLocalToday);
  useFocusEffect(() => {
    setToday(getLocalToday());
  });

  const query = useQuery<DailyPulseResponse>({
    queryKey: ['dailyPulse', userId, today, lang],
    queryFn: () => fetchDailyPulse(lang),
    staleTime: 30 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    enabled: !!userId,
  });

  // Refetch on focus if data is stale (older than staleTime)
  useFocusEffect(() => {
    if (query.isStale && !query.isFetching) {
      query.refetch();
    }
  });

  return query;
}
