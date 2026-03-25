import { useState, useEffect, useCallback } from 'react';
import { type PurchasesOffering, type PurchasesPackage } from 'react-native-purchases';
import {
  checkSubscriptionStatus,
  getOfferings,
  purchasePackage,
  restorePurchases,
} from '@/src/services/purchases';
import { features } from '@/src/config/features';

export function useSubscription() {
  const [isPremium, setIsPremium] = useState(false);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    if (!features.paywall) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function init() {
      const [status, currentOffering] = await Promise.all([
        checkSubscriptionStatus(),
        getOfferings(),
      ]);
      if (cancelled) return;
      setIsPremium(status.isPremium);
      setOffering(currentOffering);
      setIsLoading(false);
    }

    init();
    return () => { cancelled = true; };
  }, []);

  const subscribe = useCallback(async (pkg: PurchasesPackage) => {
    setIsPurchasing(true);
    try {
      const result = await purchasePackage(pkg);
      if (result.isPremium) {
        setIsPremium(true);
      }
      return result;
    } finally {
      setIsPurchasing(false);
    }
  }, []);

  const restore = useCallback(async () => {
    setIsRestoring(true);
    try {
      const result = await restorePurchases();
      setIsPremium(result.isPremium);
      return result.isPremium;
    } finally {
      setIsRestoring(false);
    }
  }, []);

  const refreshStatus = useCallback(async () => {
    const status = await checkSubscriptionStatus();
    setIsPremium(status.isPremium);
    return status.isPremium;
  }, []);

  return {
    isPremium,
    offering,
    isLoading,
    isPurchasing,
    isRestoring,
    subscribe,
    restore,
    refreshStatus,
  };
}
