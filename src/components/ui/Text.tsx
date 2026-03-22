import { Text as RNText, TextProps } from 'react-native';
import { useTranslation } from 'react-i18next';
import { fonts, fontSizes } from '@/src/constants/typography';
import { colors } from '@/src/constants/colors';

const THAI_REGEX = /[\u0E00-\u0E7F]/;
// Detect strings that are purely symbols/emoji (no latin/thai text) — these need system font.
// Covers: Emoji_Presentation, Extended_Pictographic, Regional_Indicator (flags), ZWJ,
// variation selectors, arrows (U+2190-21FF), misc symbols (U+2600-26FF),
// dingbats (U+2700-27BF), geometric shapes (U+25A0-25FF), misc technical (U+2300-23FF),
// general punctuation quotes (U+2018-201F, U+275D-275E), box drawing (U+2500-257F)
const EMOJI_ONLY_REGEX = /^[\p{Emoji_Presentation}\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u200d\ufe0e\ufe0f\u2190-\u21FF\u2300-\u23FF\u2500-\u257F\u25A0-\u25FF\u2600-\u26FF\u2700-\u27BF\u2018-\u201F\u275D-\u275E\s]+$/u;

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
