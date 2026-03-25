import { supabase } from '@/src/lib/supabase';
import type { ZodiacSignsResponse } from '@shared/types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

export async function fetchZodiacSigns(lang: 'en' | 'th' = 'en'): Promise<ZodiacSignsResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await fetch(
    `${API_BASE_URL}/api/zodiac/signs?lang=${lang}`,
    { headers: { Authorization: `Bearer ${session.access_token}` } },
  );

  if (!response.ok) {
    throw new Error(`Zodiac API error: ${response.status}`);
  }

  return response.json();
}
