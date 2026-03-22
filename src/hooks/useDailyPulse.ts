import { useQuery } from '@tanstack/react-query';
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
  const today = getLocalToday();

  return useQuery<DailyPulseResponse>({
    queryKey: ['dailyPulse', userId, today, lang],
    queryFn: () => fetchDailyPulse(lang),
    staleTime: 30 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
    enabled: !!userId,
  });
}
