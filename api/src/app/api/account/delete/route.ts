import { NextResponse } from 'next/server';
import { authenticateRequest } from '../../../../lib/auth';
import { createServiceClient } from '../../../../lib/supabase';

export async function POST(request: Request) {
  const { user, error } = await authenticateRequest(request);
  if (error) return error;

  const supabase = createServiceClient();

  // Delete user data from all tables (RLS won't apply with service role,
  // so we filter by user ID explicitly)
  const userId = user.id;

  const deletions = await Promise.allSettled([
    supabase.from('daily_readings').delete().eq('user_id', userId),
    supabase.from('user_quotas').delete().eq('user_id', userId),
    supabase.from('oracle_messages').delete().eq('user_id', userId),
    supabase.from('oracle_conversations').delete().eq('user_id', userId),
    supabase.from('push_tokens').delete().eq('user_id', userId),
    supabase.from('birth_data').delete().eq('user_id', userId),
    supabase.from('profiles').delete().eq('id', userId),
  ]);

  // Log any deletion failures but continue
  for (const result of deletions) {
    if (result.status === 'rejected') {
      console.error('Data deletion failed:', result.reason);
    }
  }

  // Delete the auth user via admin API
  const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);

  if (authDeleteError) {
    console.error('Auth user deletion failed:', authDeleteError);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
