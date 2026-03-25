// src/hooks/useShareCard.ts
import { useCallback, useRef, useState } from 'react';
import { Platform, Share } from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { analytics } from '@/src/services/analytics';

export function useShareCard() {
  const viewShotRef = useRef<ViewShot>(null);
  const [isSharing, setIsSharing] = useState(false);

  const shareCard = useCallback(async (message?: string, contentType?: string) => {
    if (!viewShotRef.current?.capture) return;
    setIsSharing(true);

    try {
      const uri = await viewShotRef.current.capture();

      if (Platform.OS === 'ios') {
        // iOS Share API supports both image URL and text message together
        const result = await Share.share({ url: uri, message });
        if (result.action === Share.sharedAction) {
          analytics.track('share_completed', { content_type: contentType ?? 'unknown' });
        } else if (result.action === Share.dismissedAction) {
          analytics.track('share_cancelled', { content_type: contentType ?? 'unknown' });
        }
      } else {
        // Android: use expo-sharing for reliable file URI sharing
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: message ?? 'Share',
          });
          // Android doesn't return share result — track as completed
          analytics.track('share_completed', { content_type: contentType ?? 'unknown' });
        }
      }
    } catch {
      analytics.track('share_cancelled', { content_type: contentType ?? 'unknown' });
    } finally {
      setIsSharing(false);
    }
  }, []);

  return { viewShotRef, shareCard, isSharing };
}
