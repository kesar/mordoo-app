import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/src/stores/authStore';
import { useOnboardingStore } from '@/src/stores/onboardingStore';
import { fetchDailyPulse } from '@/src/services/pulse';
import { computeReading } from '@shared/compute-reading';
import type { DailyPulseResponse } from '@shared/types';

function getLocalToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function computeLocalReading(
  userId: string,
  dateOfBirth: string,
  fullName?: string,
): DailyPulseResponse {
  return computeReading({
    userId,
    dateOfBirth,
    fullName,
    currentDate: getLocalToday(),
  });
}

export function useDailyPulse() {
  const authMode = useAuthStore((s) => s.authMode);
  const userId = useAuthStore((s) => s.userId);
  const birthData = useOnboardingStore((s) => s.birthData);
  const nameData = useOnboardingStore((s) => s.nameData);
  const today = getLocalToday();

  return useQuery<DailyPulseResponse>({
    queryKey: ['dailyPulse', userId, today],
    queryFn: async () => {
      if (!userId) throw new Error('No user ID available');

      // Guest users: compute locally
      if (authMode === 'guest') {
        if (!birthData) throw new Error('No birth data available');
        return computeLocalReading(userId, birthData.dateOfBirth, nameData?.fullName);
      }

      // Account users: try API, fall back to local
      try {
        return await fetchDailyPulse();
      } catch {
        if (birthData) {
          return computeLocalReading(userId, birthData.dateOfBirth, nameData?.fullName);
        }
        throw new Error('No pulse data available');
      }
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 2,
    enabled: !!userId && !!birthData,
  });
}
