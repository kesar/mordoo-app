import { Text as RNText, TextProps } from 'react-native';
import { useTranslation } from 'react-i18next';
import { fonts, fontSizes } from '@/src/constants/typography';
import { colors } from '@/src/constants/colors';

const THAI_REGEX = /[\u0E00-\u0E7F]/;
// Detect strings that are purely emoji (no latin/thai text) — these need system font
// Includes Emoji_Presentation, Extended_Pictographic, Regional_Indicator (flags), ZWJ, variation selectors
const EMOJI_ONLY_REGEX = /^[\p{Emoji_Presentation}\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u200d\ufe0e\ufe0f\s]+$/u;

interface MorDooTextProps extends TextProps {
  variant?: 'display' | 'body' | 'caption';
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  size?: keyof typeof fontSizes;
  color?: string;
  i18nKey?: string;
  i18nOptions?: Record<string, unknown>;
}

export function Text({
  variant = 'body',
  weight = 'regular',
  size,
  color,
  i18nKey,
  i18nOptions,
  children,
  style,
  ...props
}: MorDooTextProps) {
  const { t, i18n } = useTranslation();
  const text = i18nKey ? t(i18nKey, i18nOptions ?? {}) : children;
  const isEmojiOnly =
    typeof text === 'string' && EMOJI_ONLY_REGEX.test(text);
  const isThai =
    !isEmojiOnly &&
    (i18n.language === 'th' ||
      (typeof text === 'string' && THAI_REGEX.test(text)));

  const fontFamily = isEmojiOnly ? undefined : isThai
    ? weight === 'medium' || weight === 'semibold' || weight === 'bold'
      ? fonts.thai.medium
      : fonts.thai.regular
    : variant === 'display'
      ? weight === 'bold'
        ? fonts.display.bold
        : fonts.display.regular
      : weight === 'semibold'
        ? fonts.body.semibold
        : weight === 'medium'
          ? fonts.body.medium
          : fonts.body.regular;

  const fontSize = size
    ? fontSizes[size]
    : variant === 'display'
      ? fontSizes['2xl']
      : variant === 'caption'
        ? fontSizes.sm
        : fontSizes.base;

  return (
    <RNText
      style={[
        {
          fontFamily,
          fontSize,
          color: color ?? colors.parchment.DEFAULT,
        },
        style,
      ]}
      {...props}
    >
      {text}
    </RNText>
  );
}
