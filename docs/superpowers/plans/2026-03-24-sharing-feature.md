# Sharing Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users share their Pulse and Siam Si results as branded image cards via the native share sheet.

**Architecture:** Render off-screen React Native views styled as share cards, capture them as PNG images with `react-native-view-shot`, and open the native share sheet via RN's `Share` API. A shared `useShareCard` hook encapsulates the capture-and-share flow. Share buttons are added to the existing Pulse and Siam Si result screens.

**Tech Stack:** react-native-view-shot, expo-sharing, React Native Share API, existing design system (colors, fonts, Text component)

**Spec:** `docs/superpowers/specs/2026-03-24-sharing-feature-design.md`

---

## File Structure

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/components/sharing/PulseShareCard.tsx` | Off-screen Pulse image card view |
| Create | `src/components/sharing/SiamSiShareCard.tsx` | Off-screen Siam Si image card view |
| Create | `src/hooks/useShareCard.ts` | Capture view → PNG → native share sheet |
| Modify | `app/(main)/pulse/index.tsx` | Add share button + render off-screen card |
| Modify | `app/(main)/oracle/siam-si.tsx` | Add share button + render off-screen card |
| Modify | `src/i18n/en/pulse.json` | Add share-related strings |
| Modify | `src/i18n/th/pulse.json` | Add share-related strings (Thai) |
| Modify | `src/i18n/en/oracle.json` | Add share-related strings |
| Modify | `src/i18n/th/oracle.json` | Add share-related strings (Thai) |

---

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install packages**

```bash
cd /Users/kesar/projects/mordoo-app && npx expo install react-native-view-shot expo-sharing
```

`expo install` ensures version compatibility with Expo SDK 55. Both packages are needed:
- `react-native-view-shot` — capture RN views as PNG images
- `expo-sharing` — cross-platform file sharing (handles both iOS and Android)

- [ ] **Step 2: Verify installation**

```bash
cd /Users/kesar/projects/mordoo-app && node -e "require('react-native-view-shot'); require('expo-sharing'); console.log('OK')"
```

Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install react-native-view-shot and expo-sharing for sharing feature"
```

---

### Task 2: Add i18n strings for sharing

**Files:**
- Modify: `src/i18n/en/pulse.json`
- Modify: `src/i18n/th/pulse.json`
- Modify: `src/i18n/en/oracle.json`
- Modify: `src/i18n/th/oracle.json`

- [ ] **Step 1: Add English Pulse share strings**

In `src/i18n/en/pulse.json`, add a `"share"` key at the top level:

```json
"share": {
  "button": "Share",
  "message": "My cosmic energy is {{score}} today! Check yours on Mordoo."
}
```

- [ ] **Step 2: Add Thai Pulse share strings**

In `src/i18n/th/pulse.json`, add matching keys:

```json
"share": {
  "button": "แชร์",
  "message": "พลังจักรวาลของฉันวันนี้ {{score}} คะแนน! ลองดูของคุณบน Mordoo"
}
```

- [ ] **Step 3: Add English Siam Si share strings**

In `src/i18n/en/oracle.json`, inside the existing `"siamSi"` object, add:

```json
"share": {
  "button": "Share",
  "message": "I drew fortune stick #{{number}} — {{fortune}}! Try your luck on Mordoo."
}
```

- [ ] **Step 4: Add Thai Siam Si share strings**

In `src/i18n/th/oracle.json`, inside the existing `"siamSi"` object, add:

```json
"share": {
  "button": "แชร์",
  "message": "ฉันจับได้เซียมซีใบที่ #{{number}} — {{fortune}}! ลองเสี่ยงดูบน Mordoo"
}
```

- [ ] **Step 5: Commit**

```bash
git add src/i18n/
git commit -m "feat: add i18n strings for pulse and siam si sharing"
```

---

### Task 3: Create `useShareCard` hook

**Files:**
- Create: `src/hooks/useShareCard.ts`

This hook encapsulates: capture ref as PNG → open native share sheet. Uses `Share.share()` on iOS (supports both image URL + message text) and `expo-sharing` on Android (reliable file URI sharing).

- [ ] **Step 1: Create the hook**

```typescript
// src/hooks/useShareCard.ts
import { useCallback, useRef, useState } from 'react';
import { Platform, Share } from 'react-native';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

export function useShareCard() {
  const viewShotRef = useRef<ViewShot>(null);
  const [isSharing, setIsSharing] = useState(false);

  const shareCard = useCallback(async (message?: string) => {
    if (!viewShotRef.current?.capture) return;
    setIsSharing(true);

    try {
      const uri = await viewShotRef.current.capture();

      if (Platform.OS === 'ios') {
        // iOS Share API supports both image URL and text message together
        await Share.share({ url: uri, message });
      } else {
        // Android: use expo-sharing for reliable file URI sharing
        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(uri, {
            mimeType: 'image/png',
            dialogTitle: message ?? 'Share',
          });
        }
      }
    } catch {
      // User cancelled or share failed — silent
    } finally {
      setIsSharing(false);
    }
  }, []);

  return { viewShotRef, shareCard, isSharing };
}
```

**Platform behavior:**
- **iOS:** Opens native share sheet with both the image and the message text. Apps like iMessage, LINE, WhatsApp will show both.
- **Android:** Opens native share sheet with the image file. The `dialogTitle` shows the message as the dialog header. (Android's share intent doesn't reliably support image + text together.)

- [ ] **Step 2: Verify it compiles**

```bash
cd /Users/kesar/projects/mordoo-app && npx tsc --noEmit src/hooks/useShareCard.ts 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useShareCard.ts
git commit -m "feat: add useShareCard hook for image capture and sharing"
```

---

### Task 4: Create `PulseShareCard` component

**Files:**
- Create: `src/components/sharing/PulseShareCard.tsx`

This is a static (no animations) view that renders the Pulse reading as a beautiful branded card. It's wrapped in `ViewShot` and positioned off-screen in the parent. The card targets a 1080x1350 aspect ratio (4:5, optimal for Instagram/Facebook feed).

- [ ] **Step 1: Create the component**

```typescript
// src/components/sharing/PulseShareCard.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/src/components/ui/Text';
import { colors } from '@/src/constants/colors';
import { fonts } from '@/src/constants/typography';
import type { DailyPulseResponse } from '@shared/types';

interface PulseShareCardProps {
  pulse: DailyPulseResponse;
  dateStr: string;
  lang: 'en' | 'th';
  subScoreLabels: { business: string; heart: string; body: string };
  luckyLabels: { color: string; number: string; direction: string };
}

export function PulseShareCard({ pulse, dateStr, lang, subScoreLabels, luckyLabels }: PulseShareCardProps) {
  // Use Thai font for body text when language is Thai
  const bodyFont = lang === 'th' ? fonts.thai.regular : fonts.body.regular;

  return (
    <View style={styles.card}>
      {/* Header */}
      <Text style={styles.brandLabel}>MORDOO</Text>
      <Text style={styles.dateLabel}>{dateStr}</Text>

      {/* Energy Score */}
      <Text style={styles.scoreValue}>{pulse.energyScore}</Text>
      <Text style={styles.scoreLabel}>Energy Score</Text>

      {/* Sub-Scores */}
      <View style={styles.subScoresRow}>
        <SubScoreItem label={subScoreLabels.business} value={pulse.subScores.business} color={colors.elements.fire} bodyFont={bodyFont} />
        <SubScoreItem label={subScoreLabels.heart} value={pulse.subScores.heart} color="#ec4899" bodyFont={bodyFont} />
        <SubScoreItem label={subScoreLabels.body} value={pulse.subScores.body} color={colors.elements.wood} bodyFont={bodyFont} />
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Lucky Elements */}
      <View style={styles.luckyRow}>
        <View style={styles.luckyItem}>
          <Text style={[styles.luckyLabel, { fontFamily: bodyFont }]}>{luckyLabels.color}</Text>
          <View style={[styles.colorSwatch, { backgroundColor: pulse.luckyColor.hex }]} />
          <Text style={styles.luckyValue}>{pulse.luckyColor.name}</Text>
        </View>
        <View style={styles.luckyItem}>
          <Text style={[styles.luckyLabel, { fontFamily: bodyFont }]}>{luckyLabels.number}</Text>
          <Text style={styles.luckyNumberValue}>{pulse.luckyNumber}</Text>
        </View>
        <View style={styles.luckyItem}>
          <Text style={[styles.luckyLabel, { fontFamily: bodyFont }]}>{luckyLabels.direction}</Text>
          <Text style={styles.luckyValue}>{pulse.luckyDirection}</Text>
        </View>
      </View>

      {/* Insight */}
      <Text style={[styles.insightText, { fontFamily: bodyFont }]} numberOfLines={4}>{pulse.insight}</Text>

      {/* Footer */}
      <Text style={styles.footerBrand}>MORDOO</Text>
    </View>
  );
}

function SubScoreItem({ label, value, color, bodyFont }: { label: string; value: number; color: string; bodyFont: string }) {
  return (
    <View style={styles.subScoreItem}>
      <Text style={[styles.subScoreLabel, { fontFamily: bodyFont }]}>{label}</Text>
      <Text style={[styles.subScoreValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 360,
    aspectRatio: 4 / 5,
    backgroundColor: '#0a0a14',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.3)',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLabel: {
    fontFamily: fonts.display.regular,
    fontSize: 10,
    color: 'rgba(201, 168, 76, 0.5)',
    letterSpacing: 4,
    marginBottom: 8,
  },
  dateLabel: {
    fontFamily: fonts.display.regular,
    fontSize: 11,
    color: 'rgba(201, 168, 76, 0.7)',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 24,
  },
  scoreValue: {
    fontFamily: fonts.display.bold,
    fontSize: 64,
    color: colors.gold.DEFAULT,
    lineHeight: 72,
  },
  scoreLabel: {
    fontFamily: fonts.body.regular,
    fontSize: 12,
    color: 'rgba(244, 232, 193, 0.5)',
    letterSpacing: 2,
    marginBottom: 20,
  },
  subScoresRow: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 20,
  },
  subScoreItem: {
    alignItems: 'center',
    gap: 4,
  },
  subScoreLabel: {
    fontFamily: fonts.body.regular,
    fontSize: 10,
    color: 'rgba(244, 232, 193, 0.5)',
  },
  subScoreValue: {
    fontFamily: fonts.display.bold,
    fontSize: 20,
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: 'rgba(201, 168, 76, 0.2)',
    marginVertical: 16,
  },
  luckyRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 20,
  },
  luckyItem: {
    alignItems: 'center',
    gap: 6,
  },
  luckyLabel: {
    fontFamily: fonts.body.regular,
    fontSize: 9,
    color: 'rgba(244, 232, 193, 0.5)',
    letterSpacing: 1,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  luckyValue: {
    fontFamily: fonts.display.regular,
    fontSize: 11,
    color: colors.parchment.DEFAULT,
  },
  luckyNumberValue: {
    fontFamily: fonts.display.bold,
    fontSize: 18,
    color: colors.gold.light,
  },
  insightText: {
    fontFamily: fonts.body.regular,
    fontSize: 13,
    fontStyle: 'italic',
    color: 'rgba(244, 232, 193, 0.6)',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  footerBrand: {
    fontFamily: fonts.display.regular,
    fontSize: 10,
    color: 'rgba(201, 168, 76, 0.4)',
    letterSpacing: 4,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sharing/PulseShareCard.tsx
git commit -m "feat: add PulseShareCard component for share image"
```

---

### Task 5: Create `SiamSiShareCard` component

**Files:**
- Create: `src/components/sharing/SiamSiShareCard.tsx`

Same pattern — static view, off-screen, captures to PNG.

- [ ] **Step 1: Create the component**

```typescript
// src/components/sharing/SiamSiShareCard.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/src/components/ui/Text';
import { colors } from '@/src/constants/colors';
import { fonts } from '@/src/constants/typography';

const FORTUNE_COLORS: Record<string, string> = {
  excellent: colors.energy.high,
  good: colors.gold.light,
  fair: colors.onSurfaceVariant,
  caution: colors.energy.low,
};

interface SiamSiShareCardProps {
  stickNumber: number;
  fortune: 'excellent' | 'good' | 'fair' | 'caution';
  fortuneLabel: string;
  title: string;
  meaning: string;
  lang: 'en' | 'th';
}

export function SiamSiShareCard({ stickNumber, fortune, fortuneLabel, title, meaning, lang }: SiamSiShareCardProps) {
  const fortuneColor = FORTUNE_COLORS[fortune] ?? colors.gold.DEFAULT;
  const bodyFont = lang === 'th' ? fonts.thai.regular : fonts.body.regular;

  return (
    <View style={styles.card}>
      {/* Header */}
      <Text style={styles.brandLabel}>MORDOO</Text>
      <Text style={styles.typeLabel}>SIAM SI</Text>

      {/* Stick Number */}
      <Text style={styles.stickNumber}>#{stickNumber}</Text>

      {/* Fortune Badge */}
      <View style={[styles.fortuneBadge, { backgroundColor: fortuneColor }]}>
        <Text style={styles.fortuneText}>{fortuneLabel}</Text>
      </View>

      {/* Title */}
      <Text style={[styles.titleText, lang === 'th' && { fontFamily: fonts.thai.medium }]}>{title}</Text>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Meaning */}
      <Text style={[styles.meaningText, { fontFamily: bodyFont }]} numberOfLines={5}>{meaning}</Text>

      {/* Footer */}
      <Text style={styles.footerBrand}>MORDOO</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 360,
    aspectRatio: 4 / 5,
    backgroundColor: '#0a0a14',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.3)',
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandLabel: {
    fontFamily: fonts.display.regular,
    fontSize: 10,
    color: 'rgba(201, 168, 76, 0.5)',
    letterSpacing: 4,
    marginBottom: 4,
  },
  typeLabel: {
    fontFamily: fonts.display.regular,
    fontSize: 11,
    color: 'rgba(201, 168, 76, 0.7)',
    letterSpacing: 3,
    marginBottom: 28,
  },
  stickNumber: {
    fontFamily: fonts.display.bold,
    fontSize: 56,
    color: colors.gold.DEFAULT,
    lineHeight: 64,
    marginBottom: 12,
  },
  fortuneBadge: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 9999,
    marginBottom: 16,
  },
  fortuneText: {
    fontFamily: fonts.display.bold,
    fontSize: 11,
    color: colors.onPrimary,
    letterSpacing: 3,
  },
  titleText: {
    fontFamily: fonts.display.bold,
    fontSize: 20,
    color: colors.onSurface,
    textAlign: 'center',
    marginBottom: 4,
  },
  divider: {
    width: 60,
    height: 1,
    backgroundColor: 'rgba(201, 168, 76, 0.2)',
    marginVertical: 16,
  },
  meaningText: {
    fontFamily: fonts.body.regular,
    fontSize: 14,
    fontStyle: 'italic',
    color: 'rgba(244, 232, 193, 0.6)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  footerBrand: {
    fontFamily: fonts.display.regular,
    fontSize: 10,
    color: 'rgba(201, 168, 76, 0.4)',
    letterSpacing: 4,
  },
});
```

- [ ] **Step 2: Commit**

```bash
git add src/components/sharing/SiamSiShareCard.tsx
git commit -m "feat: add SiamSiShareCard component for share image"
```

---

### Task 6: Integrate share button into Pulse screen

**Files:**
- Modify: `app/(main)/pulse/index.tsx`

Add a share icon button below the sub-scores section. Render `PulseShareCard` off-screen inside a `ViewShot`. Use `useShareCard` hook for capture+share.

- [ ] **Step 1: Add imports**

At the top of `app/(main)/pulse/index.tsx`, add:

```typescript
import ViewShot from 'react-native-view-shot';
import { Pressable } from 'react-native'; // already imported as part of RN — just ensure it's there
import { PulseShareCard } from '@/src/components/sharing/PulseShareCard';
import { useShareCard } from '@/src/hooks/useShareCard';
```

Note: `Pressable` is not currently imported in pulse/index.tsx. Add it to the existing `react-native` import.

- [ ] **Step 2: Add hook and share card rendering**

Inside the `PulseScreen` component, after the existing hooks:

```typescript
const { viewShotRef, shareCard, isSharing } = useShareCard();
```

After the sub-scores section `</View>` (line ~231, right before the closing `</>` of the pulse data block), add the share button:

```tsx
{/* Share Button */}
<View style={styles.shareSection}>
  <Pressable
    style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.7 }]}
    onPress={() => shareCard(t('share.message', { score: pulse.energyScore }))}
    disabled={isSharing}
  >
    <Text style={styles.shareBtnText}>
      {isSharing ? '...' : t('share.button')}
    </Text>
  </Pressable>
</View>
```

After the `</ScrollView>` closing tag (but inside the `SafeAreaView`), render the off-screen card:

```tsx
{/* Off-screen share card */}
{pulse && (
  <ViewShot
    ref={viewShotRef}
    options={{ format: 'png', quality: 1, width: 1080, height: 1350 }}
    style={styles.offScreen}
  >
    <PulseShareCard
      pulse={pulse}
      dateStr={dateStr}
      lang={i18n.language as 'en' | 'th'}
      subScoreLabels={{
        business: t('subScores.business'),
        heart: t('subScores.heart'),
        body: t('subScores.body'),
      }}
      luckyLabels={{
        color: t('luckyElements.color'),
        number: t('luckyElements.number'),
        direction: t('luckyElements.direction'),
      }}
    />
  </ViewShot>
)}
```

- [ ] **Step 3: Add styles**

Add to the `styles` StyleSheet:

```typescript
shareSection: {
  marginTop: 32,
  paddingHorizontal: 24,
  alignItems: 'center',
},
shareBtn: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  backgroundColor: colors.gold.muted,
  paddingHorizontal: 24,
  paddingVertical: 12,
  borderRadius: 9999,
  borderWidth: 1,
  borderColor: colors.gold.border,
},
shareBtnText: {
  fontFamily: fonts.display.bold,
  fontSize: 12,
  color: colors.gold.light,
  letterSpacing: 3,
},
offScreen: {
  position: 'absolute',
  left: -9999,
  top: -9999,
},
```

- [ ] **Step 4: Test manually**

```bash
cd /Users/kesar/projects/mordoo-app && npx expo start
```

Open the Pulse screen in the simulator. Verify:
1. The share button appears below sub-scores when a reading is loaded
2. Tapping it opens the native share sheet with a PNG image
3. The image looks correct (dark card, gold score, sub-scores, lucky elements, insight)

- [ ] **Step 5: Commit**

```bash
git add app/\(main\)/pulse/index.tsx
git commit -m "feat: add share button to Pulse screen"
```

---

### Task 7: Integrate share button into Siam Si screen

**Files:**
- Modify: `app/(main)/oracle/siam-si.tsx`

Add a share button inside the result card (after the "Draw Again" button). Render `SiamSiShareCard` off-screen.

- [ ] **Step 1: Add imports**

At the top of `app/(main)/oracle/siam-si.tsx`, add:

```typescript
import ViewShot from 'react-native-view-shot';
import { SiamSiShareCard } from '@/src/components/sharing/SiamSiShareCard';
import { useShareCard } from '@/src/hooks/useShareCard';
```

- [ ] **Step 2: Add hook**

Inside `SiamSiScreen`, after the existing hooks:

```typescript
const { viewShotRef, shareCard, isSharing } = useShareCard();
```

- [ ] **Step 3: Add share button to result card**

After the "Draw Again" `</Pressable>` (line ~187), add:

```tsx
<Pressable
  style={({ pressed }) => [styles.shareBtn, pressed && { opacity: 0.7 }]}
  onPress={() => {
    const fortuneLabel = fortuneLabels[currentStick.fortune] ?? currentStick.fortune;
    shareCard(t('siamSi.share.message', { number: currentStick.number, fortune: fortuneLabel }));
  }}
  disabled={isSharing}
>
  <Text style={styles.shareBtnText}>
    {isSharing ? '...' : t('siamSi.share.button')}
  </Text>
</Pressable>
```

- [ ] **Step 4: Add off-screen card**

After the `</View>` closing the `content` container (line ~245), but inside the `SafeAreaView`, add:

```tsx
{/* Off-screen share card */}
{currentStick && (
  <ViewShot
    ref={viewShotRef}
    options={{ format: 'png', quality: 1, width: 1080, height: 1350 }}
    style={styles.offScreen}
  >
    <SiamSiShareCard
      stickNumber={currentStick.number}
      fortune={currentStick.fortune}
      fortuneLabel={fortuneLabels[currentStick.fortune] ?? currentStick.fortune}
      title={i18n.language === 'th' ? currentStick.titleTh : currentStick.titleEn}
      meaning={i18n.language === 'th' ? currentStick.meaningTh : currentStick.meaningEn}
      lang={i18n.language as 'en' | 'th'}
    />
  </ViewShot>
)}
```

- [ ] **Step 5: Add styles**

Add to the `styles` StyleSheet:

```typescript
shareBtn: {
  marginTop: 4,
  backgroundColor: 'transparent',
  paddingHorizontal: 24,
  paddingVertical: 10,
  borderRadius: 9999,
},
shareBtnText: {
  fontFamily: fonts.display.bold,
  fontSize: 12,
  color: colors.gold.light,
  letterSpacing: 3,
},
offScreen: {
  position: 'absolute',
  left: -9999,
  top: -9999,
},
```

- [ ] **Step 6: Test manually**

Open the Siam Si screen in the simulator. Verify:
1. Draw a stick, result card appears
2. Share button appears below "Draw Again"
3. Tapping it opens the native share sheet with a PNG image
4. The image shows stick number, fortune badge, title, and meaning

- [ ] **Step 7: Commit**

```bash
git add app/\(main\)/oracle/siam-si.tsx
git commit -m "feat: add share button to Siam Si screen"
```

---

### Task 8: Final integration test

- [ ] **Step 1: Test Pulse sharing end-to-end**

1. Open app → Pulse tab
2. Wait for reading to load
3. Tap "Share" button
4. Verify native share sheet opens with image
5. Share to a test app (e.g., Messages, Save Image)
6. Verify the saved image is a branded card with correct data

- [ ] **Step 2: Test Siam Si sharing end-to-end**

1. Open app → Oracle tab → Siam Si
2. Draw a stick (shake or tap)
3. Tap "Share" button on result card
4. Verify native share sheet opens with image
5. Verify saved image shows correct stick data

- [ ] **Step 3: Test Thai language**

1. Switch app language to Thai in settings
2. Repeat Pulse and Siam Si share tests
3. Verify Thai text renders correctly on cards (NotoSansThai font)
4. Verify share message text is in Thai

- [ ] **Step 4: Verify edge cases**

1. Share button is NOT visible during loading state
2. Share button is NOT visible during error state
3. Rapidly tapping share doesn't open multiple share sheets (`isSharing` guard)
