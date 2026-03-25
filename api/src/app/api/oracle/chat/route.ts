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
import { checkRateLimit } from '../../../../lib/rate-limit';
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
- Keep responses very short: 2-4 sentences maximum. Be direct, specific, and meaningful — no filler, no preamble
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

  // 2. Rate limit — max 10 requests per minute per user
  const rateCheck = checkRateLimit(`oracle:${user.id}`, 10, 60_000);
  if (rateCheck.limited) {
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(rateCheck.retryAfterMs / 1000)) },
      },
    );
  }

  // 3. Parse request
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

  // 4. Check quota
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

  // 5. Conversation persistence
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

  // 6. Build context with history
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

  // 7. Call Claude API with streaming
  const stream = anthropic.messages.stream({
    model: ORACLE_MODEL,
    max_tokens: ORACLE_MAX_TOKENS,
    temperature: ORACLE_TEMPERATURE,
    system: systemPrompt,
    messages: claudeMessages,
  });

  // 8. Return SSE stream, saving assistant response on completion
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
