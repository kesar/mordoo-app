import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { storage } from '@/src/utils/storage';

import enCommon from './en/common.json';
import enOnboarding from './en/onboarding.json';
import enPulse from './en/pulse.json';
import enOracle from './en/oracle.json';
import enSettings from './en/settings.json';
import enPaywall from './en/paywall.json';

import thCommon from './th/common.json';
import thOnboarding from './th/onboarding.json';
import thPulse from './th/pulse.json';
import thOracle from './th/oracle.json';
import thSettings from './th/settings.json';
import thPaywall from './th/paywall.json';

const savedLang = storage.getString('mordoo-lang');
const deviceLang = getLocales()[0]?.languageCode;

i18n.use(initReactI18next).init({
  lng: savedLang || (deviceLang === 'th' ? 'th' : 'en'),
  fallbackLng: 'en',
  ns: ['common', 'onboarding', 'pulse', 'oracle', 'settings', 'paywall'],
  defaultNS: 'common',
  resources: {
    en: {
      common: enCommon,
      onboarding: enOnboarding,
      pulse: enPulse,
      oracle: enOracle,
      settings: enSettings,
      paywall: enPaywall,
    },
    th: {
      common: thCommon,
      onboarding: thOnboarding,
      pulse: thPulse,
      oracle: thOracle,
      settings: thSettings,
      paywall: thPaywall,
    },
  },
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
  storage.set('mordoo-lang', lng);
});

export default i18n;
