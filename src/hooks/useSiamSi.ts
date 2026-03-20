import { useState, useEffect, useCallback, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';
import { useAuthStore } from '@/src/stores/authStore';
import { useOracleStore } from '@/src/stores/oracleStore';
import { drawSiamSi, type SiamSiStick } from '@shared/siam-si';

const SHAKE_THRESHOLD = 1.8;
const SHAKE_DURATION_MS = 300;
const COOLDOWN_MS = 2000;

export function useSiamSi(maxDrawsPerMonth: number) {
  const userId = useAuthStore((s) => s.userId);
  const siamSiThisMonth = useOracleStore((s) => s.siamSiThisMonth);
  const incrementSiamSiQuota = useOracleStore((s) => s.incrementSiamSiQuota);
  const checkAndResetQuotas = useOracleStore((s) => s.checkAndResetQuotas);

  const [isShaking, setIsShaking] = useState(false);
  const [currentStick, setCurrentStick] = useState<SiamSiStick | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);

  const shakeStartRef = useRef<number | null>(null);
  const cooldownRef = useRef(false);

  const drawsRemaining = maxDrawsPerMonth === Infinity
    ? Infinity
    : Math.max(0, maxDrawsPerMonth - siamSiThisMonth);

  const canDraw = drawsRemaining > 0;

  useEffect(() => {
    checkAndResetQuotas();
  }, [checkAndResetQuotas]);

  const performDraw = useCallback(() => {
    if (!canDraw || !userId || cooldownRef.current) return;

    cooldownRef.current = true;
    setIsRevealing(true);

    const now = new Date();
    const yearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const stick = drawSiamSi(userId, yearMonth, siamSiThisMonth);

    setCurrentStick(stick);
    incrementSiamSiQuota();

    setTimeout(() => {
      cooldownRef.current = false;
      setIsRevealing(false);
    }, COOLDOWN_MS);
  }, [canDraw, userId, siamSiThisMonth, incrementSiamSiQuota]);

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
    drawsRemaining,
    canDraw,
    performDraw,
  };
}
