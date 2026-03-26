import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '../../../../lib/supabase';
import { authenticateRequest } from '../../../../lib/auth';
import { getDateStringForTimezone } from '../../../../lib/date';
import { FREE_SIAM_SI_DRAWS_PER_DAY, PGRST_NOT_FOUND } from '../../../../lib/config';
import { checkRateLimit } from '../../../../lib/rate-limit';
import { drawSiamSi } from '@shared/siam-si';

export async function GET(request: NextRequest) {
  // 1. Validate auth
  const { user, error: authError } = await authenticateRequest(request);
  if (authError) return authError;

  const serviceClient = createServiceClient();

  // 2. Get user tier
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('tier, timezone')
    .eq('id', user.id)
    .single();

  const tier = profile?.tier || 'free';
  const maxDraws = tier === 'standard' ? Infinity : FREE_SIAM_SI_DRAWS_PER_DAY;

  // 3. Get quota record
  const timezone = profile?.timezone ?? 'Asia/Bangkok';
  const today = getDateStringForTimezone(timezone);

  const { data: quota, error: quotaError } = await serviceClient
    .from('user_quotas')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (quotaError && quotaError.code !== PGRST_NOT_FOUND) {
    return NextResponse.json({ error: 'Failed to check quota' }, { status: 500 });
  }

  let drawsToday = 0;
  if (quota && quota.siam_si_last_reset === today) {
    drawsToday = quota.siam_si_draws_this_month || 0;
  }

  const drawsTotal = maxDraws === Infinity ? null : maxDraws;
  const drawsRemaining = maxDraws === Infinity ? null : maxDraws - drawsToday;

  return NextResponse.json({
    drawsUsed: drawsToday,
    drawsTotal,
    drawsRemaining,
  });
}

export async function POST(request: NextRequest) {
  // 1. Validate auth
  const { user, error: authError } = await authenticateRequest(request);
  if (authError) return authError;

  // Rate limit — max 10 draws per minute per user
  const rateCheck = checkRateLimit(`siamsi:${user.id}`, 10, 60_000);
  if (rateCheck.limited) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(rateCheck.retryAfterMs / 1000)) },
      },
    );
  }

  const serviceClient = createServiceClient();

  // 2. Get user tier
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('tier, timezone')
    .eq('id', user.id)
    .single();

  const tier = profile?.tier || 'free';
  const maxDraws = tier === 'standard' ? Infinity : FREE_SIAM_SI_DRAWS_PER_DAY;

  // 3. Get/create quota record
  const timezone = profile?.timezone ?? 'Asia/Bangkok';
  const today = getDateStringForTimezone(timezone);

  const { data: quota, error: quotaError } = await serviceClient
    .from('user_quotas')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (quotaError && quotaError.code !== PGRST_NOT_FOUND) {
    return NextResponse.json({ error: 'Failed to check quota' }, { status: 500 });
  }

  let drawsToday = 0;

  if (quota) {
    if (quota.siam_si_last_reset !== today) {
      drawsToday = 0;
    } else {
      drawsToday = quota.siam_si_draws_this_month || 0;
    }
  }

  // 4. Check quota
  if (maxDraws !== Infinity && drawsToday >= maxDraws) {
    return NextResponse.json(
      { error: 'QUOTA_EXCEEDED', drawsTotal: maxDraws, drawsRemaining: 0 },
      { status: 429 },
    );
  }

  // 5. Perform draw using server-side draw index
  const stick = drawSiamSi(user.id, today, drawsToday);

  // 6. Increment quota
  const newDrawCount = drawsToday + 1;
  if (quota) {
    const { error: updateError } = await serviceClient.from('user_quotas').update({
      siam_si_draws_this_month: newDrawCount,
      siam_si_last_reset: today,
      updated_at: new Date().toISOString(),
    }).eq('user_id', user.id);

    if (updateError) {
      console.error('Failed to update siam si quota:', updateError);
      return NextResponse.json({ error: 'Failed to update quota' }, { status: 500 });
    }
  } else {
    const { error: insertError } = await serviceClient.from('user_quotas').insert({
      user_id: user.id,
      siam_si_draws_this_month: newDrawCount,
      siam_si_last_reset: today,
    });

    if (insertError) {
      console.error('Failed to create siam si quota:', insertError);
      return NextResponse.json({ error: 'Failed to update quota' }, { status: 500 });
    }
  }

  // 7. Return stick with quota info
  const drawsTotal = maxDraws === Infinity ? null : maxDraws;
  const drawsRemaining = maxDraws === Infinity ? null : maxDraws - newDrawCount;

  return NextResponse.json({
    number: stick.number,
    fortune: stick.fortune,
    titleEn: stick.titleEn,
    titleTh: stick.titleTh,
    meaningEn: stick.meaningEn,
    meaningTh: stick.meaningTh,
    drawsUsed: newDrawCount,
    drawsTotal,
    drawsRemaining,
  });
}
