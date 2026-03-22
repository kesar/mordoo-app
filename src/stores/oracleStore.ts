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
