import { supabase } from '@/src/lib/supabase';

export interface UserProfile {
  fullName: string | null;
  dateOfBirth: string | null;
  gender: string | null;
}

export async function fetchUserProfile(): Promise<UserProfile> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('birth_data')
    .select('full_name, date_of_birth, gender')
    .eq('user_id', user.id)
    .single();

  if (error) throw error;

  return {
    fullName: data?.full_name ?? null,
    dateOfBirth: data?.date_of_birth ?? null,
    gender: data?.gender ?? null,
  };
}
