import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { useOracleStore } from '@/src/stores/oracleStore';
import { fetchTodayConversation, type ConversationMessage } from '@/src/services/oracle';
import { useAuthStore } from '@/src/stores/authStore';

function getLocalToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/**
 * Detects when the app returns to foreground on a new day
 * and invalidates stale data (pulse queries + oracle conversation).
 */
export function useDayChangeRefresh() {
  const lastDate = useRef(getLocalToday());
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') return;

      const today = getLocalToday();
      if (today === lastDate.current) return;

      lastDate.current = today;

      // Invalidate all daily pulse queries so React Query refetches with the new date
      queryClient.invalidateQueries({ queryKey: ['dailyPulse'] });

      // Refresh oracle conversation for the new day
      if (!isAuthenticated) return;
      const setTodayConversation = useOracleStore.getState().setTodayConversation;

      fetchTodayConversation()
        .then((data) => {
          const msgs = data.messages.map((m: ConversationMessage) => ({
            id: m.id,
            role: m.role as 'user' | 'assistant',
            content: m.content,
            timestamp: m.createdAt,
          }));
          setTodayConversation(data.conversationId, data.conversationDate, msgs);
        })
        .catch(() => {
          // Keep cached messages if fetch fails
        });
    });

    return () => subscription.remove();
  }, [queryClient, isAuthenticated]);
}
