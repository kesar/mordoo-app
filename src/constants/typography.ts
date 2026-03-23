export const fonts = {
  display: {
    regular: 'CinzelDecorative-Regular',
    bold: 'CinzelDecorative-Bold',
  },
  body: {
    regular: 'CormorantGaramond-Regular',
    medium: 'CormorantGaramond-Medium',
    semibold: 'CormorantGaramond-SemiBold',
  },
  thai: {
    regular: 'NotoSansThai-Regular',
    medium: 'NotoSansThai-Medium',
  },
} as const;

import { moderateScale } from '@/src/utils/scale';

export const fontSizes = {
  xs: moderateScale(12),
  sm: moderateScale(14),
  base: moderateScale(16),
  lg: moderateScale(18),
  xl: moderateScale(20),
  '2xl': moderateScale(24),
  '3xl': moderateScale(30),
  '4xl': moderateScale(36),
};
