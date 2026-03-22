import { supabase } from '@/src/lib/supabase';
import type { DailyPulseResponse } from '@shared/types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

export async function fetchDailyPulse(lang: 'en' | 'th' = 'en'): Promise<DailyPulseResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const response = await fetch(
    `${API_BASE_URL}/api/pulse/daily?date=${today}&lang=${lang}`,
    { headers: { Authorization: `Bearer ${session.access_token}` } },
  );

  if (!response.ok) {
    throw new Error(`Pulse API error: ${response.status}`);
  }

  return response.json();
}
