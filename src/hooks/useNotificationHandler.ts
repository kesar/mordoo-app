import { useEffect, useRef } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';

// Configure foreground notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function useNotificationHandler() {
  const router = useRouter();
  const responseListener = useRef<Notifications.EventSubscription>();

  useEffect(() => {
    // Listen for notification taps
    responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {
      router.push('/(main)/pulse');
    });

    return () => {
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [router]);
}
