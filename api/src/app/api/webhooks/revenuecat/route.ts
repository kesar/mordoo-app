import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '../../../../lib/supabase';

const WEBHOOK_AUTH_KEY = process.env.REVENUECAT_WEBHOOK_KEY;

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
    return NextResponse.json({ error: 'No event' }, { status: 400 });
  }

  const appUserId = event.app_user_id;
  const eventType = event.type;

  if (!appUserId) {
    return NextResponse.json({ error: 'No app_user_id' }, { status: 400 });
  }

  const serviceClient = createServiceClient();

  // 3. Update tier based on event type
  // Events that grant/restore premium access
  const activateEvents = [
    'INITIAL_PURCHASE',
    'RENEWAL',
    'PRODUCT_CHANGE',
    'UNCANCELLATION',
  ];
  // Only EXPIRATION truly revokes access.
  // BILLING_ISSUE is NOT here — RevenueCat retries billing automatically.
  // CANCELLATION is NOT here — user keeps access until period ends.
  const deactivateEvents = [
    'EXPIRATION',
  ];

  let newTier: string | null = null;

  if (activateEvents.includes(eventType)) {
    newTier = 'standard';
  } else if (deactivateEvents.includes(eventType)) {
    newTier = 'free';
  }

  if (newTier) {
    const { error } = await serviceClient
      .from('profiles')
      .update({ tier: newTier, updated_at: new Date().toISOString() })
      .eq('id', appUserId);

    if (error) {
      console.error('Failed to update tier:', error);
      return NextResponse.json({ error: 'Failed to update tier' }, { status: 500 });
    }

    console.log(`Updated user ${appUserId} tier to ${newTier} (event: ${eventType})`);
  }

  return NextResponse.json({ ok: true });
}
