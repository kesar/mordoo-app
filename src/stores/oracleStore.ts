import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/src/utils/zustand-mmkv';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface OracleState {
  messages: ChatMessage[];
  isStreaming: boolean;
  oracleQuestionsToday: number;
  oracleLastReset: string;
  siamSiThisMonth: number;
  siamSiLastReset: string;

  addMessage: (msg: ChatMessage) => void;
  appendToLastMessage: (chunk: string) => void;
  setStreaming: (streaming: boolean) => void;
  incrementOracleQuota: () => void;
  incrementSiamSiQuota: () => void;
  checkAndResetQuotas: () => void;
  clearConversation: () => void;
}

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function getCurrentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export const useOracleStore = create<OracleState>()(
  persist(
    (set, get) => ({
      messages: [],
      isStreaming: false,
      oracleQuestionsToday: 0,
      oracleLastReset: getToday(),
      siamSiThisMonth: 0,
      siamSiLastReset: getCurrentYearMonth(),

      addMessage: (msg) => set((state) => ({
        messages: [...state.messages, msg],
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

      incrementOracleQuota: () => set((state) => ({
        oracleQuestionsToday: state.oracleQuestionsToday + 1,
      })),

      incrementSiamSiQuota: () => set((state) => ({
        siamSiThisMonth: state.siamSiThisMonth + 1,
      })),

      checkAndResetQuotas: () => {
        const state = get();
        const today = getToday();
        const currentMonth = getCurrentYearMonth();
        const updates: Partial<OracleState> = {};

        if (state.oracleLastReset !== today) {
          updates.oracleQuestionsToday = 0;
          updates.oracleLastReset = today;
        }
        if (state.siamSiLastReset !== currentMonth) {
          updates.siamSiThisMonth = 0;
          updates.siamSiLastReset = currentMonth;
        }
        if (Object.keys(updates).length > 0) {
          set(updates);
        }
      },

      clearConversation: () => set({ messages: [] }),
    }),
    {
      name: 'mordoo-oracle',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        messages: state.messages,
        oracleQuestionsToday: state.oracleQuestionsToday,
        oracleLastReset: state.oracleLastReset,
        siamSiThisMonth: state.siamSiThisMonth,
        siamSiLastReset: state.siamSiLastReset,
      }),
    },
  ),
);
