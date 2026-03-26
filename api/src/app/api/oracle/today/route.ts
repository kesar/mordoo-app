import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '../../../../lib/supabase';
import { authenticateRequest } from '../../../../lib/auth';
import { getDateStringForTimezone } from '../../../../lib/date';
import { FREE_ORACLE_QUESTIONS_PER_DAY } from '../../../../lib/config';

export async function GET(request: NextRequest) {
  const { user, error: authError } = await authenticateRequest(request);
  if (authError) return authError;

  const serviceClient = createServiceClient();

  // Fetch profile first (need timezone)
  const { data: profileData } = await serviceClient
    .from('profiles')
    .select('tier, timezone')
    .eq('id', user.id)
    .single();

  const timezone = profileData?.timezone ?? 'Asia/Bangkok';
  const today = getDateStringForTimezone(timezone);

  // Fetch conversation and quota in parallel
  const [conversationResult, quotaResult] = await Promise.all([
    serviceClient
      .from('oracle_conversations')
      .select('id, conversation_date')
      .eq('user_id', user.id)
      .eq('conversation_date', today)
      .single(),
    serviceClient
      .from('user_quotas')
      .select('oracle_questions_today, oracle_last_reset')
      .eq('user_id', user.id)
      .single(),
  ]);

  const tier = profileData?.tier || 'free';
  const normalizedPhone = (user.phone || '').replace(/\D/g, '');
  const isTestUser = normalizedPhone === '66000000' || user.phone === '+66000000';
  const isUnlimited = tier === 'standard' || isTestUser;
  const maxQuestions = isUnlimited ? null : FREE_ORACLE_QUESTIONS_PER_DAY;
  const questionsUsed = quotaResult.data?.oracle_last_reset === today
    ? quotaResult.data.oracle_questions_today
    : 0;

  const quota = {
    used: questionsUsed,
    total: maxQuestions,
    remaining: maxQuestions !== null ? Math.max(0, maxQuestions - questionsUsed) : null,
  };

  const conversation = conversationResult.data;

  if (!conversation) {
    return NextResponse.json({
      conversationId: null,
      conversationDate: today,
      messages: [],
      quota,
    });
  }

  // Get messages for today
  const { data: messages } = await serviceClient
    .from('oracle_messages')
    .select('id, role, content, created_at')
    .eq('conversation_id', conversation.id)
    .order('created_at', { ascending: true });

  return NextResponse.json({
    conversationId: conversation.id,
    conversationDate: conversation.conversation_date,
    messages: (messages || []).map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.created_at,
    })),
    quota,
  });
}
