import { supabase } from '@/src/lib/supabase';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

export async function deleteAccount(): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/api/account/delete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}` },
  });

  if (!response.ok) {
    throw new Error('Failed to delete account');
  }
}

/** Sync subscription tier to server. Fire-and-forget — failures are non-fatal. */
export async function syncSubscriptionTier(isPremium: boolean): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  try {
    await fetch(`${API_BASE_URL}/api/account/sync-subscription`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isPremium }),
    });
  } catch {
    // Non-fatal — webhook is the primary mechanism
  }
}
