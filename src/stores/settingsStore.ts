import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/src/utils/zustand-mmkv';

interface SettingsState {
  language: 'en' | 'th';
  notificationsEnabled: boolean;
  setLanguage: (lang: 'en' | 'th') => void;
  setNotificationsEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'en',
      notificationsEnabled: false,

      setLanguage: (language) => set({ language }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
    }),
    {
      name: 'mordoo-settings',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        language: state.language,
        notificationsEnabled: state.notificationsEnabled,
      }),
    },
  ),
);
