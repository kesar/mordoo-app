import { NextResponse } from 'next/server';
import { createAuthClient } from './supabase';
import type { User } from '@supabase/supabase-js';

type AuthResult =
  | { user: User; error: null }
  | { user: null; error: NextResponse };

export async function authenticateRequest(request: Request): Promise<AuthResult> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Missing authorization' }, { status: 401 }),
    };
  }

  const token = authHeader.slice(7);
  const authClient = createAuthClient(token);
  const { data: { user }, error: userError } = await authClient.auth.getUser();

  if (userError || !user) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Invalid token' }, { status: 401 }),
    };
  }

  return { user, error: null };
}
