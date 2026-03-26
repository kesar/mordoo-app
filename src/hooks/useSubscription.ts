import { useState, useEffect, useCallback } from 'react';
import { type PurchasesOffering, type PurchasesPackage } from 'react-native-purchases';
import {
  checkSubscriptionStatus,
  getOfferings,
  purchasePackage,
  restorePurchases,
} from '@/src/services/purchases';
import { useSubscriptionStore } from '@/src/stores/subscriptionStore';
import { features } from '@/src/config/features';

export function useSubscription() {
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const isLoaded = useSubscriptionStore((s) => s.isLoaded);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [isLoadingOfferings, setIsLoadingOfferings] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    if (!features.paywall) {
      setIsLoadingOfferings(false);
      return;
    }

    let cancelled = false;

    async function init() {
      const [, currentOffering] = await Promise.all([
        // Only check status if not yet loaded (avoids redundant calls)
        isLoaded ? Promise.resolve() : checkSubscriptionStatus(),
        getOfferings(),
      ]);
      if (cancelled) return;
      setOffering(currentOffering);
      setIsLoadingOfferings(false);
    }

    init();
    return () => { cancelled = true; };
  }, [isLoaded]);

  const subscribe = useCallback(async (pkg: PurchasesPackage) => {
    setIsPurchasing(true);
    try {
      const result = await purchasePackage(pkg);
      return result;
    } finally {
      setIsPurchasing(false);
    }
  }, []);

  const restore = useCallback(async () => {
    setIsRestoring(true);
    try {
      const result = await restorePurchases();
      return result.isPremium;
    } finally {
      setIsRestoring(false);
    }
  }, []);

  const refreshStatus = useCallback(async () => {
    const status = await checkSubscriptionStatus();
    return status.isPremium;
  }, []);

  return {
    isPremium,
    offering,
    isLoading: isLoadingOfferings || !isLoaded,
    isPurchasing,
    isRestoring,
    subscribe,
    restore,
    refreshStatus,
  };
}
