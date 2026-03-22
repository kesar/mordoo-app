# Oracle Conversation Persistence & Memory

**Date:** 2026-03-22
**Status:** Approved

## Problem

Oracle chat is stateless — each message is sent to Claude without any conversation history. Messages are only stored client-side in MMKV. Users lose context between sessions, and Claude has no memory of past interactions.

## Solution

Server-side conversation persistence with daily conversation containers, lazy summarization of past days, and a scrollable chat history in the UI.

## Database Schema

### `oracle_conversations`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK, default gen_random_uuid() |
| user_id | UUID | FK → auth.users(id) ON DELETE CASCADE |
| conversation_date | DATE | The calendar day (Bangkok time) |
| summary | TEXT | AI-generated summary, null until summarized |
| summarized_at | TIMESTAMPTZ | When summary was generated |
| created_at | TIMESTAMPTZ | Default now() |
| updated_at | TIMESTAMPTZ | Default now() |

- UNIQUE constraint on `(user_id, conversation_date)` — also serves as index for history queries
- RLS: users can SELECT their own rows

### `oracle_messages`

| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK, default gen_random_uuid() |
| conversation_id | UUID | FK → oracle_conversations(id) ON DELETE CASCADE |
| user_id | UUID | Denormalized for RLS |
| role | TEXT | CHECK (role IN ('user', 'assistant')) |
| content | TEXT | Message content |
| created_at | TIMESTAMPTZ | Default now() |

- Index on `(conversation_id, created_at)`
- Index on `(user_id)` for RLS performance
- RLS: users can SELECT their own rows
- System messages are not stored — only user/assistant pairs

## Timezone Handling

The app targets Thai users. Day boundaries use **Bangkok time (UTC+7)**. The server computes today's date as:

```typescript
const bangkokToday = getTodayString(new Date(Date.now() + 7 * 60 * 60 * 1000));
```

This replaces the existing `getTodayString()` call which uses server-local time. A helper `getBangkokDateString()` will be added to `api/src/lib/date.ts`.

## API Changes

### Modified: `POST /api/oracle/chat`

**Request body** (unchanged):
```json
{
  "message": "string",
  "birthData": { "dateOfBirth": "string", "fullName": "string", "concerns": ["string"] },
  "lang": "en" | "th"
}
```

**New server-side behavior:**

1. Find or create today's `oracle_conversation` using upsert (`INSERT ... ON CONFLICT (user_id, conversation_date) DO NOTHING`) to avoid race conditions
2. Save the user message to `oracle_messages` immediately (before Claude call)
3. Check if the most recent previous conversation has no summary → if so, fire summarization **asynchronously** (do not block the response)
4. Build Claude messages array:
   - System prompt (birth data, personality, date, language)
   - Append last 30 days of conversation summaries in system prompt
   - Last 15 messages from today's conversation (as user/assistant message pairs)
   - The new user message
5. Stream Claude response
6. After stream completes: save assistant response to `oracle_messages`
7. If stream fails: assistant message is not saved, but user message is preserved

**Response:** unchanged (SSE stream)

### New: `GET /api/oracle/history`

Returns paginated conversation history for scroll-back.

**Query params:**
- `before` (optional, ISO date string) — cursor for pagination, returns conversations before this date
- `limit` (optional, default 7) — max conversations to return

**Response:**
```json
{
  "conversations": [
    {
      "id": "uuid",
      "conversationDate": "2026-03-21",
      "summary": "User asked about career change timing...",
      "messages": [
        { "id": "uuid", "role": "user", "content": "...", "createdAt": "..." },
        { "id": "uuid", "role": "assistant", "content": "...", "createdAt": "..." }
      ]
    }
  ],
  "hasMore": true
}
```

Only returns conversations that have at least one message.

### New: `GET /api/oracle/today`

Returns today's conversation and messages (used on app mount).

**Response:**
```json
{
  "conversationId": "uuid",
  "conversationDate": "2026-03-22",
  "messages": [
    { "id": "uuid", "role": "user", "content": "...", "createdAt": "..." },
    { "id": "uuid", "role": "assistant", "content": "...", "createdAt": "..." }
  ]
}
```

Returns `null` conversationId and empty messages array if no conversation exists for today.

## Summarization

**Trigger:** Lazy — on first message of a new day, if the previous conversation has no summary. Runs **asynchronously** (does not block the user's message).

**Failure handling:** If summarization fails (API error, timeout), log the error and skip. The conversation will be retried on the next message. Unsummarized conversations are simply excluded from the context window — no user-facing impact.

**Implementation:** Call Claude with a summarization prompt and the full conversation from that day.

**Summarization prompt:**
```
Summarize this conversation between a user and Mor Doo (an astrology advisor). Focus on:
- The user's main concerns and questions
- Key advice or predictions given
- The user's emotional state and reactions
- Any recurring themes or patterns

Keep the summary concise (2-4 sentences). Write in third person.
```

**Model:** Same as oracle chat (claude-sonnet-4-6), low temperature (0.3), max 200 tokens.

**Storage:** Written to `oracle_conversations.summary` with `summarized_at` timestamp.

## Claude Context Assembly

Summaries are capped at **last 30 days**. This bounds the token cost (~1,500-3,000 tokens for summaries) while providing good context for recurring users.

The message history constant (`MAX_CONTEXT_MESSAGES = 15`) is defined in `api/src/lib/config.ts` alongside existing constants.

```
┌─────────────────────────────────────────┐
│ System Prompt                           │
│  - Personality, birth data, date, lang  │
│  - Previous sessions (last 30 days):    │
│    "March 19: User asked about..."      │
│    "March 20: User was concerned..."    │
│    "March 21: User followed up on..."   │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ Last 15 messages from today             │
│  { role: 'user', content: '...' }       │
│  { role: 'assistant', content: '...' }  │
│  ...                                    │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ New user message                        │
└─────────────────────────────────────────┘
```

## Client Changes

### Oracle Store (`oracleStore.ts`)

```typescript
interface OracleState {
  // Today's conversation
  conversationId: string | null;
  conversationDate: string | null;  // YYYY-MM-DD
  messages: ChatMessage[];
  isStreaming: boolean;

  // History (lazy-loaded)
  pastConversations: PastConversation[];
  hasMoreHistory: boolean;
  isLoadingHistory: boolean;

  // Actions
  addMessage(msg: ChatMessage): void;
  removeLastMessage(): void;
  appendToLastMessage(chunk: string): void;
  setStreaming(streaming: boolean): void;
  setTodayConversation(id: string, date: string, messages: ChatMessage[]): void;
  appendHistory(conversations: PastConversation[]): void;
  clearConversation(): void;
}

interface PastConversation {
  id: string;
  conversationDate: string;
  summary: string | null;
  messages: ChatMessage[];
}
```

- MMKV persists `conversationId`, `conversationDate`, `messages` for instant display
- On mount: fetch from server to sync (server is source of truth)
- If `conversationDate !== today`: clear messages, fetch fresh
- Note: `ChatMessage.timestamp` maps to API's `createdAt` — mapping happens in the service layer

### Oracle Service (`oracle.ts`)

- `sendOracleMessage` — unchanged request body. Server handles context.
- New `fetchTodayConversation()` — `GET /api/oracle/today`
- New `fetchConversationHistory(before?: string)` — `GET /api/oracle/history`

### Oracle Screen (`oracle/index.tsx`)

- On mount: call `fetchTodayConversation()`, populate store
- FlatList data assembled with `useMemo`: combines past conversations and today's messages
- Date divider component rendered between conversation groups
- `onEndReached` (inverted list, so this fires on scroll up): call `fetchConversationHistory`
- Past messages render identically but are read-only (no behavioral difference)

## Migration

SQL migration script to create both tables with RLS policies. No data migration needed — existing MMKV messages are local-only and ephemeral.
