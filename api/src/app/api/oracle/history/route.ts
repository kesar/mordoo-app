import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '../../../../lib/supabase';
import { authenticateRequest } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  const { user, error: authError } = await authenticateRequest(request);
  if (authError) return authError;

  const { searchParams } = new URL(request.url);
  const before = searchParams.get('before');
  const limit = Math.min(Number(searchParams.get('limit')) || 7, 30);

  const serviceClient = createServiceClient();

  // Query conversations with optional cursor
  let query = serviceClient
    .from('oracle_conversations')
    .select('id, conversation_date, summary')
    .eq('user_id', user.id)
    .order('conversation_date', { ascending: false })
    .limit(limit + 1); // Fetch one extra to determine hasMore

  if (before) {
    query = query.lt('conversation_date', before);
  }

  const { data: conversations, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }

  const hasMore = (conversations?.length || 0) > limit;
  const conversationsToReturn = (conversations || []).slice(0, limit);

  if (conversationsToReturn.length === 0) {
    return NextResponse.json({ conversations: [], hasMore: false });
  }

  // Fetch all messages for all conversations in one query (avoids N+1)
  const convIds = conversationsToReturn.map((c) => c.id);
  const { data: allMessages } = await serviceClient
    .from('oracle_messages')
    .select('id, conversation_id, role, content, created_at')
    .in('conversation_id', convIds)
    .order('created_at', { ascending: true });

  // Group messages by conversation_id
  const messagesByConv = new Map<string, typeof allMessages>();
  for (const m of allMessages || []) {
    const list = messagesByConv.get(m.conversation_id) || [];
    list.push(m);
    messagesByConv.set(m.conversation_id, list);
  }

  // Build response, filtering out empty conversations
  const results = conversationsToReturn
    .map((conv) => {
      const msgs = messagesByConv.get(conv.id) || [];
      return {
        id: conv.id,
        conversationDate: conv.conversation_date,
        summary: conv.summary,
        messages: msgs.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: m.created_at,
        })),
      };
    })
    .filter((c) => c.messages.length > 0);

  return NextResponse.json({
    conversations: results,
    hasMore,
  });
}
