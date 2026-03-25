# Zodiac Profile Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add personalized Western zodiac and Chinese zodiac cards to the profile page, with API-served bilingual content and custom-generated illustrations.

**Architecture:** A GET endpoint looks up the user's birth date, computes both zodiac signs using shared logic, and returns localized content. The profile screen fetches this data via React Query and renders two `SacredCard`-based zodiac cards between the avatar and subscription sections. 24 illustrations are generated via Gemini CLI.

**Tech Stack:** React Native / Expo, Next.js API, Supabase auth, React Query, i18next, Gemini CLI (image generation)

**Spec:** `docs/superpowers/specs/2026-03-25-zodiac-profile-cards-design.md`

---

### Task 1: Shared Zodiac Computation Logic

**Files:**
- Create: `shared/zodiac.ts`

- [ ] **Step 1: Create `shared/zodiac.ts` with Western zodiac function**

```typescript
// shared/zodiac.ts

const WESTERN_SIGNS = [
  { sign: 'capricorn',   startMonth: 1,  startDay: 1,  endMonth: 1,  endDay: 19 },
  { sign: 'aquarius',    startMonth: 1,  startDay: 20, endMonth: 2,  endDay: 18 },
  { sign: 'pisces',      startMonth: 2,  startDay: 19, endMonth: 3,  endDay: 20 },
  { sign: 'aries',       startMonth: 3,  startDay: 21, endMonth: 4,  endDay: 19 },
  { sign: 'taurus',      startMonth: 4,  startDay: 20, endMonth: 5,  endDay: 20 },
  { sign: 'gemini',      startMonth: 5,  startDay: 21, endMonth: 6,  endDay: 20 },
  { sign: 'cancer',      startMonth: 6,  startDay: 21, endMonth: 7,  endDay: 22 },
  { sign: 'leo',         startMonth: 7,  startDay: 23, endMonth: 8,  endDay: 22 },
  { sign: 'virgo',       startMonth: 8,  startDay: 23, endMonth: 9,  endDay: 22 },
  { sign: 'libra',       startMonth: 9,  startDay: 23, endMonth: 10, endDay: 22 },
  { sign: 'scorpio',     startMonth: 10, startDay: 23, endMonth: 11, endDay: 21 },
  { sign: 'sagittarius', startMonth: 11, startDay: 22, endMonth: 12, endDay: 21 },
  { sign: 'capricorn',   startMonth: 12, startDay: 22, endMonth: 12, endDay: 31 },
] as const;

export function getWesternZodiacSign(dateOfBirth: string): string {
  const datePart = dateOfBirth.split('T')[0];
  const [, monthStr, dayStr] = datePart.split('-');
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  for (const entry of WESTERN_SIGNS) {
    const afterStart = month > entry.startMonth ||
                       (month === entry.startMonth && day >= entry.startDay);
    const beforeEnd = month < entry.endMonth ||
                      (month === entry.endMonth && day <= entry.endDay);
    if (afterStart && beforeEnd) {
      return entry.sign;
    }
  }
  return 'capricorn'; // fallback (should not happen)
}
```

- [ ] **Step 2: Add Chinese zodiac animal function**

Append to `shared/zodiac.ts`:

```typescript
const CHINESE_ANIMALS = [
  'rat', 'ox', 'tiger', 'rabbit', 'dragon', 'snake',
  'horse', 'goat', 'monkey', 'rooster', 'dog', 'pig',
] as const;

export function getChineseZodiacAnimal(dateOfBirth: string): string {
  const datePart = dateOfBirth.split('T')[0];
  const year = parseInt(datePart.split('-')[0], 10);
  // 1900 was Year of the Rat
  const index = ((year - 1900) % 12 + 12) % 12;
  return CHINESE_ANIMALS[index];
}
```

- [ ] **Step 3: Add Chinese element function (heavenly stem cycle)**

Append to `shared/zodiac.ts`:

```typescript
const HEAVENLY_ELEMENTS = ['metal', 'metal', 'water', 'water', 'wood', 'wood', 'fire', 'fire', 'earth', 'earth'] as const;

export function getChineseElement(dateOfBirth: string): string {
  const datePart = dateOfBirth.split('T')[0];
  const year = parseInt(datePart.split('-')[0], 10);
  return HEAVENLY_ELEMENTS[year % 10];
}
```

- [ ] **Step 4: Verify manually with boundary cases**

Run: `npx ts-node -e "const z = require('./shared/zodiac'); console.log('Mar 25:', z.getWesternZodiacSign('1990-03-25')); console.log('Jan 20:', z.getWesternZodiacSign('1990-01-20')); console.log('Jan 19:', z.getWesternZodiacSign('1990-01-19')); console.log('Dec 22:', z.getWesternZodiacSign('1990-12-22')); console.log('Dec 21:', z.getWesternZodiacSign('1990-12-21')); console.log('Animal:', z.getChineseZodiacAnimal('1990-03-25')); console.log('Element:', z.getChineseElement('1990-03-25'));"`

Expected:
- Mar 25 → `aries`
- Jan 20 → `aquarius`
- Jan 19 → `capricorn`
- Dec 22 → `capricorn`
- Dec 21 → `sagittarius`
- Animal → `horse`
- Element → `metal`

- [ ] **Step 5: Commit**

```bash
git add shared/zodiac.ts
git commit -m "feat: add shared zodiac computation logic (western, chinese, element)"
```

---

### Task 2: Shared Response Type

**Files:**
- Modify: `shared/types.ts`

- [ ] **Step 1: Add `ZodiacSignsResponse` type**

Append to `shared/types.ts`:

```typescript
export interface ZodiacSignsResponse {
  western: {
    sign: string;
    name: string;
    element: string;
    rulingPlanet: string;
    dateRange: string;
    traits: string;
    image: string;
  };
  chinese: {
    animal: string;
    name: string;
    element: string;
    traits: string;
    image: string;
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add shared/types.ts
git commit -m "feat: add ZodiacSignsResponse type"
```

---

### Task 3: API Endpoint

**Files:**
- Create: `api/src/app/api/zodiac/signs/route.ts`

The endpoint follows the exact pattern from `api/src/app/api/pulse/daily/route.ts`: authenticate → fetch birth data → compute → localize → return.

- [ ] **Step 1: Create the bilingual content maps**

Create `api/src/app/api/zodiac/signs/route.ts` with the content data and localization:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '../../../../lib/supabase';
import { authenticateRequest } from '../../../../lib/auth';
import { validateLang } from '../../../../lib/localize';
import { getWesternZodiacSign, getChineseZodiacAnimal, getChineseElement } from '@shared/zodiac';

type Lang = 'en' | 'th';

const WESTERN_CONTENT: Record<string, {
  nameEn: string; nameTh: string;
  element: string; elementTh: string;
  rulingPlanet: string; rulingPlanetTh: string;
  dateRange: string;
  traitsEn: string; traitsTh: string;
}> = {
  aries:       { nameEn: 'Aries',       nameTh: 'ราศีเมษ',       element: 'Fire',  elementTh: 'ไฟ',    rulingPlanet: 'Mars',    rulingPlanetTh: 'ดาวอังคาร',   dateRange: 'Mar 21 – Apr 19', traitsEn: 'Bold, courageous, and full of energy',          traitsTh: 'กล้าหาญ มุ่งมั่น เต็มไปด้วยพลัง' },
  taurus:      { nameEn: 'Taurus',      nameTh: 'ราศีพฤษภ',      element: 'Earth', elementTh: 'ดิน',   rulingPlanet: 'Venus',   rulingPlanetTh: 'ดาวศุกร์',    dateRange: 'Apr 20 – May 20', traitsEn: 'Patient, reliable, and devoted',                traitsTh: 'อดทน เชื่อถือได้ และทุ่มเท' },
  gemini:      { nameEn: 'Gemini',      nameTh: 'ราศีเมถุน',     element: 'Air',   elementTh: 'ลม',    rulingPlanet: 'Mercury', rulingPlanetTh: 'ดาวพุธ',      dateRange: 'May 21 – Jun 20', traitsEn: 'Curious, adaptable, and quick-witted',          traitsTh: 'อยากรู้อยากเห็น ปรับตัวเก่ง ฉลาดไว' },
  cancer:      { nameEn: 'Cancer',      nameTh: 'ราศีกรกฎ',      element: 'Water', elementTh: 'น้ำ',   rulingPlanet: 'Moon',    rulingPlanetTh: 'ดวงจันทร์',   dateRange: 'Jun 21 – Jul 22', traitsEn: 'Nurturing, intuitive, and protective',          traitsTh: 'เอื้ออาทร สัญชาตญาณดี และปกป้อง' },
  leo:         { nameEn: 'Leo',         nameTh: 'ราศีสิงห์',     element: 'Fire',  elementTh: 'ไฟ',    rulingPlanet: 'Sun',     rulingPlanetTh: 'ดวงอาทิตย์',  dateRange: 'Jul 23 – Aug 22', traitsEn: 'Confident, dramatic, and warm-hearted',         traitsTh: 'มั่นใจ โดดเด่น และใจดี' },
  virgo:       { nameEn: 'Virgo',       nameTh: 'ราศีกันย์',     element: 'Earth', elementTh: 'ดิน',   rulingPlanet: 'Mercury', rulingPlanetTh: 'ดาวพุธ',      dateRange: 'Aug 23 – Sep 22', traitsEn: 'Analytical, practical, and meticulous',         traitsTh: 'ช่างวิเคราะห์ ปฏิบัติจริง และละเอียด' },
  libra:       { nameEn: 'Libra',       nameTh: 'ราศีตุลย์',     element: 'Air',   elementTh: 'ลม',    rulingPlanet: 'Venus',   rulingPlanetTh: 'ดาวศุกร์',    dateRange: 'Sep 23 – Oct 22', traitsEn: 'Diplomatic, gracious, and fair-minded',         traitsTh: 'รอบคอบ สง่างาม และยุติธรรม' },
  scorpio:     { nameEn: 'Scorpio',     nameTh: 'ราศีพิจิก',     element: 'Water', elementTh: 'น้ำ',   rulingPlanet: 'Pluto',   rulingPlanetTh: 'ดาวพลูโต',    dateRange: 'Oct 23 – Nov 21', traitsEn: 'Passionate, resourceful, and determined',       traitsTh: 'หลงใหล มีไหวพริบ และมุ่งมั่น' },
  sagittarius: { nameEn: 'Sagittarius', nameTh: 'ราศีธนู',       element: 'Fire',  elementTh: 'ไฟ',    rulingPlanet: 'Jupiter', rulingPlanetTh: 'ดาวพฤหัสบดี', dateRange: 'Nov 22 – Dec 21', traitsEn: 'Adventurous, optimistic, and free-spirited',    traitsTh: 'ชอบผจญภัย มองโลกสดใส และรักอิสระ' },
  capricorn:   { nameEn: 'Capricorn',   nameTh: 'ราศีมังกร',     element: 'Earth', elementTh: 'ดิน',   rulingPlanet: 'Saturn',  rulingPlanetTh: 'ดาวเสาร์',    dateRange: 'Dec 22 – Jan 19', traitsEn: 'Ambitious, disciplined, and responsible',       traitsTh: 'ทะเยอทะยาน มีวินัย และรับผิดชอบ' },
  aquarius:    { nameEn: 'Aquarius',    nameTh: 'ราศีกุมภ์',     element: 'Air',   elementTh: 'ลม',    rulingPlanet: 'Uranus',  rulingPlanetTh: 'ดาวยูเรนัส',  dateRange: 'Jan 20 – Feb 18', traitsEn: 'Independent, innovative, and humanitarian',     traitsTh: 'เป็นตัวของตัวเอง สร้างสรรค์ และมีจิตใจเมตตา' },
  pisces:      { nameEn: 'Pisces',      nameTh: 'ราศีมีน',       element: 'Water', elementTh: 'น้ำ',   rulingPlanet: 'Neptune', rulingPlanetTh: 'ดาวเนปจูน',   dateRange: 'Feb 19 – Mar 20', traitsEn: 'Compassionate, artistic, and deeply intuitive', traitsTh: 'เห็นอกเห็นใจ มีศิลปะ และสัญชาตญาณลึกซึ้ง' },
};

const CHINESE_CONTENT: Record<string, {
  nameEn: string; nameTh: string;
  traitsEn: string; traitsTh: string;
}> = {
  rat:     { nameEn: 'Rat',     nameTh: 'ชวด (หนู)',     traitsEn: 'Clever, resourceful, and versatile',        traitsTh: 'ฉลาด มีไหวพริบ และรอบรู้' },
  ox:      { nameEn: 'Ox',      nameTh: 'ฉลู (วัว)',     traitsEn: 'Diligent, dependable, and strong',           traitsTh: 'ขยัน เชื่อถือได้ และแข็งแกร่ง' },
  tiger:   { nameEn: 'Tiger',   nameTh: 'ขาล (เสือ)',    traitsEn: 'Brave, confident, and competitive',          traitsTh: 'กล้าหาญ มั่นใจ และมีความมุ่งมั่น' },
  rabbit:  { nameEn: 'Rabbit',  nameTh: 'เถาะ (กระต่าย)', traitsEn: 'Gentle, elegant, and compassionate',        traitsTh: 'อ่อนโยน สง่างาม และเมตตา' },
  dragon:  { nameEn: 'Dragon',  nameTh: 'มะโรง (มังกร)', traitsEn: 'Powerful, ambitious, and charismatic',        traitsTh: 'ทรงพลัง ทะเยอทะยาน และมีเสน่ห์' },
  snake:   { nameEn: 'Snake',   nameTh: 'มะเส็ง (งู)',   traitsEn: 'Wise, mysterious, and graceful',              traitsTh: 'ฉลาด ลึกลับ และสง่างาม' },
  horse:   { nameEn: 'Horse',   nameTh: 'มะเมีย (ม้า)',  traitsEn: 'Energetic, free-spirited, and adventurous',   traitsTh: 'กระตือรือร้น รักอิสระ และชอบผจญภัย' },
  goat:    { nameEn: 'Goat',    nameTh: 'มะแม (แพะ)',    traitsEn: 'Calm, gentle, and creative',                  traitsTh: 'สงบ อ่อนโยน และสร้างสรรค์' },
  monkey:  { nameEn: 'Monkey',  nameTh: 'วอก (ลิง)',     traitsEn: 'Witty, intelligent, and playful',             traitsTh: 'มีไหวพริบ ฉลาด และร่าเริง' },
  rooster: { nameEn: 'Rooster', nameTh: 'ระกา (ไก่)',    traitsEn: 'Observant, hardworking, and courageous',      traitsTh: 'ช่างสังเกต ขยัน และกล้าหาญ' },
  dog:     { nameEn: 'Dog',     nameTh: 'จอ (สุนัข)',    traitsEn: 'Loyal, honest, and kind',                     traitsTh: 'ซื่อสัตย์ จริงใจ และใจดี' },
  pig:     { nameEn: 'Pig',     nameTh: 'กุน (หมู)',     traitsEn: 'Generous, compassionate, and diligent',       traitsTh: 'ใจกว้าง เห็นอกเห็นใจ และขยัน' },
};

const ELEMENT_NAMES: Record<string, { nameEn: string; nameTh: string }> = {
  wood:  { nameEn: 'Wood',  nameTh: 'ไม้' },
  fire:  { nameEn: 'Fire',  nameTh: 'ไฟ' },
  earth: { nameEn: 'Earth', nameTh: 'ดิน' },
  metal: { nameEn: 'Metal', nameTh: 'ทอง' },
  water: { nameEn: 'Water', nameTh: 'น้ำ' },
};
```

- [ ] **Step 2: Add the GET handler**

Add below the content maps in the same file:

```typescript
export async function GET(request: NextRequest) {
  // 1. Validate auth
  const { user, error: authError } = await authenticateRequest(request);
  if (authError) return authError;

  // 2. Get lang parameter
  const lang = validateLang(request.nextUrl.searchParams.get('lang'));

  // 3. Fetch birth data
  const serviceClient = createServiceClient();
  const { data: birthData, error: birthError } = await serviceClient
    .from('birth_data')
    .select('date_of_birth')
    .eq('user_id', user.id)
    .single();

  if (birthError || !birthData?.date_of_birth) {
    return NextResponse.json({ error: 'No birth data found' }, { status: 404 });
  }

  const dob = birthData.date_of_birth;

  // 4. Compute signs
  const westernSign = getWesternZodiacSign(dob);
  const chineseAnimal = getChineseZodiacAnimal(dob);
  const chineseElement = getChineseElement(dob);

  // 5. Build localized response
  const w = WESTERN_CONTENT[westernSign];
  const c = CHINESE_CONTENT[chineseAnimal];
  const ce = ELEMENT_NAMES[chineseElement];
  const isEn = lang === 'en';

  return NextResponse.json({
    western: {
      sign: westernSign,
      name: isEn ? w.nameEn : w.nameTh,
      element: isEn ? w.element : w.elementTh,
      rulingPlanet: isEn ? w.rulingPlanet : w.rulingPlanetTh,
      dateRange: w.dateRange,
      traits: isEn ? w.traitsEn : w.traitsTh,
      image: westernSign,
    },
    chinese: {
      animal: chineseAnimal,
      name: isEn ? c.nameEn : c.nameTh,
      element: isEn ? ce.nameEn : ce.nameTh,
      traits: isEn ? c.traitsEn : c.traitsTh,
      image: chineseAnimal,
    },
  });
}
```

- [ ] **Step 3: Verify the API starts**

Run: `cd api && npm run build`
Expected: No TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add api/src/app/api/zodiac/signs/route.ts
git commit -m "feat: add GET /api/zodiac/signs endpoint with bilingual content"
```

---

### Task 4: Client Service

**Files:**
- Create: `src/services/zodiac.ts`

- [ ] **Step 1: Create the service function**

Follow the exact pattern from `src/services/pulse.ts`:

```typescript
import { supabase } from '@/src/lib/supabase';
import type { ZodiacSignsResponse } from '@shared/types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

export async function fetchZodiacSigns(lang: 'en' | 'th' = 'en'): Promise<ZodiacSignsResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await fetch(
    `${API_BASE_URL}/api/zodiac/signs?lang=${lang}`,
    { headers: { Authorization: `Bearer ${session.access_token}` } },
  );

  if (!response.ok) {
    throw new Error(`Zodiac API error: ${response.status}`);
  }

  return response.json();
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/zodiac.ts
git commit -m "feat: add zodiac signs API client service"
```

---

### Task 5: Generate Zodiac Illustrations via Gemini CLI

**Files:**
- Create: `assets/images/zodiac/western/*.webp` (12 files)
- Create: `assets/images/zodiac/chinese/*.webp` (12 files)

Use Gemini CLI to generate 24 images. Each image should be a mystical zodiac illustration in the Mordoo gold-on-dark style.

- [ ] **Step 1: Create asset directories**

```bash
mkdir -p assets/images/zodiac/western assets/images/zodiac/chinese
```

- [ ] **Step 2: Generate all 12 Western zodiac illustrations**

Use Gemini CLI to generate each image. Use a consistent prompt style for all:

**Prompt template for Western signs:**
> "A mystical illustration of the [SIGN] zodiac symbol. Gold metallic linework on a deep dark navy-purple background (#0a0a14). Ethereal glow, celestial atmosphere, occult mystical style. The [SYMBOL DESCRIPTION] rendered in elegant gold lines with subtle luminous particles. Square format, 240x240px, dark background, no text."

Generate for: Aries (ram), Taurus (bull), Gemini (twins), Cancer (crab), Leo (lion), Virgo (maiden), Libra (scales), Scorpio (scorpion), Sagittarius (archer), Capricorn (sea-goat), Aquarius (water-bearer), Pisces (fish).

Save as webp to `assets/images/zodiac/western/{sign}.webp`.

- [ ] **Step 3: Generate all 12 Chinese zodiac illustrations**

**Prompt template for Chinese animals:**
> "A mystical illustration of the Chinese zodiac [ANIMAL]. Gold metallic linework on a deep dark navy-purple background (#0a0a14). Ethereal glow, celestial atmosphere, East Asian mystical style. The [ANIMAL] rendered in elegant gold lines with subtle luminous particles. Square format, 240x240px, dark background, no text."

Generate for: Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog, Pig.

Save as webp to `assets/images/zodiac/chinese/{animal}.webp`.

- [ ] **Step 4: Verify all 24 images exist**

```bash
ls assets/images/zodiac/western/ && ls assets/images/zodiac/chinese/
```

Expected: 12 files in each directory.

- [ ] **Step 5: Commit**

```bash
git add assets/images/zodiac/
git commit -m "feat: add 24 zodiac illustrations (western + chinese)"
```

---

### Task 6: ZodiacCard UI Component

**Files:**
- Create: `src/components/ZodiacCard.tsx`

- [ ] **Step 1: Create the component**

```typescript
import React from 'react';
import { View, Image, StyleSheet, type ImageSourcePropType } from 'react-native';
import { SacredCard } from '@/src/components/ui/SacredCard';
import { Text } from '@/src/components/ui/Text';
import { colors } from '@/src/constants/colors';
import { fonts, fontSizes } from '@/src/constants/typography';

interface ZodiacCardProps {
  systemLabel: string;
  signName: string;
  element: string;
  rulingPlanet?: string;
  traits: string;
  image: ImageSourcePropType;
}

export function ZodiacCard({ systemLabel, signName, element, rulingPlanet, traits, image }: ZodiacCardProps) {
  const detailParts = [element, rulingPlanet, traits].filter(Boolean);

  return (
    <SacredCard
      variant="low"
      style={styles.card}
    >
      <View style={styles.row} accessible accessibilityLabel={`${systemLabel}: ${signName}`}>
        <View style={styles.imageContainer}>
          <Image source={image} style={styles.image} />
        </View>
        <View style={styles.info}>
          <Text style={styles.systemLabel}>{systemLabel}</Text>
          <Text style={styles.signName}>{signName}</Text>
          <Text style={styles.details} numberOfLines={2}>{detailParts.join(' · ')}</Text>
        </View>
      </View>
    </SacredCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  imageContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gold.border,
    overflow: 'hidden',
    backgroundColor: colors.night.DEFAULT,
  },
  image: {
    width: 52,
    height: 52,
  },
  info: {
    flex: 1,
  },
  systemLabel: {
    color: colors.gold.DEFAULT,
    fontSize: fontSizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  signName: {
    color: colors.parchment.DEFAULT,
    fontSize: fontSizes.lg,
    fontFamily: fonts.display.bold,
  },
  details: {
    color: colors.outline,
    fontSize: fontSizes.xs,
    marginTop: 2,
  },
});
```

- [ ] **Step 2: Verify app compiles**

Run: `npx tsc --noEmit`
Expected: No errors related to ZodiacCard.

- [ ] **Step 3: Commit**

```bash
git add src/components/ZodiacCard.tsx
git commit -m "feat: add ZodiacCard UI component"
```

---

### Task 7: Translations

**Files:**
- Modify: `src/i18n/en/settings.json`
- Modify: `src/i18n/th/settings.json`

- [ ] **Step 1: Add English translations**

Add to `src/i18n/en/settings.json`:

```json
"westernZodiac": "Western Zodiac",
"chineseZodiac": "Chinese Zodiac"
```

- [ ] **Step 2: Add Thai translations**

Add to `src/i18n/th/settings.json`:

```json
"westernZodiac": "ราศีตะวันตก",
"chineseZodiac": "นักษัตรจีน"
```

- [ ] **Step 3: Commit**

```bash
git add src/i18n/en/settings.json src/i18n/th/settings.json
git commit -m "feat: add zodiac section translation keys"
```

---

### Task 8: Profile Page Integration

**Files:**
- Modify: `app/(main)/profile/index.tsx`

This is the final integration. Add React Query hook and render zodiac cards.

- [ ] **Step 1: Add imports**

Add to the top of `app/(main)/profile/index.tsx`:

```typescript
import { ZodiacCard } from '@/src/components/ZodiacCard';
import { fetchZodiacSigns } from '@/src/services/zodiac';
```

- [ ] **Step 2: Create the zodiac image map**

Add above the `ProfileScreen` component:

```typescript
const WESTERN_IMAGES: Record<string, any> = {
  aries: require('@/assets/images/zodiac/western/aries.webp'),
  taurus: require('@/assets/images/zodiac/western/taurus.webp'),
  gemini: require('@/assets/images/zodiac/western/gemini.webp'),
  cancer: require('@/assets/images/zodiac/western/cancer.webp'),
  leo: require('@/assets/images/zodiac/western/leo.webp'),
  virgo: require('@/assets/images/zodiac/western/virgo.webp'),
  libra: require('@/assets/images/zodiac/western/libra.webp'),
  scorpio: require('@/assets/images/zodiac/western/scorpio.webp'),
  sagittarius: require('@/assets/images/zodiac/western/sagittarius.webp'),
  capricorn: require('@/assets/images/zodiac/western/capricorn.webp'),
  aquarius: require('@/assets/images/zodiac/western/aquarius.webp'),
  pisces: require('@/assets/images/zodiac/western/pisces.webp'),
};

const CHINESE_IMAGES: Record<string, any> = {
  rat: require('@/assets/images/zodiac/chinese/rat.webp'),
  ox: require('@/assets/images/zodiac/chinese/ox.webp'),
  tiger: require('@/assets/images/zodiac/chinese/tiger.webp'),
  rabbit: require('@/assets/images/zodiac/chinese/rabbit.webp'),
  dragon: require('@/assets/images/zodiac/chinese/dragon.webp'),
  snake: require('@/assets/images/zodiac/chinese/snake.webp'),
  horse: require('@/assets/images/zodiac/chinese/horse.webp'),
  goat: require('@/assets/images/zodiac/chinese/goat.webp'),
  monkey: require('@/assets/images/zodiac/chinese/monkey.webp'),
  rooster: require('@/assets/images/zodiac/chinese/rooster.webp'),
  dog: require('@/assets/images/zodiac/chinese/dog.webp'),
  pig: require('@/assets/images/zodiac/chinese/pig.webp'),
};
```

- [ ] **Step 3: Add React Query hook inside `ProfileScreen`**

Add after the existing `useQuery` for profile:

```typescript
const { data: zodiac } = useQuery({
  queryKey: ['zodiac-signs', userId, language],
  queryFn: () => fetchZodiacSigns(language as 'en' | 'th'),
  enabled: !!userId && !!profile?.dateOfBirth,
  staleTime: Infinity,
});
```

- [ ] **Step 4: Render zodiac cards in JSX**

Insert between the closing `</View>` of the `{/* Profile Card */}` section and the `{/* Subscription */}` section:

```tsx
{/* Zodiac Signs */}
{zodiac && (
  <View style={{ gap: 0, marginBottom: 14 }}>
    <ZodiacCard
      systemLabel={t('westernZodiac')}
      signName={zodiac.western.name}
      element={zodiac.western.element}
      rulingPlanet={zodiac.western.rulingPlanet}
      traits={zodiac.western.traits}
      image={WESTERN_IMAGES[zodiac.western.image]}
    />
    <ZodiacCard
      systemLabel={t('chineseZodiac')}
      signName={zodiac.chinese.name}
      element={zodiac.chinese.element}
      traits={zodiac.chinese.traits}
      image={CHINESE_IMAGES[zodiac.chinese.image]}
    />
  </View>
)}
```

- [ ] **Step 5: Verify app compiles and renders**

Run: `npx tsc --noEmit`
Then visually check on simulator: `npx expo start`

Expected: Profile page shows two zodiac cards between the profile card and subscription section.

- [ ] **Step 6: Commit**

```bash
git add app/(main)/profile/index.tsx
git commit -m "feat: integrate zodiac cards into profile page"
```
