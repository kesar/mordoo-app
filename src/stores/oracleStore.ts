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

  addMessage: (msg: ChatMessage) => void;
  appendToLastMessage: (chunk: string) => void;
  setStreaming: (streaming: boolean) => void;
  clearConversation: () => void;
}

export const useOracleStore = create<OracleState>()(
  persist(
    (set) => ({
      messages: [],
      isStreaming: false,

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

      clearConversation: () => set({ messages: [] }),
    }),
    {
      name: 'mordoo-oracle',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        messages: state.messages,
      }),
    },
  ),
);
