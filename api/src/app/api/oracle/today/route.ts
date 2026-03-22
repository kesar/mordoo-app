import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '../../../../lib/supabase';
import { authenticateRequest } from '../../../../lib/auth';
import { getBangkokDateString } from '../../../../lib/date';

export async function GET(request: NextRequest) {
  const { user, error: authError } = await authenticateRequest(request);
  if (authError) return authError;

  const serviceClient = createServiceClient();
  const today = getBangkokDateString();

  // Find today's conversation
  const { data: conversation } = await serviceClient
    .from('oracle_conversations')
    .select('id, conversation_date')
    .eq('user_id', user.id)
    .eq('conversation_date', today)
    .single();

  if (!conversation) {
    return NextResponse.json({
      conversationId: null,
      conversationDate: today,
      messages: [],
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
  });
}
