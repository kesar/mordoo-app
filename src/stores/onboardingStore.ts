import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/src/utils/zustand-mmkv';

export type Concern = 'love' | 'career' | 'money' | 'health' | 'family' | 'spiritual';

export interface BirthData {
  dateOfBirth: string; // ISO date string
  timeOfBirth: { hour: number; minute: number };
  timeApproximate: boolean;
  placeOfBirth: {
    name: string;
    latitude: number;
    longitude: number;
    country: string;
  };
  gender?: 'male' | 'female' | 'non-binary' | 'prefer-not';
}

export interface NameData {
  fullName: string;
  phoneNumber?: string;
  carPlate?: string;
}

interface OnboardingState {
  step: 1 | 2 | 3 | 4 | 5 | 6;
  language: 'en' | 'th';
  birthData: BirthData | null;
  nameData: NameData | null;
  concerns: Concern[];
  urgencyContext: string | null;
  isComplete: boolean;

  setStep: (step: OnboardingState['step']) => void;
  setLanguage: (lang: 'en' | 'th') => void;
  setBirthData: (data: BirthData) => void;
  setNameData: (data: NameData) => void;
  setConcerns: (concerns: Concern[]) => void;
  setUrgencyContext: (context: string | null) => void;
  completeOnboarding: () => void;
  resetStore: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      step: 1,
      language: 'en',
      birthData: null,
      nameData: null,
      concerns: [],
      urgencyContext: null,
      isComplete: false,

      setStep: (step) => set({ step }),
      setLanguage: (language) => set({ language }),
      setBirthData: (birthData) => set({ birthData }),
      setNameData: (nameData) => set({ nameData }),
      setConcerns: (concerns) => set({ concerns }),
      setUrgencyContext: (urgencyContext) => set({ urgencyContext }),
      completeOnboarding: () => set({ isComplete: true }),
      resetStore: () => set({
        step: 1,
        birthData: null,
        nameData: null,
        concerns: [],
        urgencyContext: null,
        isComplete: false,
      }),
    }),
    {
      name: 'mordoo-onboarding',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        step: state.step,
        language: state.language,
        birthData: state.birthData,
        nameData: state.nameData,
        concerns: state.concerns,
        urgencyContext: state.urgencyContext,
        isComplete: state.isComplete,
      }),
    },
  ),
);
