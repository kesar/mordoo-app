// src/hooks/useShareCard.ts
import { useCallback, useRef, useState } from 'react';
import { Platform, Share } from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

export function useShareCard() {
  const viewShotRef = useRef<ViewShot>(null);
  const [isSharing, setIsSharing] = useState(false);

  const shareCard = useCallback(async (message?: string) => {
    if (!viewShotRef.current?.capture) return;
    setIsSharing(true);

    try {
      const uri = await viewShotRef.current.capture();

      if (Platform.OS === 'ios') {
        // iOS Share API supports both image URL and text message together
        await Share.share({ url: uri, message });
      } else {
        // Android: use expo-sharing for reliable file URI sharing
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: message ?? 'Share',
          });
        }
      }
    } catch {
      // User cancelled or share failed — silent
    } finally {
      setIsSharing(false);
    }
  }, []);

  return { viewShotRef, shareCard, isSharing };
}
