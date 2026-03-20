import { supabase } from '@/src/lib/supabase';
import type { BirthData, NameData, Concern } from '@/src/stores/onboardingStore';

interface SyncParams {
  birthData: BirthData;
  nameData: NameData | null;
  concerns: Concern[];
  urgencyContext: string | null;
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
