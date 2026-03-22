export const TIERS = {
  free: {
    id: 'free',
    name: 'Freemium',
    price: 0,
    currency: 'THB',
    entitlements: {
      dailyEnergyScore: true,
      oracleQuestionsPerDay: 1,
      tarotSpreads: ['single', 'three_card'] as const,
      siamSiPerDay: 2,
      soulSnapshot: true,
      luckyElements: true,
      persistentMemory: false,
    },
  },
  standard: {
    id: 'standard',
    name: 'Standard',
    price: 149,
    currency: 'THB',
    entitlements: {
      dailyEnergyScore: true,
      oracleQuestionsPerDay: Infinity,
      tarotSpreads: ['single', 'three_card', 'celtic_cross'] as const,
      siamSiPerDay: Infinity,
      soulSnapshot: true,
      luckyElements: true,
      persistentMemory: true,
    },
  },
} as const;

export type TierId = keyof typeof TIERS;
