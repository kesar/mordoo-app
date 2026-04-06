import type { SupabaseClient } from '@supabase/supabase-js';
import { anthropic } from './anthropic';
import {
  ORACLE_MODEL,
  SUMMARY_MAX_TOKENS,
  SUMMARY_TEMPERATURE,
  MAX_CONTEXT_MESSAGES,
  MAX_SUMMARY_DAYS,
} from './config';
import { getDateStringForTimezone } from './date';

/** Find or create today's conversation for a user. Uses upsert to avoid race conditions. */
export async function findOrCreateConversation(
  client: SupabaseClient,
  userId: string,
  timezone: string,
): Promise<{ id: string; conversationDate: string }> {
  const today = getDateStringForTimezone(timezone);

  // Try to find existing
  const { data: existing } = await client
    .from('oracle_conversations')
    .select('id, conversation_date')
    .eq('user_id', userId)
    .eq('conversation_date', today)
    .single();

  if (existing) {
    return { id: existing.id, conversationDate: existing.conversation_date };
  }

  // Create new — use upsert to handle race conditions
  const { data: created, error } = await client
    .from('oracle_conversations')
    .upsert(
      { user_id: userId, conversation_date: today },
      { onConflict: 'user_id,conversation_date' },
    )
    .select('id, conversation_date')
    .single();

  if (error || !created) {
    throw new Error('Failed to create conversation');
  }

  return { id: created.id, conversationDate: created.conversation_date };
}

/** Save a message to the database. */
export async function saveMessage(
  client: SupabaseClient,
  conversationId: string,
  userId: string,
  role: 'user' | 'assistant',
  content: string,
): Promise<void> {
  const { error } = await client.from('oracle_messages').insert({
    conversation_id: conversationId,
    user_id: userId,
    role,
    content,
  });

  if (error) {
    console.error(`Failed to save ${role} message:`, error);
  }
}

/** Get the last N messages from a conversation, ensuring proper role alternation for Claude. */
export async function getRecentMessages(
  client: SupabaseClient,
  conversationId: string,
  limit: number = MAX_CONTEXT_MESSAGES,
): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
  const { data, error } = await client
    .from('oracle_messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error || !data) return [];

  // Take last N messages
  const recent = data.slice(-limit);

  // Ensure messages start with 'user' and alternate properly
  // Drop leading assistant messages
  const startIdx = recent.findIndex((m) => m.role === 'user');
  if (startIdx === -1) return [];
  const trimmed = recent.slice(startIdx);

  // Merge consecutive same-role messages
  const merged: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  for (const m of trimmed) {
    const last = merged[merged.length - 1];
    if (last && last.role === m.role) {
      last.content += '\n\n' + m.content;
    } else {
      merged.push({ role: m.role as 'user' | 'assistant', content: m.content });
    }
  }

  return merged;
}

/** Get summaries from the last N days for context. */
export async function getPastSummaries(
  client: SupabaseClient,
  userId: string,
  excludeDate: string,
): Promise<Array<{ date: string; summary: string }>> {
  const { data, error } = await client
    .from('oracle_conversations')
    .select('conversation_date, summary')
    .eq('user_id', userId)
    .not('summary', 'is', null)
    .neq('conversation_date', excludeDate)
    .order('conversation_date', { ascending: false })
    .limit(MAX_SUMMARY_DAYS);

  if (error || !data) return [];

  // Return in chronological order
  return data
    .reverse()
    .map((c) => ({ date: c.conversation_date, summary: c.summary }));
}

/** Summarize a conversation asynchronously. Does not throw — logs errors. */
export async function summarizeConversation(
  client: SupabaseClient,
  userId: string,
  timezone: string,
): Promise<void> {
  try {
    // Find the most recent unsummarized conversation (before today)
    const today = getDateStringForTimezone(timezone);

    const { data: conv } = await client
      .from('oracle_conversations')
      .select('id, conversation_date')
      .eq('user_id', userId)
      .is('summary', null)
      .lt('conversation_date', today)
      .order('conversation_date', { ascending: false })
      .limit(1)
      .single();

    if (!conv) return; // Nothing to summarize

    // Get all messages from that conversation
    const { data: messages } = await client
      .from('oracle_messages')
      .select('role, content')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: true });

    if (!messages || messages.length === 0) return;

    // Format conversation for summarization
    const transcript = messages
      .map((m) => `${m.role === 'user' ? 'User' : 'Mor Doo'}: ${m.content}`)
      .join('\n\n');

    const response = await anthropic.messages.create({
      model: ORACLE_MODEL,
      max_tokens: SUMMARY_MAX_TOKENS,
      temperature: SUMMARY_TEMPERATURE,
      messages: [
        {
          role: 'user',
          content: `Summarize this conversation between a user and Mor Doo (a Thai wisdom counselor). Focus on:
- The user's main concerns and questions
- Key advice or predictions given
- The user's emotional state and reactions
- Any recurring themes or patterns

Keep the summary concise (2-4 sentences). Write in third person.

Conversation:
${transcript}`,
        },
      ],
    });

    const summary =
      response.content[0].type === 'text' ? response.content[0].text : null;

    if (summary) {
      await client
        .from('oracle_conversations')
        .update({
          summary,
          summarized_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', conv.id);
    }
  } catch (err) {
    console.error('Summarization failed (non-blocking):', err);
  }
}
