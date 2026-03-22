# Oracle Conversation Persistence Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add server-side conversation persistence with daily containers, lazy summarization, and scrollable chat history.

**Architecture:** Two new Supabase tables (`oracle_conversations`, `oracle_messages`) store conversations by day. The chat API manages conversation lifecycle, saves messages, builds context from summaries + recent messages. Client fetches today's conversation on mount and lazy-loads history on scroll.

**Tech Stack:** Supabase PostgreSQL, Next.js 15 API routes, Anthropic SDK, Zustand + MMKV, React Native FlatList

---

## Chunk 1: Database & Server Infrastructure

### Task 1: Database Migration

**Files:**
- Create: `sql/migrations/20260322100000_oracle_conversations.sql`

- [ ] **Step 1: Write the migration SQL**

```sql
-- Create oracle_conversations table
CREATE TABLE public.oracle_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_date DATE NOT NULL,
  summary TEXT,
  summarized_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, conversation_date)
);

-- Create oracle_messages table
CREATE TABLE public.oracle_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.oracle_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_oracle_messages_conversation ON public.oracle_messages(conversation_id, created_at);
CREATE INDEX idx_oracle_messages_user ON public.oracle_messages(user_id);

-- RLS policies
ALTER TABLE public.oracle_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oracle_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON public.oracle_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own messages"
  ON public.oracle_messages FOR SELECT
  USING (auth.uid() = user_id);

-- Service role needs full access (API uses service client)
-- No INSERT/UPDATE policies needed for anon — API uses service role key
```

- [ ] **Step 2: Run the migration against Supabase**

Run: Open Supabase SQL editor and execute the migration script.
Expected: Tables created, RLS enabled, indexes in place.

- [ ] **Step 3: Commit**

```bash
git add sql/migrations/20260322100000_oracle_conversations.sql
git commit -m "feat: add oracle_conversations and oracle_messages tables"
```

---

### Task 2: Bangkok Date Helper

**Files:**
- Modify: `api/src/lib/date.ts`

- [ ] **Step 1: Add getBangkokDateString helper**

Add to `api/src/lib/date.ts`:

```typescript
/** Returns today's date in Bangkok timezone (UTC+7) as YYYY-MM-DD string. */
export function getBangkokDateString(now = new Date()): string {
  const bangkok = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return `${bangkok.getUTCFullYear()}-${String(bangkok.getUTCMonth() + 1).padStart(2, '0')}-${String(bangkok.getUTCDate()).padStart(2, '0')}`;
}
```

- [ ] **Step 2: Commit**

```bash
git add api/src/lib/date.ts
git commit -m "feat: add getBangkokDateString helper for timezone-aware dates"
```

---

### Task 3: Add Config Constants

**Files:**
- Modify: `api/src/lib/config.ts`

- [ ] **Step 1: Add conversation constants**

Add to `api/src/lib/config.ts`:

```typescript
/** Max recent messages to include in Claude context. */
export const MAX_CONTEXT_MESSAGES = 15;

/** Max days of summaries to include in Claude context. */
export const MAX_SUMMARY_DAYS = 30;

/** Max tokens for summarization responses. */
export const SUMMARY_MAX_TOKENS = 200;

/** Temperature for summarization (low for consistency). */
export const SUMMARY_TEMPERATURE = 0.3;
```

- [ ] **Step 2: Commit**

```bash
git add api/src/lib/config.ts
git commit -m "feat: add conversation persistence config constants"
```

---

### Task 4a: Shared Anthropic Client

**Files:**
- Create: `api/src/lib/anthropic.ts`

- [ ] **Step 1: Create shared Anthropic client**

Create `api/src/lib/anthropic.ts`:

```typescript
import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});
```

- [ ] **Step 2: Commit**

```bash
git add api/src/lib/anthropic.ts
git commit -m "refactor: extract shared Anthropic client"
```

---

### Task 4: Conversation Helper Module

**Files:**
- Create: `api/src/lib/conversation.ts`

This module centralizes all conversation DB operations and summarization logic, keeping the route handler clean.

- [ ] **Step 1: Create conversation.ts with findOrCreateConversation**

Create `api/src/lib/conversation.ts`:

```typescript
import type { SupabaseClient } from '@supabase/supabase-js';
import { anthropic } from './anthropic';
import {
  ORACLE_MODEL,
  SUMMARY_MAX_TOKENS,
  SUMMARY_TEMPERATURE,
  MAX_CONTEXT_MESSAGES,
  MAX_SUMMARY_DAYS,
} from './config';
import { getBangkokDateString } from './date';

/** Find or create today's conversation for a user. Uses upsert to avoid race conditions. */
export async function findOrCreateConversation(
  client: SupabaseClient,
  userId: string,
): Promise<{ id: string; conversationDate: string }> {
  const today = getBangkokDateString();

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
): Promise<void> {
  try {
    // Find the most recent unsummarized conversation (before today)
    const today = getBangkokDateString();

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
          content: `Summarize this conversation between a user and Mor Doo (an astrology advisor). Focus on:
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
```

- [ ] **Step 2: Commit**

```bash
git add api/src/lib/conversation.ts
git commit -m "feat: add conversation helper module with DB ops and summarization"
```

---

### Task 5: Rewrite Oracle Chat Route

**Files:**
- Modify: `api/src/app/api/oracle/chat/route.ts`

- [ ] **Step 1: Rewrite the route to use conversation persistence**

Replace the full contents of `api/src/app/api/oracle/chat/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '../../../../lib/supabase';
import { anthropic } from '../../../../lib/anthropic';
import { authenticateRequest } from '../../../../lib/auth';
import { getBangkokDateString } from '../../../../lib/date';
import {
  ORACLE_MODEL,
  ORACLE_MAX_TOKENS,
  ORACLE_TEMPERATURE,
  FREE_ORACLE_QUESTIONS_PER_DAY,
  PGRST_NOT_FOUND,
} from '../../../../lib/config';
import {
  findOrCreateConversation,
  saveMessage,
  getRecentMessages,
  getPastSummaries,
  summarizeConversation,
} from '../../../../lib/conversation';

function buildSystemPrompt(
  birthData?: { dateOfBirth: string; fullName?: string; concerns: string[] },
  lang?: string,
  summaries?: Array<{ date: string; summary: string }>,
) {
  let context = '';
  if (birthData) {
    const date = new Date(birthData.dateOfBirth);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const zodiac = getZodiacSign(month, day);
    const element = getElement(month);
    const chineseZodiac = getChineseZodiac(date.getFullYear());

    context = `
The seeker's birth data:
- Date of birth: ${birthData.dateOfBirth}
- Name: ${birthData.fullName || 'Unknown'}
- Western zodiac: ${zodiac}
- Element: ${element}
- Chinese zodiac: ${chineseZodiac}
- Life concerns: ${birthData.concerns.join(', ') || 'general guidance'}
`;
  }

  let summaryContext = '';
  if (summaries && summaries.length > 0) {
    summaryContext = `\nPrevious sessions with this seeker:\n${summaries.map((s) => `- ${s.date}: ${s.summary}`).join('\n')}\n`;
  }

  return `You are Mor Doo (หมอดู), a mystical Thai astrologer who blends Thai, Chinese, and Western astrology into deeply personal readings. You speak with ancient wisdom but in accessible modern language.

Your personality:
- Warm, mysterious, and insightful
- You reference specific astrological positions relevant to the seeker's question
- You blend Thai astrology (วันเกิด), Chinese zodiac, and Western zodiac naturally
- Keep responses concise: 1-2 short paragraphs maximum. Be direct and meaningful — no filler
- Use mystical but clear language — no generic fortune cookie responses
- Never use emojis — use words and markdown formatting (bold, italic) instead
- When appropriate, give specific actionable advice tied to astrological timing
- Today's date: ${getBangkokDateString()}
${context}${summaryContext}
${lang === 'th'
    ? 'ตอบเป็นภาษาไทยเสมอ ใช้ภาษาที่สุภาพและเข้าใจง่าย'
    : 'Always respond in English. Use clear, accessible language.'}`;
}

function getZodiacSign(month: number, day: number): string {
  const signs = [
    [20, 'Aquarius', 'Capricorn'], [19, 'Pisces', 'Aquarius'],
    [21, 'Aries', 'Pisces'], [20, 'Taurus', 'Aries'],
    [21, 'Gemini', 'Taurus'], [21, 'Cancer', 'Gemini'],
    [23, 'Leo', 'Cancer'], [23, 'Virgo', 'Leo'],
    [23, 'Libra', 'Virgo'], [23, 'Scorpio', 'Libra'],
    [22, 'Sagittarius', 'Scorpio'], [22, 'Capricorn', 'Sagittarius'],
  ];
  if (month < 1 || month > 12) return 'Unknown';
  const [cutoff, after, before] = signs[month - 1];
  return day >= (cutoff as number) ? (after as string) : (before as string);
}

function getElement(month: number): string {
  if (month >= 1 && month <= 3) return 'Water';
  if (month >= 4 && month <= 6) return 'Fire';
  if (month >= 7 && month <= 9) return 'Earth';
  return 'Air';
}

function getChineseZodiac(year: number): string {
  const animals = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake',
    'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
  return animals[(year - 4) % 12];
}

export async function POST(request: NextRequest) {
  // 1. Validate auth
  const { user, error: authError } = await authenticateRequest(request);
  if (authError) return authError;

  // 2. Parse request
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { message, birthData, lang: rawLang } = body as {
    message: string;
    birthData?: { dateOfBirth: string; fullName?: string; concerns: string[] };
    lang?: string;
  };

  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'Message required' }, { status: 400 });
  }

  if (birthData !== undefined) {
    if (
      typeof birthData !== 'object' ||
      birthData === null ||
      typeof birthData.dateOfBirth !== 'string' ||
      !Array.isArray(birthData.concerns)
    ) {
      return NextResponse.json({ error: 'Invalid birth data' }, { status: 400 });
    }
  }

  // 3. Check quota
  const serviceClient = createServiceClient();
  const today = getBangkokDateString();

  const { data: quota, error: quotaError } = await serviceClient
    .from('user_quotas')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (quotaError && quotaError.code !== PGRST_NOT_FOUND) {
    return NextResponse.json({ error: 'Failed to check quota' }, { status: 500 });
  }

  const { data: profile } = await serviceClient
    .from('profiles')
    .select('tier')
    .eq('id', user.id)
    .single();

  const tier = profile?.tier || 'free';
  const normalizedPhone = (user.phone || '').replace(/\D/g, '');
  const isTestUser = normalizedPhone === '66000000' || user.phone === '+66000000';
  const maxQuestions = (tier === 'standard' || isTestUser) ? Infinity : FREE_ORACLE_QUESTIONS_PER_DAY;

  if (quota) {
    const questionsToday = quota.oracle_last_reset === today
      ? quota.oracle_questions_today
      : 0;

    if (questionsToday >= maxQuestions) {
      return NextResponse.json({ error: 'Daily quota exceeded' }, { status: 429 });
    }

    const { error: updateError } = await serviceClient.from('user_quotas').update({
      oracle_questions_today: questionsToday + 1,
      oracle_last_reset: today,
      updated_at: new Date().toISOString(),
    }).eq('user_id', user.id);

    if (updateError) {
      console.error('Failed to update oracle quota:', updateError);
      return NextResponse.json({ error: 'Failed to update quota' }, { status: 500 });
    }
  } else {
    const { error: insertError } = await serviceClient.from('user_quotas').insert({
      user_id: user.id,
      oracle_questions_today: 1,
      oracle_last_reset: today,
    });

    if (insertError) {
      console.error('Failed to create oracle quota:', insertError);
      return NextResponse.json({ error: 'Failed to update quota' }, { status: 500 });
    }
  }

  // 4. Conversation persistence
  let conversation: { id: string; conversationDate: string };
  try {
    conversation = await findOrCreateConversation(serviceClient, user.id);
  } catch {
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }

  // Save user message immediately (before Claude call)
  await saveMessage(serviceClient, conversation.id, user.id, 'user', message);

  // Fire async summarization (non-blocking)
  summarizeConversation(serviceClient, user.id);

  // 5. Build context with history
  const [recentMessages, summaries] = await Promise.all([
    getRecentMessages(serviceClient, conversation.id),
    getPastSummaries(serviceClient, user.id, conversation.conversationDate),
  ]);

  const systemPrompt = buildSystemPrompt(
    birthData ?? undefined,
    rawLang ?? undefined,
    summaries,
  );

  // Build messages array: recent history + new message (already saved, included in recentMessages)
  const claudeMessages = recentMessages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  // 6. Call Claude API with streaming
  const stream = anthropic.messages.stream({
    model: ORACLE_MODEL,
    max_tokens: ORACLE_MAX_TOKENS,
    temperature: ORACLE_TEMPERATURE,
    system: systemPrompt,
    messages: claudeMessages,
  });

  // 7. Return SSE stream, saving assistant response on completion
  const encoder = new TextEncoder();
  let fullResponse = '';

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            fullResponse += event.delta.text;
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`),
            );
          }
        }

        // Save assistant response after successful stream
        await saveMessage(serviceClient, conversation.id, user.id, 'assistant', fullResponse);

        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Stream error';
        console.error('Oracle stream error:', err);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`),
        );
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
```

- [ ] **Step 2: Verify build passes**

Run: `cd api && npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 3: Commit**

```bash
git add api/src/app/api/oracle/chat/route.ts
git commit -m "feat: add conversation persistence and context to oracle chat"
```

---

### Task 6: Oracle Today Endpoint

**Files:**
- Create: `api/src/app/api/oracle/today/route.ts`

- [ ] **Step 1: Create the today endpoint**

Create `api/src/app/api/oracle/today/route.ts`:

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
git add api/src/app/api/oracle/today/route.ts
git commit -m "feat: add GET /api/oracle/today endpoint"
```

---

### Task 7: Oracle History Endpoint

**Files:**
- Create: `api/src/app/api/oracle/history/route.ts`

- [ ] **Step 1: Create the history endpoint**

Create `api/src/app/api/oracle/history/route.ts`:

```typescript
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
```

- [ ] **Step 2: Verify API build**

Run: `cd api && npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add api/src/app/api/oracle/today/route.ts api/src/app/api/oracle/history/route.ts
git commit -m "feat: add oracle today and history endpoints"
```

---

## Chunk 2: Client Updates

### Task 8: Update Oracle Store

**Files:**
- Modify: `src/stores/oracleStore.ts`

- [ ] **Step 1: Add conversation and history state to the store**

Replace full contents of `src/stores/oracleStore.ts`:

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/src/utils/zustand-mmkv';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface PastConversation {
  id: string;
  conversationDate: string;
  summary: string | null;
  messages: ChatMessage[];
}

interface OracleState {
  // Today's conversation
  conversationId: string | null;
  conversationDate: string | null;
  messages: ChatMessage[];
  isStreaming: boolean;

  // History (lazy-loaded, not persisted)
  pastConversations: PastConversation[];
  hasMoreHistory: boolean;
  isLoadingHistory: boolean;

  // Actions
  addMessage: (msg: ChatMessage) => void;
  removeLastMessage: () => void;
  appendToLastMessage: (chunk: string) => void;
  setStreaming: (streaming: boolean) => void;
  setTodayConversation: (id: string | null, date: string, messages: ChatMessage[]) => void;
  appendHistory: (conversations: PastConversation[], hasMore: boolean) => void;
  setLoadingHistory: (loading: boolean) => void;
  clearConversation: () => void;
}

export const useOracleStore = create<OracleState>()(
  persist(
    (set) => ({
      conversationId: null,
      conversationDate: null,
      messages: [],
      isStreaming: false,
      pastConversations: [],
      hasMoreHistory: true,
      isLoadingHistory: false,

      addMessage: (msg) => set((state) => ({
        messages: [...state.messages, msg],
      })),

      removeLastMessage: () => set((state) => ({
        messages: state.messages.slice(0, -1),
      })),

      appendToLastMessage: (chunk) => set((state) => {
        const messages = [...state.messages];
        if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
          messages[messages.length - 1] = {
            ...messages[messages.length - 1],
            content: messages[messages.length - 1].content + chunk,
          };
        }
        return { messages };
      }),

      setStreaming: (streaming) => set({ isStreaming: streaming }),

      setTodayConversation: (id, date, messages) => set({
        conversationId: id,
        conversationDate: date,
        messages,
      }),

      appendHistory: (conversations, hasMore) => set((state) => ({
        pastConversations: [...state.pastConversations, ...conversations],
        hasMoreHistory: hasMore,
      })),

      setLoadingHistory: (loading) => set({ isLoadingHistory: loading }),

      clearConversation: () => set({
        conversationId: null,
        conversationDate: null,
        messages: [],
        pastConversations: [],
        hasMoreHistory: true,
      }),
    }),
    {
      name: 'mordoo-oracle',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        conversationId: state.conversationId,
        conversationDate: state.conversationDate,
        messages: state.messages,
      }),
    },
  ),
);
```

- [ ] **Step 2: Commit**

```bash
git add src/stores/oracleStore.ts
git commit -m "feat: add conversation and history state to oracle store"
```

---

### Task 9: Add Service Functions

**Files:**
- Modify: `src/services/oracle.ts`

- [ ] **Step 1: Add fetchTodayConversation and fetchConversationHistory**

Add these functions to the end of `src/services/oracle.ts` (before the `fetchSiamSiDraw` export):

```typescript
export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface TodayConversationResponse {
  conversationId: string | null;
  conversationDate: string;
  messages: ConversationMessage[];
}

export interface PastConversationResponse {
  id: string;
  conversationDate: string;
  summary: string | null;
  messages: ConversationMessage[];
}

export interface HistoryResponse {
  conversations: PastConversationResponse[];
  hasMore: boolean;
}

export async function fetchTodayConversation(): Promise<TodayConversationResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/api/oracle/today`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch today's conversation: ${response.status}`);
  }

  return response.json();
}

export async function fetchConversationHistory(before?: string): Promise<HistoryResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const params = new URLSearchParams();
  if (before) params.set('before', before);

  const response = await fetch(`${API_BASE_URL}/api/oracle/history?${params}`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch history: ${response.status}`);
  }

  return response.json();
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/oracle.ts
git commit -m "feat: add fetchTodayConversation and fetchConversationHistory services"
```

---

### Task 10: Update Oracle Screen

**Files:**
- Modify: `app/(main)/oracle/index.tsx`

- [ ] **Step 1: Add imports for new services and types**

Add to the imports at the top of `app/(main)/oracle/index.tsx`:

```typescript
import {
  fetchTodayConversation,
  fetchConversationHistory,
  type ConversationMessage,
} from '@/src/services/oracle';
import type { PastConversation } from '@/src/stores/oracleStore';
```

Also add `useEffect, useMemo` to the React import:

```typescript
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
```

- [ ] **Step 2: Add date divider component**

Add this component after the existing `QuotaExceeded` component:

```typescript
function DateDivider({ date }: { date: string }) {
  const formatted = new Date(date + 'T00:00:00').toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
  return (
    <View style={styles.dateDivider}>
      <View style={styles.dateDividerLine} />
      <Text style={styles.dateDividerText}>{formatted}</Text>
      <View style={styles.dateDividerLine} />
    </View>
  );
}
```

- [ ] **Step 3: Add useEffect to load today's conversation on mount**

Inside `OracleScreen`, after the existing store selectors, add:

```typescript
const conversationDate = useOracleStore((s) => s.conversationDate);
const pastConversations = useOracleStore((s) => s.pastConversations);
const hasMoreHistory = useOracleStore((s) => s.hasMoreHistory);
const isLoadingHistory = useOracleStore((s) => s.isLoadingHistory);
const setTodayConversation = useOracleStore((s) => s.setTodayConversation);
const appendHistory = useOracleStore((s) => s.appendHistory);
const setLoadingHistory = useOracleStore((s) => s.setLoadingHistory);

// Load today's conversation on mount — always fetch to let server determine "today" (Bangkok time)
useEffect(() => {
  if (!isAuthenticated) return;

  fetchTodayConversation()
    .then((data) => {
      // Server returns the authoritative "today" date in Bangkok timezone
      if (data.conversationDate !== conversationDate) {
        const msgs = data.messages.map((m: ConversationMessage) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: m.createdAt,
        }));
        setTodayConversation(data.conversationId, data.conversationDate, msgs);
      }
    })
    .catch(() => {
      // Keep cached messages if fetch fails
    });
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [isAuthenticated]);
```

- [ ] **Step 4: Add loadMoreHistory function and update FlatList data**

Add after the useEffect:

```typescript
const loadMoreHistory = useCallback(() => {
  if (isLoadingHistory || !hasMoreHistory) return;

  const oldestDate = pastConversations.length > 0
    ? pastConversations[pastConversations.length - 1].conversationDate
    : conversationDate || undefined;

  if (!oldestDate) return;

  setLoadingHistory(true);
  fetchConversationHistory(oldestDate)
    .then((data) => {
      const mapped: PastConversation[] = data.conversations.map((c) => ({
        id: c.id,
        conversationDate: c.conversationDate,
        summary: c.summary,
        messages: c.messages.map((m) => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: m.createdAt,
        })),
      }));
      appendHistory(mapped, data.hasMore);
    })
    .catch(() => {})
    .finally(() => setLoadingHistory(false));
}, [isLoadingHistory, hasMoreHistory, pastConversations, conversationDate, setLoadingHistory, appendHistory]);
```

- [ ] **Step 5: Update displayMessages and invertedMessages to include history with date dividers**

Replace the existing `displayMessages` and `invertedMessages` lines with:

```typescript
type ListItem =
  | (ChatMessage & { type: 'message' })
  | { type: 'date-divider'; id: string; date: string };

const allItems = useMemo<ListItem[]>(() => {
  const items: ListItem[] = [];

  // Past conversations (oldest first since they're loaded in desc order)
  const pastReversed = [...pastConversations].reverse();
  for (const conv of pastReversed) {
    items.push({ type: 'date-divider', id: `div-${conv.conversationDate}`, date: conv.conversationDate });
    for (const msg of conv.messages) {
      items.push({ ...msg, type: 'message' });
    }
  }

  // Today's messages
  const todayMsgs = messages.length === 0 ? [WELCOME_MESSAGE] : messages;
  if (conversationDate && pastConversations.length > 0) {
    items.push({ type: 'date-divider', id: `div-${conversationDate}`, date: conversationDate });
  }
  for (const msg of todayMsgs) {
    items.push({ ...msg, type: 'message' });
  }

  return items;
}, [messages, pastConversations, conversationDate]);

const invertedItems = useMemo(() => [...allItems].reverse(), [allItems]);
```

- [ ] **Step 6: Update renderItem and FlatList**

Replace the existing `renderItem` callback:

```typescript
const renderItem = useCallback(
  ({ item }: { item: ListItem }) => {
    if (item.type === 'date-divider') return <DateDivider date={item.date} />;
    if (item.role === 'assistant') return <AiMessageBubble message={item} />;
    return <UserMessageBubble message={item} />;
  },
  [],
);
```

Update `flatListRef` type to match new data:

```typescript
const flatListRef = useRef<FlatList<ListItem>>(null);
```

Update the FlatList component to add `onEndReached`:

```tsx
<FlatList
  ref={flatListRef}
  data={invertedItems}
  keyExtractor={(item) => item.id}
  renderItem={renderItem}
  inverted={true}
  keyboardDismissMode="on-drag"
  keyboardShouldPersistTaps="handled"
  contentContainerStyle={styles.messageList}
  onEndReached={loadMoreHistory}
  onEndReachedThreshold={0.5}
  ListHeaderComponent={
    <>
      {isStreaming ? <TypingIndicator /> : null}
      {quotaExceeded ? <QuotaExceeded /> : null}
    </>
  }
/>
```

- [ ] **Step 7: Add date divider styles**

Add these to the StyleSheet:

```typescript
dateDivider: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 12,
  gap: 10,
},
dateDividerLine: {
  flex: 1,
  height: StyleSheet.hairlineWidth,
  backgroundColor: 'rgba(201,168,76,0.2)',
},
dateDividerText: {
  fontFamily: fonts.display.regular,
  fontSize: 11,
  color: 'rgba(201,168,76,0.5)',
  letterSpacing: 1,
  textTransform: 'uppercase',
},
```

- [ ] **Step 8: Verify app compiles**

Run: `npx tsc --noEmit`
Expected: No errors related to oracle files.

- [ ] **Step 9: Commit**

```bash
git add app/(main)/oracle/index.tsx
git commit -m "feat: add conversation history with date dividers to oracle screen"
```

---

### Task 11: Manual End-to-End Testing

- [ ] **Step 1: Run the migration on Supabase**

Execute `sql/migrations/20260322100000_oracle_conversations.sql` in the Supabase SQL editor.

- [ ] **Step 2: Deploy API and start app**

Deploy the API to Vercel (or test locally with `cd api && npm run dev`).
Start the mobile app with `npm start`.

- [ ] **Step 3: Test conversation persistence**

1. Sign in with test account (+66000000)
2. Send a message to the Oracle
3. Verify the message and response appear in the chat
4. Close and reopen the app — verify messages persist
5. Check Supabase tables: `oracle_conversations` should have a row, `oracle_messages` should have user + assistant messages

- [ ] **Step 4: Test history scroll-back**

1. Manually insert a past conversation in Supabase (different date) with messages
2. Scroll up in the chat — verify date divider and old messages appear
3. Verify lazy loading triggers on scroll

- [ ] **Step 5: Test summarization**

1. Send messages on one day (or manually set a conversation's date to yesterday)
2. Send a message today
3. Check `oracle_conversations` table — yesterday's conversation should get a summary

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: oracle conversation persistence — complete"
```
