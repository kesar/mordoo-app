import { create } from 'zustand';

interface SubscriptionState {
  isPremium: boolean;
  isLoaded: boolean;

  setPremium: (isPremium: boolean) => void;
  setLoaded: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>()((set) => ({
  isPremium: false,
  isLoaded: false,

  setPremium: (isPremium) => set({ isPremium, isLoaded: true }),
  setLoaded: () => set({ isLoaded: true }),
}));
