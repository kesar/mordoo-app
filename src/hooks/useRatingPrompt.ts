import { useCallback, useRef, useState } from 'react';
import { shouldShowRatingPrompt } from '@/src/services/rating';

/**
 * Hook to manage rating prompt visibility.
 * Call `checkAndShow()` at success moments with an optional delay.
 */
export function useRatingPrompt() {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkAndShow = useCallback((delayMs = 1500) => {
    if (!shouldShowRatingPrompt()) return;

    timerRef.current = setTimeout(() => {
      setVisible(true);
    }, delayMs);
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return { ratingPromptVisible: visible, showRatingPrompt: checkAndShow, closeRatingPrompt: close };
}
