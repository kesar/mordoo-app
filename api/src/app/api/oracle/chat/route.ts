import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createServiceClient } from '../../../../lib/supabase';
import { authenticateRequest } from '../../../../lib/auth';
import { getTodayString } from '../../../../lib/date';
import {
  ORACLE_MODEL,
  ORACLE_MAX_TOKENS,
  ORACLE_TEMPERATURE,
  FREE_ORACLE_QUESTIONS_PER_DAY,
  PGRST_NOT_FOUND,
} from '../../../../lib/config';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

function buildSystemPrompt(birthData?: {
  dateOfBirth: string;
  fullName?: string;
  concerns: string[];
}, lang?: string) {
  let context = '';
  if (birthData) {
    const date = new Date(birthData.dateOfBirth);
    const month = date.getMonth() + 1;
    const day = date.getDate();

    // Simple zodiac calculation
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

  return `You are Mor Doo (หมอดู), a mystical Thai astrologer who blends Thai, Chinese, and Western astrology into deeply personal readings. You speak with ancient wisdom but in accessible modern language.

Your personality:
- Warm, mysterious, and insightful
- You reference specific astrological positions relevant to the seeker's question
- You blend Thai astrology (วันเกิด), Chinese zodiac, and Western zodiac naturally
- Keep responses concise: 2-3 short paragraphs maximum
- Use mystical but clear language — no generic fortune cookie responses
- When appropriate, give specific actionable advice tied to astrological timing
- Today's date: ${new Date().toISOString().split('T')[0]}
${context}
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

  // Validate birthData shape if provided
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
  const today = getTodayString();

  const { data: quota, error: quotaError } = await serviceClient
    .from('user_quotas')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (quotaError && quotaError.code !== PGRST_NOT_FOUND) {
    return NextResponse.json({ error: 'Failed to check quota' }, { status: 500 });
  }

  // Get user tier
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('tier')
    .eq('id', user.id)
    .single();

  const tier = profile?.tier || 'free';
  const maxQuestions = tier === 'standard' ? Infinity : FREE_ORACLE_QUESTIONS_PER_DAY;

  if (quota) {
    const questionsToday = quota.oracle_last_reset === today
      ? quota.oracle_questions_today
      : 0;

    if (questionsToday >= maxQuestions) {
      return NextResponse.json({ error: 'Daily quota exceeded' }, { status: 429 });
    }

    // Increment quota
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
    // Create quota record
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

  // 4. Call Claude API with streaming
  const systemPrompt = buildSystemPrompt(birthData ?? undefined, rawLang ?? undefined);

  const stream = await anthropic.messages.stream({
    model: ORACLE_MODEL,
    max_tokens: ORACLE_MAX_TOKENS,
    temperature: ORACLE_TEMPERATURE,
    system: systemPrompt,
    messages: [{ role: 'user', content: message }],
  });

  // 5. Return SSE stream
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`),
            );
          }
        }
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
