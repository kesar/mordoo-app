# Widgets, Siri Shortcuts & Metadata Rewrite — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add iOS home screen widgets (Daily Pulse + Siam Si), Siri Shortcuts, rewrite App Store metadata to avoid "fortune telling" framing, and add reviewer notes — all to overcome Apple's 4.3(b) rejection.

**Architecture:** `expo-widgets` (official, SDK 55) for widgets using `@expo/ui/swift-ui` components. `react-native-siri-shortcut` with config plugin for Siri activity donation. Fastlane metadata files for App Store copy. Widget data is pushed via `updateSnapshot` from existing hooks after successful API fetches.

**Tech Stack:** expo-widgets, @expo/ui, react-native-siri-shortcut, @config-plugins/react-native-siri-shortcut, fastlane metadata

---

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`
- Modify: `app.json`

- [ ] **Step 1: Install expo-widgets and @expo/ui**

Run:
```bash
npx expo install expo-widgets @expo/ui
```

- [ ] **Step 2: Install Siri shortcut libraries**

Run:
```bash
npm install react-native-siri-shortcut @config-plugins/react-native-siri-shortcut
```

- [ ] **Step 3: Add expo-widgets config plugin to app.json**

In `app.json`, add to the `plugins` array (after existing plugins):

```json
[
  "expo-widgets",
  {
    "widgets": [
      {
        "name": "DailyPulseWidget",
        "displayName": "Daily Pulse",
        "description": "Your daily energy score and lucky elements",
        "supportedFamilies": ["systemSmall", "systemMedium"]
      },
      {
        "name": "SiamSiWidget",
        "displayName": "Siam Si",
        "description": "Today's fortune stick",
        "supportedFamilies": ["systemSmall", "accessoryRectangular"]
      }
    ]
  }
]
```

- [ ] **Step 4: Add Siri shortcut config plugin to app.json**

In `app.json`, add to the `plugins` array:

```json
"@config-plugins/react-native-siri-shortcut"
```

- [ ] **Step 5: Bump buildNumber and runtimeVersion**

In `app.json`:
- Change `"buildNumber": "23"` to `"buildNumber": "24"`
- Change `"runtimeVersion": "1.0.0"` to `"runtimeVersion": "1.1.0"`

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json app.json
git commit -m "feat: add expo-widgets and siri-shortcut dependencies"
```

---

### Task 2: Create Daily Pulse widget

**Files:**
- Create: `src/widgets/DailyPulseWidget.tsx`

- [ ] **Step 1: Create widget component**

Create `src/widgets/DailyPulseWidget.tsx`:

```tsx
import { Text, VStack, HStack, Spacer } from '@expo/ui/swift-ui';
import { font, foregroundStyle, padding, background, cornerRadius } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

type DailyPulseWidgetProps = {
  energyScore: number;
  luckyNumber: number;
  luckyColorName: string;
  luckyColorHex: string;
  insight: string;
  direction: string;
};

const DailyPulseWidget = (props: DailyPulseWidgetProps, env: WidgetEnvironment) => {
  'widget';

  if (env.widgetFamily === 'systemSmall') {
    return (
      <VStack spacing={4} modifiers={[padding({ all: 12 }), background('#0a0a14'), cornerRadius(16)]}>
        <Text modifiers={[font({ weight: 'bold', size: 11 }), foregroundStyle('#c9a84c')]}>
          หมอดู · PULSE
        </Text>
        <Text modifiers={[font({ weight: 'bold', size: 40 }), foregroundStyle('#f4e8c1')]}>
          {props.energyScore}
        </Text>
        <HStack spacing={6}>
          <Text modifiers={[font({ size: 12 }), foregroundStyle(props.luckyColorHex)]}>
            ● {props.luckyColorName}
          </Text>
          <Text modifiers={[font({ size: 12 }), foregroundStyle('#f4e8c1')]}>
            {props.luckyNumber}
          </Text>
        </HStack>
        <Spacer />
        <Text modifiers={[font({ size: 10 }), foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
          {props.direction}
        </Text>
      </VStack>
    );
  }

  // systemMedium
  return (
    <HStack spacing={16} modifiers={[padding({ all: 14 }), background('#0a0a14'), cornerRadius(16)]}>
      <VStack spacing={4}>
        <Text modifiers={[font({ weight: 'bold', size: 11 }), foregroundStyle('#c9a84c')]}>
          หมอดู · PULSE
        </Text>
        <Text modifiers={[font({ weight: 'bold', size: 44 }), foregroundStyle('#f4e8c1')]}>
          {props.energyScore}
        </Text>
        <HStack spacing={6}>
          <Text modifiers={[font({ size: 12 }), foregroundStyle(props.luckyColorHex)]}>
            ● {props.luckyColorName}
          </Text>
          <Text modifiers={[font({ size: 12 }), foregroundStyle('#f4e8c1')]}>
            {props.luckyNumber}
          </Text>
        </HStack>
      </VStack>
      <VStack spacing={6} alignment="leading">
        <Spacer />
        <Text modifiers={[font({ size: 13 }), foregroundStyle('#f4e8c1')]}>
          {props.insight}
        </Text>
        <Text modifiers={[font({ size: 11 }), foregroundStyle({ type: 'hierarchical', style: 'secondary' })]}>
          ↗ {props.direction}
        </Text>
        <Spacer />
      </VStack>
    </HStack>
  );
};

export default createWidget('DailyPulseWidget', DailyPulseWidget);
```

- [ ] **Step 2: Commit**

```bash
git add src/widgets/DailyPulseWidget.tsx
git commit -m "feat: add Daily Pulse home screen widget component"
```

---

### Task 3: Create Siam Si widget

**Files:**
- Create: `src/widgets/SiamSiWidget.tsx`

- [ ] **Step 1: Create widget component**

Create `src/widgets/SiamSiWidget.tsx`:

```tsx
import { Text, VStack, HStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, padding, background, cornerRadius } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

type SiamSiWidgetProps = {
  stickNumber: number;
  title: string;
  fortune: string;
  fortuneColor: string;
};

const FORTUNE_SYMBOLS: Record<string, string> = {
  excellent: '✦',
  good: '◆',
  fair: '○',
  caution: '△',
};

const SiamSiWidget = (props: SiamSiWidgetProps, env: WidgetEnvironment) => {
  'widget';

  const symbol = FORTUNE_SYMBOLS[props.fortune] ?? '○';

  if (env.widgetFamily === 'accessoryRectangular') {
    return (
      <VStack spacing={2} alignment="leading">
        <HStack spacing={4}>
          <Text modifiers={[font({ weight: 'bold', size: 12 }), foregroundStyle('#c9a84c')]}>
            เซียมซี
          </Text>
          <Text modifiers={[font({ size: 12 })]}>
            #{props.stickNumber}
          </Text>
        </HStack>
        <Text modifiers={[font({ size: 11 })]}>
          {props.title}
        </Text>
      </VStack>
    );
  }

  // systemSmall
  return (
    <VStack spacing={6} modifiers={[padding({ all: 12 }), background('#0a0a14'), cornerRadius(16)]}>
      <Text modifiers={[font({ weight: 'bold', size: 11 }), foregroundStyle('#c9a84c')]}>
        หมอดู · เซียมซี
      </Text>
      <Text modifiers={[font({ weight: 'bold', size: 32 }), foregroundStyle('#f4e8c1')]}>
        {symbol} {props.stickNumber}
      </Text>
      <Text modifiers={[font({ weight: 'semibold', size: 13 }), foregroundStyle('#f4e8c1')]}>
        {props.title}
      </Text>
      <Text modifiers={[font({ size: 11 }), foregroundStyle(props.fortuneColor)]}>
        {props.fortune}
      </Text>
    </VStack>
  );
};

export default createWidget('SiamSiWidget', SiamSiWidget);
```

- [ ] **Step 2: Commit**

```bash
git add src/widgets/SiamSiWidget.tsx
git commit -m "feat: add Siam Si home screen widget component"
```

---

### Task 4: Wire widget updates to existing hooks

**Files:**
- Modify: `app/(main)/pulse/index.tsx`
- Modify: `app/(main)/oracle/siam-si.tsx`

- [ ] **Step 1: Update Daily Pulse widget when pulse data loads**

In `app/(main)/pulse/index.tsx`, add at the top with other imports:

```tsx
import DailyPulseWidget from '@/src/widgets/DailyPulseWidget';
```

Then find the `useDailyPulse()` hook call and add a `useEffect` right after it to push data to the widget whenever the query succeeds:

```tsx
const { data, isLoading, error, ...rest } = useDailyPulse();

useEffect(() => {
  if (data) {
    DailyPulseWidget.updateSnapshot({
      energyScore: data.energyScore,
      luckyNumber: data.luckyNumber,
      luckyColorName: data.luckyColor.name,
      luckyColorHex: data.luckyColor.hex,
      insight: data.insight,
      direction: data.luckyDirection,
    });
  }
}, [data]);
```

- [ ] **Step 2: Update Siam Si widget when a stick is drawn**

In `app/(main)/oracle/siam-si.tsx`, add at the top with other imports:

```tsx
import SiamSiWidget from '@/src/widgets/SiamSiWidget';
```

Then add a `useEffect` after the `useSiamSi()` hook call to push data when a stick is drawn:

```tsx
const { currentStick, ...rest } = useSiamSi();

useEffect(() => {
  if (currentStick) {
    const lang = i18n.language as 'en' | 'th';
    SiamSiWidget.updateSnapshot({
      stickNumber: currentStick.number,
      title: lang === 'th' ? currentStick.titleTh : currentStick.titleEn,
      fortune: currentStick.fortune,
      fortuneColor: FORTUNE_COLORS[currentStick.fortune] ?? '#f4e8c1',
    });
  }
}, [currentStick, i18n.language]);
```

- [ ] **Step 3: Commit**

```bash
git add app/\(main\)/pulse/index.tsx app/\(main\)/oracle/siam-si.tsx
git commit -m "feat: wire widget updates to pulse and siam-si screens"
```

---

### Task 5: Add Siri Shortcuts donation

**Files:**
- Create: `src/utils/siri-shortcuts.ts`
- Modify: `app/(main)/pulse/index.tsx`
- Modify: `app/(main)/oracle/siam-si.tsx`
- Modify: `app/(main)/oracle/index.tsx`

- [ ] **Step 1: Create Siri shortcuts utility**

Create `src/utils/siri-shortcuts.ts`:

```tsx
import { donateShortcut } from 'react-native-siri-shortcut';
import { Platform } from 'react-native';

export function donatePulseShortcut() {
  if (Platform.OS !== 'ios') return;
  donateShortcut({
    activityType: 'ai.mordoo.app.dailyPulse',
    title: 'View Daily Reading',
    suggestedInvocationPhrase: 'Show my daily reading',
    isEligibleForSearch: true,
    isEligibleForPrediction: true,
  });
}

export function donateSiamSiShortcut() {
  if (Platform.OS !== 'ios') return;
  donateShortcut({
    activityType: 'ai.mordoo.app.siamSi',
    title: 'Draw Fortune Stick',
    suggestedInvocationPhrase: 'Draw a fortune stick',
    isEligibleForSearch: true,
    isEligibleForPrediction: true,
  });
}

export function donateOracleShortcut() {
  if (Platform.OS !== 'ios') return;
  donateShortcut({
    activityType: 'ai.mordoo.app.askOracle',
    title: 'Ask Mor Doo',
    suggestedInvocationPhrase: 'Ask Mor Doo',
    isEligibleForSearch: true,
    isEligibleForPrediction: true,
  });
}
```

- [ ] **Step 2: Donate shortcuts from screens**

In `app/(main)/pulse/index.tsx`, add import and call:

```tsx
import { donatePulseShortcut } from '@/src/utils/siri-shortcuts';

// Inside the component, after the useDailyPulse hook:
useEffect(() => {
  if (data) donatePulseShortcut();
}, [data]);
```

In `app/(main)/oracle/siam-si.tsx`, add import and call:

```tsx
import { donateSiamSiShortcut } from '@/src/utils/siri-shortcuts';

// Inside the component, after a successful draw:
useEffect(() => {
  if (currentStick) donateSiamSiShortcut();
}, [currentStick]);
```

In `app/(main)/oracle/index.tsx`, add import and call after the user sends a message. Find where messages are sent and add:

```tsx
import { donateOracleShortcut } from '@/src/utils/siri-shortcuts';

// Call after user sends their first message in a session:
donateOracleShortcut();
```

- [ ] **Step 3: Commit**

```bash
git add src/utils/siri-shortcuts.ts app/\(main\)/pulse/index.tsx app/\(main\)/oracle/siam-si.tsx app/\(main\)/oracle/index.tsx
git commit -m "feat: add Siri Shortcuts donation for pulse, siam-si, oracle"
```

---

### Task 6: Rewrite App Store metadata (English)

**Files:**
- Modify: `fastlane/metadata/en-US/name.txt`
- Modify: `fastlane/metadata/en-US/subtitle.txt`
- Modify: `fastlane/metadata/en-US/keywords.txt`
- Modify: `fastlane/metadata/en-US/description.txt`
- Modify: `fastlane/metadata/en-US/promotional_text.txt`

- [ ] **Step 1: Update name**

Change `fastlane/metadata/en-US/name.txt` to:
```
Mor Doo - AI Life Insight
```

- [ ] **Step 2: Update subtitle**

Change `fastlane/metadata/en-US/subtitle.txt` to:
```
Thai Wisdom & Daily Guidance
```

- [ ] **Step 3: Update keywords**

Change `fastlane/metadata/en-US/keywords.txt` to:
```
self-discovery,AI insight,Thai wisdom,numerology,daily guidance,siam si,personal growth,life path,energy score,mindfulness,wellness
```

- [ ] **Step 4: Update description**

Change `fastlane/metadata/en-US/description.txt` to:
```
Discover your personal path with Mor Doo — an AI-powered self-discovery companion rooted in centuries-old Thai wisdom traditions.

Unlike generic zodiac apps, Mor Doo brings three culturally distinct systems together in one deeply personalized experience:

YOUR DAILY PULSE
Start each morning with your Prana Index — a personalized energy score computed from your birth data using Thai numerology. See your lucky color, number, and direction for the day, plus sub-scores for business, heart, and body. Add the home screen widget to see your daily energy at a glance.

THE AI ORACLE
Have a real conversation with an AI guide who knows your birth chart, life path number, and personal concerns. Ask about any aspect of life — relationships, career, finances, well-being — and receive personalized insight that blends Thai, Chinese, and Western traditions. The Oracle remembers your past conversations, building a meaningful relationship over time.

SIAM SI — 28 TRADITIONAL THAI FORTUNE STICKS
Experience เซียมซี (Siam Si), a sacred Thai temple practice of drawing numbered bamboo sticks for guidance. Each of the 28 sticks carries poetic wisdom rooted in Buddhist tradition — from "Rising Dragon" (มังกรทะยาน) to "Royal Elephant" (ช้างราชพาหนะ). Shake your phone to draw, just like shaking the bamboo cylinder at the temple.

PERSONALIZED NUMEROLOGY
Your life path number, name vibration, and lucky elements — all computed from your exact birth data using Thai numerological methods, not generic sun-sign categories.

BILINGUAL BY DESIGN
Full Thai (ไทย) and English experience — culturally native in both languages, not a translation.

HOME SCREEN WIDGETS
Daily Pulse and Siam Si widgets bring your personalized insights directly to your home screen and lock screen.

SIRI SHORTCUTS
Ask Siri to show your daily reading, draw a fortune stick, or open the Oracle.

HOW IT WORKS
1. Enter your birth details to unlock your personal profile
2. Check your daily Pulse for energy, guidance, and lucky elements
3. Ask the Oracle anything — AI responds with personalized insight

WHAT'S INCLUDED FREE
• 1 Daily Pulse reading per day
• 1 Oracle conversation per day
• 2 Siam Si draws per day
• Home screen widgets
• Full bilingual interface

UPGRADE TO STANDARD (฿149/month)
• Unlimited Oracle conversations
• Unlimited Siam Si draws
• Persistent Oracle memory across sessions
• Priority AI responses

For entertainment and cultural exploration purposes.
```

- [ ] **Step 5: Update promotional text**

Change `fastlane/metadata/en-US/promotional_text.txt` to:
```
NEW: AI-powered self-discovery meets Thai cultural wisdom. Personalized daily insights, Siam Si fortune sticks, and a conversational AI Oracle — now with home screen widgets and Siri Shortcuts.
```

- [ ] **Step 6: Commit**

```bash
git add fastlane/metadata/en-US/
git commit -m "feat: rewrite English App Store metadata for 4.3(b) appeal"
```

---

### Task 7: Rewrite App Store metadata (Thai)

**Files:**
- Modify: `fastlane/metadata/th/name.txt`
- Modify: `fastlane/metadata/th/subtitle.txt`
- Modify: `fastlane/metadata/th/keywords.txt`
- Modify: `fastlane/metadata/th/description.txt`
- Modify: `fastlane/metadata/th/promotional_text.txt`

- [ ] **Step 1: Update name**

Change `fastlane/metadata/th/name.txt` to:
```
หมอดู - AI ดูดวงไทย
```

- [ ] **Step 2: Update subtitle**

Change `fastlane/metadata/th/subtitle.txt` to:
```
เซียมซี เลขศาสตร์ ดวงรายวัน
```

- [ ] **Step 3: Update keywords**

Change `fastlane/metadata/th/keywords.txt` to:
```
ดวงรายวัน,เลขนำโชค,เลขศาสตร์,AI ดูดวง,เซียมซี,พลังงาน,คำแนะนำ,สีนำโชค,ทิศนำโชค,ค้นหาตัวเอง,ภูมิปัญญาไทย
```

- [ ] **Step 4: Update description**

Change `fastlane/metadata/th/description.txt` to:
```
ค้นพบเส้นทางชีวิตของคุณกับ หมอดู — แอปค้นหาตัวเองที่ขับเคลื่อนด้วย AI ผสมผสานภูมิปัญญาไทยที่สืบทอดมาหลายร้อยปี

หมอดูไม่ใช่แอปดูดวงทั่วไป แต่นำระบบความเชื่อสามสายมาผสานเป็นประสบการณ์เฉพาะตัว:

ดวงวันนี้ (THE PULSE)
เริ่มต้นทุกเช้าด้วยดัชนีพลังชีวิต — คะแนนพลังงานเฉพาะตัวจากเลขศาสตร์ไทย พร้อมสีนำโชค เลขนำโชค ทิศนำโชค และคะแนนด้านธุรกิจ ความรัก สุขภาพ เพิ่มวิดเจ็ตหน้าจอเพื่อดูพลังงานประจำวันได้ทันที

ถามหมอดู AI (THE ORACLE)
สนทนากับหมอดู AI ที่รู้จักวันเกิด เลขชีวิต และเรื่องที่คุณสนใจ ถามได้ทุกเรื่อง — ความรัก การงาน การเงิน สุขภาพ หมอดู AI ผสมผสานโหราศาสตร์ไทย จีน และตะวันตก และจำบริบทการสนทนาข้ามเซสชัน

เซียมซี 28 กอ (SIAM SI)
สัมผัสประสบการณ์เซียมซีแบบดั้งเดิม — สั่นโทรศัพท์เหมือนเขย่ากระบอกไม้ไผ่ที่วัด ไม้เซียมซีทั้ง 28 กอมีคำทำนายที่ลึกซึ้ง จาก "มังกรทะยาน" ถึง "ช้างราชพาหนะ" สืบทอดจากภูมิปัญญาไทย

เลขศาสตร์เฉพาะตัว
เลขชีวิต พลังชื่อ ธาตุนำโชค — คำนวณจากวันเกิดจริงด้วยระบบเลขศาสตร์ ไม่ใช่ราศีแบบกว้างๆ

สองภาษาเต็มรูปแบบ
ใช้งานได้ทั้งภาษาไทยและอังกฤษ — ออกแบบมาสำหรับทั้งสองภาษาตั้งแต่แรก

วิดเจ็ตหน้าจอ
วิดเจ็ตดวงวันนี้และเซียมซี แสดงคำแนะนำเฉพาะตัวบนหน้าจอหลักและหน้าจอล็อก

ทางลัด Siri
ขอให้ Siri แสดงดวงวันนี้ สุ่มเซียมซี หรือเปิดหมอดู AI

วิธีใช้
1. กรอกข้อมูลวันเกิดเพื่อเปิดโปรไฟล์ของคุณ
2. เช็คดวงวันนี้ — พลังงาน โชค และคำแนะนำประจำวัน
3. ถามหมอดู AI — ได้คำตอบเฉพาะตัวทันที

ใช้ฟรี
• ดวงวันนี้ 1 ครั้ง/วัน
• ถามหมอดู AI 1 คำถาม/วัน
• เสี่ยงเซียมซี 2 ครั้ง/วัน
• วิดเจ็ตหน้าจอ
• สองภาษาเต็มรูปแบบ

อัปเกรดเป็น Standard (฿149/เดือน)
• ถามหมอดู AI ไม่จำกัด
• เสี่ยงเซียมซี ไม่จำกัด
• หมอดู AI จำบริบทการสนทนาข้ามเซสชัน
• ตอบเร็วขึ้น

เพื่อความบันเทิงและการสำรวจวัฒนธรรม
```

- [ ] **Step 5: Update promotional text**

Change `fastlane/metadata/th/promotional_text.txt` to:
```
ใหม่: AI ค้นหาตัวเองผสานภูมิปัญญาไทย ดวงวันนี้เฉพาะตัว เซียมซี 28 กอ หมอดู AI สนทนาได้ พร้อมวิดเจ็ตหน้าจอและทางลัด Siri
```

- [ ] **Step 6: Commit**

```bash
git add fastlane/metadata/th/
git commit -m "feat: rewrite Thai App Store metadata for 4.3(b) appeal"
```

---

### Task 8: Add reviewer notes

**Files:**
- Create: `fastlane/metadata/review_information/notes.txt`

- [ ] **Step 1: Create review_information directory and notes**

Run:
```bash
mkdir -p fastlane/metadata/review_information
```

Create `fastlane/metadata/review_information/notes.txt`:

```
Dear App Review Team,

Thank you for taking the time to review Mor Doo. We understand this category receives many submissions, and we appreciate the opportunity to explain what makes our app genuinely different from existing astrology apps on the App Store.

WHAT MOR DOO IS NOT:
Mor Doo is not a generic Western horoscope app. It does not generate sun-sign daily horoscopes, does not use template-based readings, and does not duplicate the content found in apps like Co-Star, The Pattern, or Sanctuary.

WHAT MAKES MOR DOO UNIQUE:

1. SIAM SI (เซียมซี) — A Thai Cultural Tradition with No App Store Representation
Siam Si is a centuries-old Thai Buddhist temple practice where seekers shake a bamboo cylinder to draw numbered fortune sticks. Each of our 28 sticks has an authentic Thai name and meaning (e.g., "มังกรทะยาน / Rising Dragon", "ช้างราชพาหนะ / Royal Elephant"). Users physically shake their phone to simulate the temple experience. We searched the App Store extensively — no existing app offers a quality digital Siam Si experience with AI interpretation.

2. AI-POWERED CONVERSATIONAL ORACLE (Not Template-Based)
Our Oracle uses Claude AI to conduct genuine two-way conversations. It is not a horoscope generator — it engages with the user's specific life questions, blends three distinct astrological traditions (Thai, Chinese, Western), and maintains conversation memory across sessions. This is fundamentally different from pre-written daily horoscope text.

3. THAI NUMEROLOGY ENGINE
Our numerology computation system (life path numbers, name vibrations, Prana Index energy scoring) is based on Thai numerological methods — a distinct system from Western astrology. It computes personalized daily readings from exact birth data, not generic zodiac categories.

4. UNDERSERVED CULTURAL MARKET
Mor Doo is fully bilingual (Thai/English) with native Thai text throughout. It serves the Thai-speaking community (70M+ in Thailand, 6M+ diaspora) with culturally authentic spiritual practices that have no quality digital representation on the App Store.

5. DEEP iOS PLATFORM INTEGRATION
This version adds:
- Home screen widgets (Daily Pulse energy score + Siam Si fortune stick) via WidgetKit
- Lock screen widgets
- Siri Shortcuts for quick access to readings
These demonstrate genuine investment in the iOS platform beyond what template or web-wrapper apps provide.

DEMO ACCOUNT:
You can use the app with any valid phone number or email. The onboarding asks for birth date and name to compute numerology — any data works for testing.

We believe Mor Doo serves a genuinely underrepresented cultural community with traditions and technology not found in any existing App Store app. We welcome a phone call to demonstrate these features live if that would be helpful.

Thank you for your consideration.
```

- [ ] **Step 2: Commit**

```bash
git add fastlane/metadata/review_information/
git commit -m "feat: add detailed reviewer notes for 4.3(b) appeal"
```

---

### Task 9: Update release notes

**Files:**
- Modify: `fastlane/metadata/en-US/release_notes.txt`
- Modify: `fastlane/metadata/th/release_notes.txt`

- [ ] **Step 1: Update English release notes**

Change `fastlane/metadata/en-US/release_notes.txt` to:
```
What's New in Mor Doo 1.0

• Home Screen Widgets — see your Daily Pulse energy score and Siam Si fortune stick right on your home screen
• Lock Screen Widgets — quick glance at your Siam Si reading on the lock screen
• Siri Shortcuts — ask Siri to show your daily reading or draw a fortune stick
• Daily Pulse — personalized energy score, lucky color, number, and direction
• AI Oracle — conversational AI guide blending Thai, Chinese, and Western traditions
• Siam Si — 28 traditional Thai fortune sticks with shake-to-draw
• Full Thai & English experience
```

- [ ] **Step 2: Update Thai release notes**

Change `fastlane/metadata/th/release_notes.txt` to:
```
มีอะไรใหม่ใน หมอดู 1.0

• วิดเจ็ตหน้าจอ — ดูคะแนนพลังงานและเซียมซีบนหน้าจอหลักได้ทันที
• วิดเจ็ตหน้าจอล็อก — ดูเซียมซีบนหน้าจอล็อก
• ทางลัด Siri — ขอให้ Siri แสดงดวงวันนี้หรือสุ่มเซียมซี
• ดวงวันนี้ — คะแนนพลังงาน สีนำโชค เลขนำโชค ทิศนำโชค
• หมอดู AI — สนทนากับ AI ที่ผสมผสานโหราศาสตร์ไทย จีน ตะวันตก
• เซียมซี 28 กอ — เขย่าโทรศัพท์เพื่อสุ่มเซียมซีแบบดั้งเดิม
• รองรับภาษาไทยและอังกฤษเต็มรูปแบบ
```

- [ ] **Step 3: Commit**

```bash
git add fastlane/metadata/en-US/release_notes.txt fastlane/metadata/th/release_notes.txt
git commit -m "feat: update release notes to highlight widgets and Siri"
```

---

### Task 10: Verify build

- [ ] **Step 1: Run TypeScript check**

Run:
```bash
npx tsc --noEmit
```

Expected: No errors. If there are type errors from the new widget/siri imports, fix them.

- [ ] **Step 2: Run tests**

Run:
```bash
npm test
```

Expected: All existing tests pass (widgets don't affect shared logic tests).

- [ ] **Step 3: Verify prebuild generates widget target**

Run:
```bash
npx expo prebuild --clean --platform ios 2>&1 | head -40
```

Look for output mentioning the widget extension target being generated. This confirms `expo-widgets` config plugin is working.

- [ ] **Step 4: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: resolve build issues from widget/siri integration"
```
