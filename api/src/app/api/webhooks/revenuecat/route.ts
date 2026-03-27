import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '../../../../lib/supabase';

const WEBHOOK_AUTH_KEY = process.env.REVENUECAT_WEBHOOK_KEY;

// Events that grant/restore premium access
const ACTIVATE_EVENTS = [
  'INITIAL_PURCHASE',
  'RENEWAL',
  'PRODUCT_CHANGE',
  'UNCANCELLATION',
  'NON_RENEWING_PURCHASE',
  'TEST',                    // Sandbox/TestFlight purchases
];

// Only EXPIRATION truly revokes access.
// BILLING_ISSUE is NOT here — RevenueCat retries billing automatically.
// CANCELLATION is NOT here — user keeps access until period ends.
const DEACTIVATE_EVENTS = [
  'EXPIRATION',
];

/**
 * Resolve the Supabase user ID from a RevenueCat app_user_id.
 *
 * RevenueCat may send:
 *  - The Supabase UUID directly (from Purchases.logIn(userId))
 *  - An anonymous ID like "$RCAnonymousID:abc123"
 *
 * For anonymous IDs we fall back to original_app_user_id (the transferred alias).
 * If neither is a valid UUID, we search profiles as a last resort.
 */
function resolveUserId(event: Record<string, unknown>): string | null {
  const appUserId = event.app_user_id as string | undefined;
  const originalUserId = event.original_app_user_id as string | undefined;

  // UUID v4 pattern
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  // Prefer app_user_id if it's a valid UUID (set via Purchases.logIn)
  if (appUserId && uuidPattern.test(appUserId)) {
    return appUserId;
  }

  // Fall back to original_app_user_id (alias transfer target)
  if (originalUserId && uuidPattern.test(originalUserId)) {
    return originalUserId;
  }

  return null;
}

export async function POST(request: NextRequest) {
  // 1. Verify authorization
  const authHeader = request.headers.get('authorization');
  if (!WEBHOOK_AUTH_KEY || authHeader !== `Bearer ${WEBHOOK_AUTH_KEY}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Parse event
  const body = await request.json();
  const event = body.event;
  if (!event) {
    console.error('[revenuecat-webhook] No event in body:', JSON.stringify(body).slice(0, 500));
    return NextResponse.json({ error: 'No event' }, { status: 400 });
  }

  const eventType = event.type as string;
  const environment = event.environment as string | undefined;

  // Log every webhook for debugging
  console.log(`[revenuecat-webhook] type=${eventType} env=${environment} app_user_id=${event.app_user_id} original_app_user_id=${event.original_app_user_id}`);

  const userId = resolveUserId(event);

  if (!userId) {
    console.error(`[revenuecat-webhook] Could not resolve UUID from app_user_id=${event.app_user_id} original_app_user_id=${event.original_app_user_id}`);
    // Return 200 so RevenueCat doesn't retry — we can't match this user
    return NextResponse.json({ ok: true, skipped: 'no_uuid' });
  }

  // 3. Determine new tier
  let newTier: string | null = null;

  if (ACTIVATE_EVENTS.includes(eventType)) {
    newTier = 'standard';
  } else if (DEACTIVATE_EVENTS.includes(eventType)) {
    newTier = 'free';
  }

  if (!newTier) {
    console.log(`[revenuecat-webhook] Ignoring event type=${eventType} for user=${userId}`);
    return NextResponse.json({ ok: true, ignored: eventType });
  }

  // 4. Update profile tier
  const serviceClient = createServiceClient();
  const { data, error } = await serviceClient
    .from('profiles')
    .update({ tier: newTier, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('id')
    .single();

  if (error) {
    console.error(`[revenuecat-webhook] DB error updating user=${userId}:`, error);
    return NextResponse.json({ error: 'Failed to update tier' }, { status: 500 });
  }

  if (!data) {
    console.error(`[revenuecat-webhook] No profile found for user=${userId}`);
    return NextResponse.json({ ok: true, skipped: 'no_profile' });
  }

  console.log(`[revenuecat-webhook] Updated user=${userId} tier=${newTier} (event=${eventType}, env=${environment})`);
  return NextResponse.json({ ok: true, tier: newTier });
}
