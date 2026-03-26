import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
} from 'react-native-purchases';

const REVENUECAT_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY!;
const REVENUECAT_ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY!;

const ENTITLEMENT_ID = 'standard';

let isConfigured = false;

/** Initialize RevenueCat SDK. Call once at app start. */
export function configureRevenueCat(): void {
  if (isConfigured) return;

  if (__DEV__) {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);
  }

  const apiKey = Platform.OS === 'ios' ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;
  if (!apiKey) {
    console.warn('RevenueCat API key not set for platform:', Platform.OS);
    return;
  }

  Purchases.configure({ apiKey });
  isConfigured = true;
}

/** Identify the RevenueCat user (call after auth). */
export async function identifyUser(userId: string): Promise<void> {
  if (!isConfigured) return;
  await Purchases.logIn(userId);
}

/** Log out RevenueCat user (call on sign-out). */
export async function logOutPurchases(): Promise<void> {
  if (!isConfigured) return;
  const customerInfo = await Purchases.getCustomerInfo();
  if ((customerInfo as any).isAnonymous) return;
  await Purchases.logOut();
}

/** Check if user has active 'standard' entitlement. */
export async function checkSubscriptionStatus(): Promise<{
  isPremium: boolean;
  customerInfo: CustomerInfo | null;
}> {
  if (!isConfigured) return { isPremium: false, customerInfo: null };

  try {
    const customerInfo = await Purchases.getCustomerInfo();
    const isPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    return { isPremium, customerInfo };
  } catch {
    return { isPremium: false, customerInfo: null };
  }
}

/** Get current offerings (subscription packages). */
export async function getOfferings(): Promise<PurchasesOffering | null> {
  if (!isConfigured) return null;

  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current ?? null;
  } catch {
    return null;
  }
}

/** Purchase a specific package. Returns updated customer info. */
export async function purchasePackage(pkg: PurchasesPackage): Promise<{
  success: boolean;
  isPremium: boolean;
  cancelled: boolean;
}> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
    return { success: isPremium, isPremium, cancelled: false };
  } catch (error: any) {
    if (error.userCancelled) {
      return { success: false, isPremium: false, cancelled: true };
    }
    throw error;
  }
}

/** Restore previous purchases. */
export async function restorePurchases(): Promise<{
  isPremium: boolean;
  customerInfo: CustomerInfo;
}> {
  const customerInfo = await Purchases.restorePurchases();
  const isPremium = customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
  return { isPremium, customerInfo };
}
