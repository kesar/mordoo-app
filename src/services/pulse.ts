import { supabase } from '@/src/lib/supabase';
import type { DailyPulseResponse } from '@shared/types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

export async function fetchDailyPulse(): Promise<DailyPulseResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const today = new Date().toISOString().split('T')[0];

  const response = await fetch(
    `${API_BASE_URL}/api/pulse/daily?date=${today}`,
    { headers: { Authorization: `Bearer ${session.access_token}` } },
  );

  if (!response.ok) {
    throw new Error(`Pulse API error: ${response.status}`);
  }

  return response.json();
}
