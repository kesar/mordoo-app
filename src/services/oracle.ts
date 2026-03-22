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

  // Use XMLHttpRequest for streaming — React Native's fetch doesn't support ReadableStream
  const xhr = new XMLHttpRequest();
  xhr.open('POST', `${API_BASE_URL}/api/oracle/chat`);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.setRequestHeader('Authorization', `Bearer ${session.access_token}`);

  let lastIndex = 0;
  let settled = false;

  const settle = (fn: () => void) => {
    if (!settled) {
      settled = true;
      fn();
    }
  };

  xhr.onprogress = () => {
    const newText = xhr.responseText.slice(lastIndex);
    lastIndex = xhr.responseText.length;

    const chunks = newText.split('\n\n');
    for (const chunk of chunks) {
      if (!chunk.startsWith('data: ')) continue;
      const data = chunk.slice(6);
      if (data === '[DONE]') {
        settle(onDone);
        return;
      }
      try {
        const parsed = JSON.parse(data);
        if (parsed.text) onChunk(parsed.text);
        if (parsed.error) {
          settle(() => onError(new Error(parsed.error)));
          return;
        }
      } catch {
        // Skip malformed JSON chunks
      }
    }
  };

  xhr.onload = () => {
    if (xhr.status === 429) {
      settle(() => onError(new Error('QUOTA_EXCEEDED')));
      return;
    }
    if (xhr.status !== 200) {
      let errorMsg = `API error: ${xhr.status}`;
      try {
        const parsed = JSON.parse(xhr.responseText);
        if (parsed.error) errorMsg = parsed.error;
      } catch { /* use default */ }
      settle(() => onError(new Error(errorMsg)));
      return;
    }
    settle(onDone);
  };

  xhr.onerror = () => {
    settle(() => onError(new Error('Network error')));
  };

  xhr.send(JSON.stringify({ message, birthData, lang }));
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
