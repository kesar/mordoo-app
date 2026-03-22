import { supabase } from '@/src/lib/supabase';
import type { BirthData, NameData, Concern } from '@/src/stores/onboardingStore';

interface SyncParams {
  birthData: BirthData;
  nameData: NameData | null;
  concerns: Concern[];
  urgencyContext: string | null;
}

interface ExistingBirthData {
  birthData: BirthData;
  nameData: NameData | null;
  concerns: Concern[];
  urgencyContext: string | null;
}

/**
 * Fetches existing birth data from Supabase for the current user.
 * Returns null if no data exists.
 */
export async function fetchExistingBirthData(): Promise<ExistingBirthData | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('birth_data')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error || !data) return null;

  const birthData: BirthData = {
    dateOfBirth: data.date_of_birth,
    timeOfBirth: parseTimeString(data.time_of_birth),
    timeApproximate: data.time_approximate ?? false,
    placeOfBirth: {
      name: data.place_name ?? '',
      latitude: data.latitude ?? 0,
      longitude: data.longitude ?? 0,
      country: data.country ?? '',
    },
    gender: data.gender ?? undefined,
  };

  const nameData: NameData | null = data.full_name
    ? {
        fullName: data.full_name,
        phoneNumber: data.phone_number ?? undefined,
        carPlate: data.car_plate ?? undefined,
      }
    : null;

  return {
    birthData,
    nameData,
    concerns: (data.concerns as Concern[]) ?? [],
    urgencyContext: data.urgency_context ?? null,
  };
}

function parseTimeString(timeStr: string | null): { hour: number; minute: number } {
  if (!timeStr) return { hour: 12, minute: 0 };
  const [h, m] = timeStr.split(':').map(Number);
  return { hour: h, minute: m };
}

export async function syncBirthData(params: SyncParams) {
  const { birthData, nameData, concerns, urgencyContext } = params;

  const timeStr = birthData.timeOfBirth
    ? `${String(birthData.timeOfBirth.hour).padStart(2, '0')}:${String(birthData.timeOfBirth.minute).padStart(2, '0')}:00`
    : null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase.from('birth_data').upsert({
    user_id: user.id,
    date_of_birth: birthData.dateOfBirth,
    time_of_birth: timeStr,
    time_approximate: birthData.timeApproximate,
    place_name: birthData.placeOfBirth.name,
    latitude: birthData.placeOfBirth.latitude,
    longitude: birthData.placeOfBirth.longitude,
    country: birthData.placeOfBirth.country,
    gender: birthData.gender ?? null,
    full_name: nameData?.fullName ?? null,
    phone_number: nameData?.phoneNumber ?? null,
    car_plate: nameData?.carPlate ?? null,
    concerns,
    urgency_context: urgencyContext,
  });

  if (error) throw error;
}
