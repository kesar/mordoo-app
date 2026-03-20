import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createServiceClient, createAuthClient } from '../../../../lib/supabase';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

function buildSystemPrompt(birthData?: {
  dateOfBirth: string;
  fullName?: string;
  concerns: string[];
}) {
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
Respond in the same language the seeker uses. If they write in Thai, respond in Thai. If English, respond in English.`;
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
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Missing authorization' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const token = authHeader.slice(7);

  const authClient = createAuthClient(token);
  const { data: { user }, error: userError } = await authClient.auth.getUser();
  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 2. Parse request
  const body = await request.json();
  const { message, birthData } = body as {
    message: string;
    birthData?: { dateOfBirth: string; fullName?: string; concerns: string[] };
  };

  if (!message || typeof message !== 'string') {
    return new Response(JSON.stringify({ error: 'Message required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 3. Check quota
  const serviceClient = createServiceClient();
  const today = new Date().toISOString().split('T')[0];

  const { data: quota } = await serviceClient
    .from('user_quotas')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Get user tier
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('tier')
    .eq('id', user.id)
    .single();

  const tier = profile?.tier || 'free';
  const maxQuestions = tier === 'standard' ? Infinity : 1;

  if (quota) {
    const questionsToday = quota.oracle_last_reset === today
      ? quota.oracle_questions_today
      : 0;

    if (questionsToday >= maxQuestions) {
      return new Response(JSON.stringify({ error: 'Daily quota exceeded' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Increment quota
    await serviceClient.from('user_quotas').update({
      oracle_questions_today: questionsToday + 1,
      oracle_last_reset: today,
      updated_at: new Date().toISOString(),
    }).eq('user_id', user.id);
  } else {
    // Create quota record
    await serviceClient.from('user_quotas').insert({
      user_id: user.id,
      oracle_questions_today: 1,
      oracle_last_reset: today,
    });
  }

  // 4. Call Claude API with streaming
  const systemPrompt = buildSystemPrompt(birthData ?? undefined);

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    temperature: 0.8,
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
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`),
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
