import { useState, useEffect, useCallback, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';
import { fetchSiamSiDraw, type SiamSiDrawResponse } from '@/src/services/oracle';
import { TIERS } from '@/src/constants/tiers';

const SHAKE_THRESHOLD = 1.8;
const SHAKE_DURATION_MS = 300;
const COOLDOWN_MS = 2000;

const FREE_SIAM_SI_LIMIT = TIERS.free.entitlements.siamSiPerDay;

export function useSiamSi() {
  const [isShaking, setIsShaking] = useState(false);
  const [currentStick, setCurrentStick] = useState<SiamSiDrawResponse | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawsRemaining, setDrawsRemaining] = useState<number | null>(FREE_SIAM_SI_LIMIT);
  const [drawsTotal, setDrawsTotal] = useState<number | null>(FREE_SIAM_SI_LIMIT);
  const [error, setError] = useState<string | null>(null);

  const shakeStartRef = useRef<number | null>(null);
  const cooldownRef = useRef(false);

  const canDraw = drawsRemaining === null || drawsRemaining > 0;

  const performDraw = useCallback(async () => {
    if (!canDraw || cooldownRef.current || isDrawing) return;

    cooldownRef.current = true;
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
      setIsDrawing(false);
      setTimeout(() => {
        cooldownRef.current = false;
        setIsRevealing(false);
      }, COOLDOWN_MS);
    }
  }, [canDraw, isDrawing]);

  useEffect(() => {
    const subscription = Accelerometer.addListener((data) => {
      const magnitude = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);

      if (magnitude > SHAKE_THRESHOLD) {
        if (!shakeStartRef.current) {
          shakeStartRef.current = Date.now();
          setIsShaking(true);
        } else if (Date.now() - shakeStartRef.current > SHAKE_DURATION_MS) {
          shakeStartRef.current = null;
          setIsShaking(false);
          performDraw();
        }
      } else {
        shakeStartRef.current = null;
        setIsShaking(false);
      }
    });

    Accelerometer.setUpdateInterval(100);

    return () => subscription.remove();
  }, [performDraw]);

  return {
    isShaking,
    currentStick,
    isRevealing,
    isDrawing,
    drawsRemaining,
    drawsTotal,
    canDraw,
    error,
    performDraw,
  };
}
