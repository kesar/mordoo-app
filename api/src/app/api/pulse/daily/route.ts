import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, createAuthClient } from '../../../../lib/supabase';
import { computeReading } from '@shared/compute-reading';

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

  // 3. Get date parameter
  const date = request.nextUrl.searchParams.get('date');
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date parameter' }, { status: 400 });
  }

  const serviceClient = createServiceClient();

  // 4. Check cache
  const { data: cached } = await serviceClient
    .from('daily_readings')
    .select('*')
    .eq('user_id', user.id)
    .eq('reading_date', date)
    .single();

  if (cached) {
    return NextResponse.json({
      date: cached.reading_date,
      energyScore: cached.energy_score,
      insight: cached.insight,
      luckyColor: { name: cached.lucky_color_name, hex: cached.lucky_color_hex },
      luckyNumber: cached.lucky_number,
      luckyDirection: cached.lucky_direction,
      subScores: {
        business: cached.sub_score_business,
        heart: cached.sub_score_heart,
        body: cached.sub_score_body,
      },
    });
  }

  // 5. Fetch birth data
  const { data: birthData, error: birthError } = await serviceClient
    .from('birth_data')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (birthError || !birthData) {
    return NextResponse.json({ error: 'No birth data found' }, { status: 404 });
  }

  // 6. Compute reading
  const reading = computeReading({
    userId: user.id,
    dateOfBirth: birthData.date_of_birth,
    fullName: birthData.full_name ?? undefined,
    currentDate: date,
  });

  // 7. Cache result (non-blocking — don't fail if cache insert fails)
  await serviceClient.from('daily_readings').insert({
    user_id: user.id,
    reading_date: date,
    energy_score: reading.energyScore,
    insight: reading.insight,
    lucky_color_name: reading.luckyColor.name,
    lucky_color_hex: reading.luckyColor.hex,
    lucky_number: reading.luckyNumber,
    lucky_direction: reading.luckyDirection,
    sub_score_business: reading.subScores.business,
    sub_score_heart: reading.subScores.heart,
    sub_score_body: reading.subScores.body,
  });

  // 8. Return reading
  return NextResponse.json(reading);
}
