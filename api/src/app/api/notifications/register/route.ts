import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '../../../../lib/supabase';
import { authenticateRequest } from '../../../../lib/auth';

export async function POST(request: NextRequest) {
  // 1. Validate auth
  const { user, error: authError } = await authenticateRequest(request);
  if (authError) return authError;

  // 2. Parse body
  const body = await request.json();
  const {
    push_token,
    notifications_enabled,
    notification_time,
    timezone,
    language,
  } = body;

  // 3. Build update object (only include provided fields)
  const update: Record<string, unknown> = {};
  if (push_token !== undefined) update.push_token = push_token;
  if (notifications_enabled !== undefined) update.notifications_enabled = notifications_enabled;
  if (notification_time !== undefined) update.notification_time = notification_time;
  if (timezone !== undefined) update.timezone = timezone;
  if (language !== undefined) update.language = language;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const serviceClient = createServiceClient();

  // 4. If push_token provided, clear it from other profiles first (uniqueness)
  if (push_token) {
    await serviceClient
      .from('profiles')
      .update({ push_token: null })
      .eq('push_token', push_token)
      .neq('user_id', user.id);
  }

  // 5. Update profile
  const { error: updateError } = await serviceClient
    .from('profiles')
    .update(update)
    .eq('user_id', user.id);

  if (updateError) {
    console.error('Failed to update notification preferences:', updateError);
    return NextResponse.json({ error: 'Failed to update preferences' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
