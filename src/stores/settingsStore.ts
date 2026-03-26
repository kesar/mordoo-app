import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/src/utils/zustand-mmkv';
import i18n from '@/src/i18n';

interface SettingsState {
  language: 'en' | 'th';
  notificationsEnabled: boolean;
  notificationTime: string;
  notificationPromptShown: boolean;
  profilePrivate: boolean;
  setLanguage: (lang: 'en' | 'th') => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setNotificationTime: (time: string) => void;
  setNotificationPromptShown: (shown: boolean) => void;
  toggleProfilePrivacy: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'en',
      notificationsEnabled: false,
      notificationTime: '07:00',
      notificationPromptShown: false,
      profilePrivate: false,

      setLanguage: (language) => {
        i18n.changeLanguage(language);
        set({ language });
      },
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setNotificationTime: (notificationTime) => set({ notificationTime }),
      setNotificationPromptShown: (notificationPromptShown) => set({ notificationPromptShown }),
      toggleProfilePrivacy: () => set((state) => ({ profilePrivate: !state.profilePrivate })),
    }),
    {
      name: 'mordoo-settings',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        language: state.language,
        notificationsEnabled: state.notificationsEnabled,
        notificationTime: state.notificationTime,
        notificationPromptShown: state.notificationPromptShown,
        profilePrivate: state.profilePrivate,
      }),
    },
  ),
);
