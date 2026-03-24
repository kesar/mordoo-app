import { useState, useEffect, useCallback, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';
import { fetchSiamSiDraw, fetchSiamSiQuota, type SiamSiDrawResponse } from '@/src/services/oracle';
import { TIERS } from '@/src/constants/tiers';

const SHAKE_THRESHOLD = 1.8;
const SHAKE_DURATION_MS = 300;
const SHAKE_GRACE_MS = 200;
const COOLDOWN_MS = 2000;

const FREE_SIAM_SI_LIMIT = TIERS.free.entitlements.siamSiPerDay;

export function useSiamSi() {
  const [isShaking, setIsShaking] = useState(false);
  const [currentStick, setCurrentStick] = useState<SiamSiDrawResponse | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawsRemaining, setDrawsRemaining] = useState<number | null>(null);
  const [drawsTotal, setDrawsTotal] = useState<number | null>(null);
  const [isLoadingQuota, setIsLoadingQuota] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const shakeStartRef = useRef<number | null>(null);
  const lastAboveRef = useRef<number | null>(null);
  const cooldownRef = useRef(false);
  const isDrawingRef = useRef(false);

  const canDraw = !isLoadingQuota && (drawsRemaining === null || drawsRemaining > 0);

  // Fetch quota from API on mount
  useEffect(() => {
    let cancelled = false;
    setIsLoadingQuota(true);
    fetchSiamSiQuota()
      .then((quota) => {
        if (!cancelled) {
          setDrawsRemaining(quota.drawsRemaining);
          setDrawsTotal(quota.drawsTotal);
        }
      })
      .catch(() => {
        // Fallback to free tier default if quota fetch fails
        if (!cancelled) {
          setDrawsRemaining(FREE_SIAM_SI_LIMIT);
          setDrawsTotal(FREE_SIAM_SI_LIMIT);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingQuota(false);
      });
    return () => { cancelled = true; };
  }, []);

  const performDraw = useCallback(async () => {
    if (!canDraw || cooldownRef.current || isDrawingRef.current) return;

    cooldownRef.current = true;
    isDrawingRef.current = true;
    setIsDrawing(true);
    setIsRevealing(true);
    setError(null);

    try {
      const result = await fetchSiamSiDraw();
      setCurrentStick(result);
      setDrawsRemaining(result.drawsRemaining);
      setDrawsTotal(result.drawsTotal);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Draw failed';
      setError(message);
      if (message === 'QUOTA_EXCEEDED') {
        setDrawsRemaining(0);
      }
    } finally {
      isDrawingRef.current = false;
      setIsDrawing(false);
      setTimeout(() => {
        cooldownRef.current = false;
        setIsRevealing(false);
      }, COOLDOWN_MS);
    }
  }, [canDraw]);

  useEffect(() => {
    const subscription = Accelerometer.addListener((data) => {
      const magnitude = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);

      const now = Date.now();

      if (magnitude > SHAKE_THRESHOLD) {
        lastAboveRef.current = now;
        if (!shakeStartRef.current) {
          shakeStartRef.current = now;
          setIsShaking(true);
        } else if (now - shakeStartRef.current > SHAKE_DURATION_MS) {
          shakeStartRef.current = null;
          lastAboveRef.current = null;
          setIsShaking(false);
          performDraw();
        }
      } else if (
        lastAboveRef.current &&
        now - lastAboveRef.current > SHAKE_GRACE_MS
      ) {
        shakeStartRef.current = null;
        lastAboveRef.current = null;
        setIsShaking(false);
      }
    });

    Accelerometer.setUpdateInterval(100);

    return () => subscription.remove();
  }, [performDraw]);

  const refreshQuota = useCallback(async () => {
    try {
      const quota = await fetchSiamSiQuota();
      setDrawsRemaining(quota.drawsRemaining);
      setDrawsTotal(quota.drawsTotal);
    } catch {
      // silently fail — keep current state
    }
  }, []);

  return {
    isShaking,
    currentStick,
    isRevealing,
    isDrawing,
    isLoadingQuota,
    drawsRemaining,
    drawsTotal,
    canDraw,
    error,
    performDraw,
    refreshQuota,
  };
}
