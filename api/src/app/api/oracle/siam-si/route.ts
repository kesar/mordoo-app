import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, createAuthClient } from '../../../../lib/supabase';
import { drawSiamSi } from '@shared/siam-si';

export async function POST(request: NextRequest) {
  // 1. Validate auth
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing authorization' }, { status: 401 });
  }
  const token = authHeader.slice(7);

  const authClient = createAuthClient(token);
  const { data: { user }, error: userError } = await authClient.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const serviceClient = createServiceClient();

  // 2. Get user tier
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('tier')
    .eq('id', user.id)
    .single();

  const tier = profile?.tier || 'free';
  const maxDraws = tier === 'standard' ? Infinity : 5;

  // 3. Get/create quota record
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const { data: quota } = await serviceClient
    .from('user_quotas')
    .select('*')
    .eq('user_id', user.id)
    .single();

  let drawsThisMonth = 0;

  if (quota) {
    if (quota.siam_si_last_reset !== currentMonth) {
      drawsThisMonth = 0;
    } else {
      drawsThisMonth = quota.siam_si_draws_this_month || 0;
    }
  }

  // 4. Check quota
  if (maxDraws !== Infinity && drawsThisMonth >= maxDraws) {
    return NextResponse.json(
      { error: 'QUOTA_EXCEEDED', drawsTotal: maxDraws, drawsRemaining: 0 },
      { status: 429 },
    );
  }

  // 5. Perform draw using server-side draw index
  const yearMonth = currentMonth;
  const stick = drawSiamSi(user.id, yearMonth, drawsThisMonth);

  // 6. Increment quota
  const newDrawCount = drawsThisMonth + 1;
  if (quota) {
    await serviceClient.from('user_quotas').update({
      siam_si_draws_this_month: newDrawCount,
      siam_si_last_reset: currentMonth,
      updated_at: new Date().toISOString(),
    }).eq('user_id', user.id);
  } else {
    await serviceClient.from('user_quotas').insert({
      user_id: user.id,
      siam_si_draws_this_month: newDrawCount,
      siam_si_last_reset: currentMonth,
    });
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
