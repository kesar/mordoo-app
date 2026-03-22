import { supabase } from '@/src/lib/supabase';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

interface SendMessageParams {
  message: string;
  birthData?: {
    dateOfBirth: string;
    fullName?: string;
    concerns: string[];
  };
  lang?: 'en' | 'th';
  onChunk: (chunk: string) => void;
  onDone: () => void;
  onError: (error: Error) => void;
}

export async function sendOracleMessage(params: SendMessageParams): Promise<void> {
  const { message, birthData, lang, onChunk, onDone, onError } = params;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    onError(new Error('Not authenticated'));
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/oracle/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ message, birthData, lang }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 429) {
        onError(new Error('QUOTA_EXCEEDED'));
        return;
      }
      onError(new Error(errorData.error || `API error: ${response.status}`));
      return;
    }

    const reader = response.body?.getReader();
    if (!reader) {
      onError(new Error('No response stream'));
      return;
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            onDone();
            return;
          }
          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              onChunk(parsed.text);
            }
            if (parsed.error) {
              onError(new Error(parsed.error));
              return;
            }
          } catch {
            // Skip malformed JSON chunks
          }
        }
      }
    }

    onDone();
  } catch (error) {
    onError(error instanceof Error ? error : new Error('Network error'));
  }
}

export interface SiamSiDrawResponse {
  number: number;
  fortune: 'excellent' | 'good' | 'fair' | 'caution';
  titleEn: string;
  titleTh: string;
  meaningEn: string;
  meaningTh: string;
  drawsUsed: number;
  drawsTotal: number | null;
  drawsRemaining: number | null;
}

export async function fetchSiamSiDraw(): Promise<SiamSiDrawResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/api/oracle/siam-si`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('QUOTA_EXCEEDED');
    }
    throw new Error(`Siam Si API error: ${response.status}`);
  }

  return response.json();
}
