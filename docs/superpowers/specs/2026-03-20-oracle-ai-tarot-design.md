# Sub-project 4: Oracle AI & Tarot — Design Spec

## Goal

Connect the Oracle chat to Claude API for real AI-powered astrology readings, implement Siam Si fortune stick ceremony with shake gesture, and add daily quota enforcement per tier.

## Architecture

The Oracle chat sends user messages to a Next.js API endpoint that calls Claude API with a system prompt enriched with the user's birth data and astrology context. Responses stream back to the client. Messages are persisted in Supabase for account users (Standard tier gets persistent memory across sessions).

Siam Si uses the device accelerometer (expo-sensors) to detect shake gestures, then draws from a pool of 28 traditional fortune sticks using a deterministic algorithm seeded by userId + month + draw count.

Quota enforcement happens client-side (optimistic) with server-side validation. Free tier: 1 Oracle question/day, 5 Siam Si/month. Standard: unlimited both.

## Tech Stack

- Claude API via Anthropic SDK (server-side, in Next.js API)
- expo-sensors (accelerometer for shake detection)
- Supabase (message storage, quota tracking)
- Zustand + MMKV (local chat state and quota cache)

---

## Scope

### In Scope

1. `/api/oracle/chat` endpoint with Claude API integration
2. Streaming response rendering in chat UI
3. System prompt with birth data context
4. Chat message persistence in Supabase (account users)
5. Daily question quota enforcement (free: 1/day, standard: unlimited)
6. Siam Si shake-to-draw fortune stick screen
7. Siam Si monthly quota (free: 5/month, standard: unlimited)
8. Oracle store for local state management
9. Updated Oracle chat screen with real API connection

### Out of Scope

- Tarot card spreads (V2 — full 78-card deck with visual cards)
- Strategist mode (V2 — locked in UI already)
- Persistent memory across sessions (Standard tier feature, but deferred — requires conversation summarization)
- Voice input (mic button is decorative for V1)
- Push notifications for Oracle

---

## Component Design

### 1. Oracle Chat API Endpoint

**Route:** `POST /api/oracle/chat`

**Auth:** Supabase JWT from Authorization header.

**Request body:**
```typescript
interface OracleChatRequest {
  message: string;
  conversationId?: string;    // for message threading
  birthData?: {               // sent on first message of session
    dateOfBirth: string;
    fullName?: string;
    concerns: string[];
  };
}
```

**Response:** Server-Sent Events (SSE) stream of text chunks.

**System prompt includes:**
- User's birth data (zodiac sign, life path number, element)
- Current date and planetary context
- Persona: mystical Thai astrologer ("Mor Doo") who blends Thai, Chinese, and Western astrology
- Instruction to keep responses concise (2-3 paragraphs max)
- Instruction to reference specific astrological positions relevant to the question

**Claude API call:**
- Model: `claude-sonnet-4-6` (fast, cost-effective for chat)
- Max tokens: 500
- Stream: true
- Temperature: 0.8 (creative but grounded)

### 2. Chat Message Storage

**Supabase `oracle_messages` table:**
```sql
CREATE TABLE public.oracle_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_oracle_messages_user_conv
  ON public.oracle_messages(user_id, conversation_id, created_at);

ALTER TABLE public.oracle_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own messages"
  ON public.oracle_messages FOR SELECT USING (auth.uid() = user_id);
```

### 3. Quota Tracking

**Supabase `user_quotas` table:**
```sql
CREATE TABLE public.user_quotas (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  oracle_questions_today INTEGER DEFAULT 0,
  oracle_last_reset DATE DEFAULT CURRENT_DATE,
  siam_si_this_month INTEGER DEFAULT 0,
  siam_si_last_reset DATE DEFAULT CURRENT_DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own quotas"
  ON public.user_quotas FOR SELECT USING (auth.uid() = user_id);
```

The API endpoint checks and increments quotas before processing. Resets happen when `oracle_last_reset < today` or `siam_si_last_reset` is in a previous month.

### 4. Oracle Store

**File:** `src/stores/oracleStore.ts`

```typescript
interface OracleState {
  messages: ChatMessage[];
  conversationId: string | null;
  isStreaming: boolean;
  oracleQuestionsToday: number;
  siamSiThisMonth: number;

  addMessage(msg: ChatMessage): void;
  appendToLastMessage(chunk: string): void;
  setStreaming(streaming: boolean): void;
  incrementOracleQuota(): void;
  incrementSiamSiQuota(): void;
  resetDailyQuota(): void;
  resetMonthlyQuota(): void;
  clearConversation(): void;
}
```

Persisted with MMKV. Quota resets are checked on app foreground.

### 5. Oracle Chat Service

**File:** `src/services/oracle.ts`

Handles SSE streaming from the API:
```typescript
export async function sendOracleMessage(
  message: string,
  birthData: BirthDataInput | null,
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError: (error: Error) => void,
): Promise<void>
```

Uses `fetch` with `ReadableStream` to process SSE chunks. Gets fresh token via `supabase.auth.getSession()`.

### 6. Siam Si Fortune Sticks

**File:** `shared/siam-si.ts`

28 fortune sticks with traditional Thai fortune texts (bilingual EN/TH). Each stick has:
```typescript
interface SiamSiStick {
  number: number;        // 1-28
  fortune: 'excellent' | 'good' | 'fair' | 'caution';
  titleEn: string;
  titleTh: string;
  meaningEn: string;
  meaningTh: string;
}
```

Draw function: deterministic based on `hash(userId + yearMonth + drawIndex)`.

**File:** `src/hooks/useSiamSi.ts`

Uses `expo-sensors` Accelerometer to detect shake (magnitude > threshold for sustained period). Returns `{ isShaking, draw, currentStick, drawsRemaining }`.

**File:** `app/(main)/oracle/siam-si.tsx`

Full-screen modal with:
- Instruction text ("Focus on your question, then shake your phone")
- Animated fortune stick container
- On shake: reveal fortune stick with number, fortune level, and meaning
- Draw count display
- Back button to return to Oracle chat

### 7. Updated Oracle Screen

Modifications to `app/(main)/oracle/index.tsx`:
- Replace mock `handleSend` with real API call via `sendOracleMessage`
- Add streaming text rendering (append chunks to last assistant message)
- Add Siam Si entry button (replaces the ⊕ plus button)
- Add quota display for free tier users
- Show upgrade prompt when quota exceeded
- Remove the Strategist mode toggle (V2) — or keep it locked with "Coming Soon"

---

## Data Flow

```
User types question → Oracle screen
  → Check quota (oracleStore)
  → If exceeded: show upgrade prompt
  → If OK: POST /api/oracle/chat (with JWT + message + birth data)
    → API validates JWT, checks server-side quota
    → API calls Claude API with system prompt + user message
    → Claude streams response via SSE
  → Client renders chunks in real-time
  → On completion: save messages to Supabase (account users)
  → Increment quota counter

Siam Si shake:
  → Accelerometer detects shake
  → Check monthly quota
  → If OK: compute fortune stick from deterministic draw
  → Display fortune
  → Increment quota
```

---

## Environment Variables

**Vercel API (add to existing):**
```
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Error Handling

- **Claude API timeout:** Show "The Oracle is meditating... try again" with retry button
- **Quota exceeded:** Show inline upgrade prompt with tier comparison
- **Network error:** Keep message in local state, retry on reconnect
- **Accelerometer unavailable:** Show manual "Draw" button as fallback for Siam Si
