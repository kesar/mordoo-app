import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '../../../../lib/supabase';
import { authenticateRequest } from '../../../../lib/auth';

/**
 * POST /api/account/sync-subscription
 *
 * Client calls this after verifying subscription status with RevenueCat SDK.
 * Updates profiles.tier to match the client-reported entitlement.
 *
 * This is a safety net for when the RevenueCat webhook fails or is delayed.
 * The webhook remains the primary mechanism for tier updates.
 */
export async function POST(request: NextRequest) {
  const { user, error: authError } = await authenticateRequest(request);
  if (authError) return authError;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { isPremium } = body as { isPremium: boolean };
  if (typeof isPremium !== 'boolean') {
    return NextResponse.json({ error: 'isPremium required' }, { status: 400 });
  }

  const newTier = isPremium ? 'standard' : 'free';
  const serviceClient = createServiceClient();

  // Only update if tier actually changed (avoid unnecessary writes)
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('tier')
    .eq('id', user.id)
    .single();

  if (profile?.tier === newTier) {
    return NextResponse.json({ tier: newTier, updated: false });
  }

  const { error } = await serviceClient
    .from('profiles')
    .update({ tier: newTier, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (error) {
    console.error('Failed to sync tier:', error);
    return NextResponse.json({ error: 'Failed to sync tier' }, { status: 500 });
  }

  console.log(`Synced user ${user.id} tier to ${newTier} (client-reported)`);
  return NextResponse.json({ tier: newTier, updated: true });
}
