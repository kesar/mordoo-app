import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import type { EventSubscription } from 'expo-modules-core';
import { analytics } from '@/src/services/analytics';

// Configure foreground notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function useNotificationHandler() {
  const router = useRouter();
  const responseListener = useRef<EventSubscription>(null);

  useEffect(() => {
    // Listen for notification taps
    responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {
      analytics.track('notification_tapped');
      router.push('/(main)/pulse');
    });

    return () => {
      responseListener.current?.remove();
    };
  }, [router]);
}
