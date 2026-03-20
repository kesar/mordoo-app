# Oracle AI & Tarot Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect Oracle chat to Claude API with streaming responses, implement Siam Si fortune sticks with shake gesture, and add tier-based quota enforcement.

**Architecture:** Oracle chat → Next.js API → Claude API (streaming SSE) → real-time chat rendering. Siam Si uses accelerometer shake detection + deterministic fortune draw. Quotas tracked locally + server-side.

**Tech Stack:** Anthropic SDK, expo-sensors, Supabase, Zustand + MMKV, SSE streaming

**Spec:** `docs/superpowers/specs/2026-03-20-oracle-ai-tarot-design.md`

---

## Task 1: Install Anthropic SDK in API project

**Files:**
- Modify: `api/package.json`

- [ ] **Step 1: Install @anthropic-ai/sdk**

```bash
cd api && npm install @anthropic-ai/sdk && cd ..
```

- [ ] **Step 2: Add ANTHROPIC_API_KEY to api/.env.local**

Add to `api/.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

- [ ] **Step 3: Commit**

```bash
git add api/package.json api/package-lock.json
git commit -m "feat: add Anthropic SDK dependency"
```

---

## Task 2: Create Oracle chat API endpoint

**Files:**
- Create: `api/src/app/api/oracle/chat/route.ts`

- [ ] **Step 1: Create the streaming chat endpoint**

Full implementation with Claude API, system prompt with birth data context, SSE streaming response.

- [ ] **Step 2: Verify API compiles**

```bash
cd api && npx tsc --noEmit && cd ..
```

- [ ] **Step 3: Commit**

```bash
git add api/src/app/api/oracle/chat/route.ts
git commit -m "feat: add Oracle chat API endpoint with Claude streaming"
```

---

## Task 3: Create Siam Si fortune sticks data

**Files:**
- Create: `shared/siam-si.ts`

- [ ] **Step 1: Create 28 fortune sticks with bilingual text**

- [ ] **Step 2: Verify compiles**

- [ ] **Step 3: Commit**

---

## Task 4: Create Oracle store

**Files:**
- Create: `src/stores/oracleStore.ts`

- [ ] **Step 1: Create Zustand store with MMKV persistence**

Manages messages, streaming state, quota counters.

- [ ] **Step 2: Verify compiles, commit**

---

## Task 5: Create Oracle chat service

**Files:**
- Create: `src/services/oracle.ts`

- [ ] **Step 1: Create SSE streaming service**

- [ ] **Step 2: Verify compiles, commit**

---

## Task 6: Create Siam Si hook and screen

**Files:**
- Create: `src/hooks/useSiamSi.ts`
- Create: `app/(main)/oracle/siam-si.tsx`

- [ ] **Step 1: Create shake detection hook**
- [ ] **Step 2: Create Siam Si screen**
- [ ] **Step 3: Verify compiles, commit**

---

## Task 7: Update Oracle chat screen

**Files:**
- Modify: `app/(main)/oracle/index.tsx`

- [ ] **Step 1: Replace mock chat with real API integration**
- [ ] **Step 2: Add Siam Si navigation, quota display**
- [ ] **Step 3: Verify compiles, commit**

---

## Task 8: Update Supabase docs and build

- [ ] **Step 1: Add oracle_messages and user_quotas migrations to docs**
- [ ] **Step 2: Rebuild and verify**
- [ ] **Step 3: Final commit**
