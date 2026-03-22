import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, createAuthClient } from '../../../../lib/supabase';
import { computeReading } from '@shared/compute-reading';
import { validateLang, localizePulseReading } from '../../../../lib/localize';

export async function GET(request: NextRequest) {
  // 1. Extract and validate token
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing authorization' }, { status: 401 });
  }
  const token = authHeader.slice(7);

  // 2. Get user from token
  const authClient = createAuthClient(token);
  const { data: { user }, error: userError } = await authClient.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // 3. Get date and lang parameters
  const date = request.nextUrl.searchParams.get('date');
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date parameter' }, { status: 400 });
  }
  const lang = validateLang(request.nextUrl.searchParams.get('lang'));

  const serviceClient = createServiceClient();

  // 4. Check cache
  const { data: cached } = await serviceClient
    .from('daily_readings')
    .select('*')
    .eq('user_id', user.id)
    .eq('reading_date', date)
    .single();

  if (cached && cached.insight_en && cached.insight_th) {
    const reading = {
      date: cached.reading_date,
      energyScore: cached.energy_score,
      insightEn: cached.insight_en,
      insightTh: cached.insight_th,
      luckyColor: {
        name: cached.lucky_color_name,
        nameTh: cached.lucky_color_name_th,
        hex: cached.lucky_color_hex,
      },
      luckyNumber: cached.lucky_number,
      luckyDirection: cached.lucky_direction,
      luckyDirectionTh: cached.lucky_direction_th,
      subScores: {
        business: cached.sub_score_business,
        heart: cached.sub_score_heart,
        body: cached.sub_score_body,
      },
    };
    return NextResponse.json(localizePulseReading(reading, lang));
  }

  // 5. Delete stale cache row if it exists but lacks bilingual data
  if (cached) {
    await serviceClient
      .from('daily_readings')
      .delete()
      .eq('user_id', user.id)
      .eq('reading_date', date);
  }

  // 6. Fetch birth data
  const { data: birthData, error: birthError } = await serviceClient
    .from('birth_data')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (birthError || !birthData) {
    return NextResponse.json({ error: 'No birth data found' }, { status: 404 });
  }

  // 7. Compute reading
  const reading = computeReading({
    userId: user.id,
    dateOfBirth: birthData.date_of_birth,
    fullName: birthData.full_name ?? undefined,
    currentDate: date,
  });

  // 8. Cache result with both languages
  await serviceClient.from('daily_readings').insert({
    user_id: user.id,
    reading_date: date,
    energy_score: reading.energyScore,
    insight_en: reading.insightEn,
    insight_th: reading.insightTh,
    lucky_color_name: reading.luckyColor.name,
    lucky_color_name_th: reading.luckyColor.nameTh,
    lucky_color_hex: reading.luckyColor.hex,
    lucky_number: reading.luckyNumber,
    lucky_direction: reading.luckyDirection,
    lucky_direction_th: reading.luckyDirectionTh,
    sub_score_business: reading.subScores.business,
    sub_score_heart: reading.subScores.heart,
    sub_score_body: reading.subScores.body,
  });

  // 9. Return localized response
  return NextResponse.json(localizePulseReading(reading, lang));
}
