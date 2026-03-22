# API-First Architecture with Localization — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move all computation to the API and add EN/TH localization so the app can be updated without new builds.

**Architecture:** Shared modules (`shared/`) stay as the single source of truth for computation logic, used only by the API server. The app becomes a thin client that always calls the API. A `lang` parameter controls which language the API returns. Guest mode is removed — sign-in is required.

**Tech Stack:** Next.js API routes, Supabase (auth + cache), React Native/Expo, React Query, Zustand

**Spec:** `docs/superpowers/specs/2026-03-22-api-first-localization-design.md`

---

## Chunk 1: Shared Module Updates

### Task 1: Extract shared `hashCode` utility

**Files:**
- Create: `shared/hash.ts`
- Modify: `shared/compute-reading.ts`
- Modify: `shared/siam-si.ts`

- [ ] **Step 1: Create `shared/hash.ts`**

```ts
// Simple string hash → unsigned 32-bit integer
export function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash);
}
```

- [ ] **Step 2: Update `shared/compute-reading.ts` to import from `shared/hash.ts`**

Remove the local `hashCode` function (lines 5-12). Add import:

```ts
import { hashCode } from './hash';
```

- [ ] **Step 3: Update `shared/siam-si.ts` to import from `shared/hash.ts`**

Remove the local `hashCode` function (lines 42-49). Add import:

```ts
import { hashCode } from './hash';
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd /Users/kesar/projects/mordoo-app && npx tsc --noEmit --project tsconfig.json 2>&1 | head -20
```

- [ ] **Step 5: Commit**

```bash
git add shared/hash.ts shared/compute-reading.ts shared/siam-si.ts
git commit -m "refactor: extract shared hashCode utility"
```

---

### Task 2: Add Thai translations to insight templates

**Files:**
- Modify: `shared/insight-templates.ts`

- [ ] **Step 1: Change template structure to bilingual**

Replace the entire `TEMPLATES` constant and `selectInsight` function. The new structure uses `{ en: string; th: string }[]` for each element pool.

Each of the 48 entries needs a Thai translation. The Thai translations should match the tone and meaning of the English originals. Here are the translations:

**high/fire:**
1. en: "A powerful day for bold decisions. Your fire energy peaks in the morning — act before noon."
   th: "วันแห่งการตัดสินใจที่กล้าหาญ พลังไฟของคุณสูงสุดในตอนเช้า — ลงมือก่อนเที่ยง"
2. en: "Creative sparks fly today. Channel your intensity into one focused project."
   th: "ประกายความคิดสร้างสรรค์วันนี้ มุ่งพลังทั้งหมดไปที่โปรเจกต์เดียว"
3. en: "Your confidence radiates today. Others notice — use this for negotiations."
   th: "ความมั่นใจของคุณเปล่งประกายวันนี้ คนรอบข้างสังเกตเห็น — ใช้โอกาสนี้เจรจา"
4. en: "A strong day for leadership. Trust your instincts and move decisively."
   th: "วันที่เหมาะกับการเป็นผู้นำ เชื่อสัญชาตญาณและเดินหน้าอย่างเด็ดขาด"

**high/water:**
5. en: "Intuition runs deep today. Trust your gut on financial matters."
   th: "สัญชาตญาณแรงกล้าวันนี้ เชื่อใจตัวเองในเรื่องการเงิน"
6. en: "Emotional clarity arrives. A good day to mend relationships or start new ones."
   th: "ความชัดเจนทางอารมณ์มาถึง วันดีที่จะซ่อมแซมความสัมพันธ์หรือเริ่มต้นใหม่"
7. en: "Your empathy is your superpower today. Listen more than you speak."
   th: "ความเห็นอกเห็นใจคือพลังพิเศษวันนี้ ฟังมากกว่าพูด"
8. en: "Flow with changes today — resistance creates friction, acceptance creates power."
   th: "ไหลไปกับความเปลี่ยนแปลงวันนี้ — การต่อต้านสร้างแรงเสียดทาน การยอมรับสร้างพลัง"

**high/earth:**
9. en: "Stability is your strength today. Build something that lasts."
   th: "ความมั่นคงคือจุดแข็งวันนี้ สร้างสิ่งที่ยั่งยืน"
10. en: "Practical wisdom guides you. Focus on long-term investments and health."
    th: "ปัญญาเชิงปฏิบัตินำทางคุณ มุ่งเน้นการลงทุนระยะยาวและสุขภาพ"
11. en: "A grounding day — perfect for organizing, planning, and setting foundations."
    th: "วันแห่งความมั่นคง — เหมาะสำหรับจัดระเบียบ วางแผน และวางรากฐาน"
12. en: "Your patience pays off today. Steady progress beats dramatic leaps."
    th: "ความอดทนให้ผลตอบแทนวันนี้ ความก้าวหน้าที่มั่นคงดีกว่าการก้าวกระโดด"

**high/air:**
13. en: "Mental clarity is sharp today. Solve problems that have been lingering."
    th: "ความคิดแจ่มใสวันนี้ แก้ปัญหาที่ค้างคาไว้"
14. en: "Communication flows effortlessly. Write, speak, connect — your words carry weight."
    th: "การสื่อสารไหลลื่น เขียน พูด เชื่อมต่อ — คำพูดของคุณมีน้ำหนัก"
15. en: "Ideas come rapidly today. Capture them before they fade."
    th: "ไอเดียมาเร็ววันนี้ จดไว้ก่อนที่จะเลือนหาย"
16. en: "A social day — networking and collaboration bring unexpected opportunities."
    th: "วันแห่งสังคม — การสร้างเครือข่ายและความร่วมมือนำโอกาสที่ไม่คาดคิด"

**medium/fire:**
17. en: "Moderate energy today. Pace yourself and save your fire for what matters most."
    th: "พลังงานปานกลางวันนี้ ค่อยๆ ทำและเก็บไฟไว้สำหรับสิ่งสำคัญที่สุด"
18. en: "A balanced day ahead. Small, consistent actions beat grand gestures."
    th: "วันที่สมดุลรออยู่ การกระทำเล็กๆ สม่ำเสมอดีกว่าการแสดงใหญ่"
19. en: "Guard your energy after 6pm. The morning is your window of power."
    th: "รักษาพลังงานหลัง 6 โมงเย็น ช่วงเช้าคือหน้าต่างแห่งพลัง"
20. en: "Mixed signals today — verify before you trust. Your instincts need a second opinion."
    th: "สัญญาณปนกันวันนี้ — ตรวจสอบก่อนเชื่อ สัญชาตญาณต้องการความเห็นที่สอง"

**medium/water:**
21. en: "Emotions may fluctuate. Stay centered and avoid reactive decisions."
    th: "อารมณ์อาจขึ้นลง อยู่ตรงกลางและหลีกเลี่ยงการตัดสินใจตามอารมณ์"
22. en: "A reflective day. Journal or meditate to find clarity beneath the surface."
    th: "วันแห่งการใคร่ครวญ เขียนบันทึกหรือนั่งสมาธิเพื่อค้นหาความชัดเจน"
23. en: "Water energy is gentle today. Go with the current, not against it."
    th: "พลังน้ำอ่อนโยนวันนี้ ไปตามกระแส อย่าฝืน"
24. en: "Sensitivity is heightened. Choose your company wisely today."
    th: "ความอ่อนไหวสูงขึ้น เลือกคนรอบข้างอย่างฉลาดวันนี้"

**medium/earth:**
25. en: "Steady as she goes. Nothing dramatic, but quiet progress is still progress."
    th: "เดินหน้าอย่างมั่นคง ไม่มีอะไรน่าตื่นเต้น แต่ความก้าวหน้าเงียบๆ ก็คือความก้าวหน้า"
26. en: "A maintenance day — tend to what you have before seeking something new."
    th: "วันซ่อมบำรุง — ดูแลสิ่งที่มีก่อนไปหาสิ่งใหม่"
27. en: "Routine serves you well today. Find comfort in the familiar."
    th: "กิจวัตรรับใช้คุณดีวันนี้ ค้นหาความสบายในสิ่งที่คุ้นเคย"
28. en: "Practical matters need attention. Handle the small things before they grow."
    th: "เรื่องปฏิบัติต้องการความสนใจ จัดการเรื่องเล็กๆ ก่อนที่จะโตขึ้น"

**medium/air:**
29. en: "Thoughts may scatter today. Write lists, set reminders, stay organized."
    th: "ความคิดอาจกระจัดกระจายวันนี้ เขียนรายการ ตั้งเตือน จัดระเบียบ"
30. en: "Communication needs extra care. Re-read messages before sending."
    th: "การสื่อสารต้องระมัดระวังเป็นพิเศษ อ่านข้อความซ้ำก่อนส่ง"
31. en: "A neutral day for air energy. Neither inspired nor blocked — just steady."
    th: "วันปกติสำหรับพลังลม ไม่ได้แรงบันดาลใจหรือติดขัด — แค่สม่ำเสมอ"
32. en: "Seek quiet spaces today. Too much noise disrupts your thinking."
    th: "หาพื้นที่เงียบวันนี้ เสียงรบกวนมากเกินไปทำให้ความคิดสับสน"

**low/fire:**
33. en: "Low fire energy today. Rest and recharge — tomorrow brings renewal."
    th: "พลังไฟต่ำวันนี้ พักผ่อนและเติมพลัง — พรุ่งนี้จะดีขึ้น"
34. en: "Not your day for confrontation. Retreat, plan, and prepare for a stronger tomorrow."
    th: "ไม่ใช่วันสำหรับการเผชิญหน้า ถอยกลับ วางแผน และเตรียมตัวสำหรับพรุ่งนี้ที่แข็งแกร่งกว่า"
35. en: "Energy dips in the afternoon. Schedule important tasks for morning only."
    th: "พลังงานตกในตอนบ่าย จัดงานสำคัญไว้ช่วงเช้าเท่านั้น"
36. en: "A cooling period. Your fire needs fuel — eat well, sleep early, reset."
    th: "ช่วงพักฟื้น ไฟของคุณต้องการเชื้อเพลิง — กินดี นอนเร็ว รีเซ็ต"

**low/water:**
37. en: "Emotional fog today. Avoid major decisions until clarity returns."
    th: "หมอกทางอารมณ์วันนี้ หลีกเลี่ยงการตัดสินใจใหญ่จนกว่าจะชัดเจน"
38. en: "Low tide energy. Withdraw inward and nurture yourself before giving to others."
    th: "พลังงานน้ำลง ถอยเข้าข้างในและดูแลตัวเองก่อนให้คนอื่น"
39. en: "Sensitivity is raw today. Protect your peace and say no when needed."
    th: "ความอ่อนไหวสูงวันนี้ ปกป้องความสงบและปฏิเสธเมื่อจำเป็น"
40. en: "A quiet day for reflection. Not every day needs action."
    th: "วันเงียบๆ สำหรับการใคร่ครวญ ไม่ใช่ทุกวันที่ต้องลงมือทำ"

**low/earth:**
41. en: "Foundations feel shaky today. Focus on self-care, not building."
    th: "รากฐานรู้สึกสั่นคลอนวันนี้ มุ่งเน้นการดูแลตัวเอง ไม่ใช่การสร้าง"
42. en: "Slow down. Your body is asking for rest, not productivity."
    th: "ช้าลง ร่างกายของคุณขอพักผ่อน ไม่ใช่ความมีประสิทธิผล"
43. en: "A day to simplify. Remove one unnecessary burden from your life."
    th: "วันที่จะทำให้ง่ายขึ้น เอาภาระที่ไม่จำเป็นออกจากชีวิตสักอย่าง"
44. en: "Grounding energy is scattered. Walk barefoot, touch nature, reconnect."
    th: "พลังสายดินกระจัดกระจาย เดินเท้าเปล่า สัมผัสธรรมชาติ เชื่อมต่อใหม่"

**low/air:**
45. en: "Mental fog rolls in. Postpone complex decisions if you can."
    th: "หมอกในความคิดเข้ามา เลื่อนการตัดสินใจซับซ้อนถ้าทำได้"
46. en: "Overthinking is the enemy today. Trust what you already know."
    th: "การคิดมากเกินไปคือศัตรูวันนี้ เชื่อในสิ่งที่คุณรู้อยู่แล้ว"
47. en: "Communication may be misread. Keep messages short and clear."
    th: "การสื่อสารอาจถูกเข้าใจผิด เขียนข้อความสั้นและชัดเจน"
48. en: "A day to listen rather than speak. Wisdom hides in silence."
    th: "วันที่ควรฟังมากกว่าพูด ปัญญาซ่อนอยู่ในความเงียบ"

The new structure:

```ts
type Element = 'fire' | 'water' | 'earth' | 'air';
type ScoreRange = 'low' | 'medium' | 'high';

interface BilingualText {
  en: string;
  th: string;
}

const TEMPLATES: Record<ScoreRange, Record<Element, BilingualText[]>> = {
  high: {
    fire: [
      { en: 'A powerful day for bold decisions. Your fire energy peaks in the morning — act before noon.', th: 'วันแห่งการตัดสินใจที่กล้าหาญ พลังไฟของคุณสูงสุดในตอนเช้า — ลงมือก่อนเที่ยง' },
      // ... all 4 entries
    ],
    // ... other elements
  },
  // ... other ranges
};
```

Update `selectInsight` to return `BilingualText`:

```ts
export function selectInsight(
  score: number,
  birthMonth: number,
  seedValue: number,
): BilingualText {
  const element = getElement(birthMonth);
  const range = getScoreRange(score);
  const pool = TEMPLATES[range][element];
  return pool[seedValue % pool.length];
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/kesar/projects/mordoo-app && npx tsc --noEmit --project tsconfig.json 2>&1 | head -20
```

Note: This will produce errors in files that consume `selectInsight` — that's expected and will be fixed in Task 3.

- [ ] **Step 3: Commit**

```bash
git add shared/insight-templates.ts
git commit -m "feat: add Thai translations to all 48 insight templates"
```

---

### Task 3: Update `compute-reading.ts` for bilingual output

**Files:**
- Modify: `shared/compute-reading.ts`
- Modify: `shared/types.ts`

- [ ] **Step 1: Update `shared/types.ts`**

Replace the existing types with:

```ts
export interface BirthDataInput {
  userId: string;
  dateOfBirth: string;   // ISO date YYYY-MM-DD
  fullName?: string;
  currentDate: string;   // ISO date YYYY-MM-DD (user's local "today")
}

// Internal bilingual type — used by computeReading() and cache storage
export interface DailyPulseReading {
  date: string;
  energyScore: number;
  insightEn: string;
  insightTh: string;
  luckyColor: { name: string; nameTh: string; hex: string };
  luckyNumber: number;
  luckyDirection: string;
  luckyDirectionTh: string;
  subScores: {
    business: number;
    heart: number;
    body: number;
  };
}

// API response type — monolingual, returned to app
export interface DailyPulseResponse {
  date: string;
  energyScore: number;
  insight: string;
  luckyColor: { name: string; hex: string };
  luckyNumber: number;
  luckyDirection: string;
  subScores: {
    business: number;
    heart: number;
    body: number;
  };
}
```

- [ ] **Step 2: Update `shared/compute-reading.ts`**

Change `LUCKY_COLORS` to include Thai names:

```ts
const LUCKY_COLORS = [
  { name: 'Gold', nameTh: 'ทอง', hex: '#c9a84c' },
  { name: 'Crimson', nameTh: 'แดงเข้ม', hex: '#dc2626' },
  { name: 'Sapphire', nameTh: 'ไพลิน', hex: '#2563eb' },
  { name: 'Emerald', nameTh: 'มรกต', hex: '#16a34a' },
  { name: 'Amethyst', nameTh: 'อเมทิสต์', hex: '#9333ea' },
  { name: 'Ivory', nameTh: 'งาช้าง', hex: '#fefce8' },
  { name: 'Coral', nameTh: 'ปะการัง', hex: '#fb7185' },
  { name: 'Jade', nameTh: 'หยก', hex: '#059669' },
  { name: 'Silver', nameTh: 'เงิน', hex: '#94a3b8' },
  { name: 'Amber', nameTh: 'อำพัน', hex: '#d97706' },
  { name: 'Rose', nameTh: 'กุหลาบ', hex: '#e11d48' },
  { name: 'Indigo', nameTh: 'คราม', hex: '#4f46e5' },
] as const;
```

Change `DIRECTIONS` to bilingual:

```ts
const DIRECTIONS = [
  { en: 'North', th: 'ทิศเหนือ' },
  { en: 'Northeast', th: 'ทิศตะวันออกเฉียงเหนือ' },
  { en: 'East', th: 'ทิศตะวันออก' },
  { en: 'Southeast', th: 'ทิศตะวันออกเฉียงใต้' },
  { en: 'South', th: 'ทิศใต้' },
  { en: 'Southwest', th: 'ทิศตะวันตกเฉียงใต้' },
  { en: 'West', th: 'ทิศตะวันตก' },
  { en: 'Northwest', th: 'ทิศตะวันตกเฉียงเหนือ' },
] as const;
```

Update the return type and `computeReading` function signature:

```ts
import type { BirthDataInput, DailyPulseReading } from './types';

export function computeReading(input: BirthDataInput): DailyPulseReading {
  // ... existing computation logic unchanged ...

  const luckyColor = {
    name: LUCKY_COLORS[colorIndex].name,
    nameTh: LUCKY_COLORS[colorIndex].nameTh,
    hex: LUCKY_COLORS[colorIndex].hex,
  };

  const direction = DIRECTIONS[dirIndex];
  const insight = selectInsight(energyScore, birthMonth, seededRandom(dailySeed, 7, 100));

  return {
    date: input.currentDate,
    energyScore,
    insightEn: insight.en,
    insightTh: insight.th,
    luckyColor,
    luckyNumber,
    luckyDirection: direction.en,
    luckyDirectionTh: direction.th,
    subScores: { business, heart, body },
  };
}
```

- [ ] **Step 3: Verify TypeScript compiles**

```bash
cd /Users/kesar/projects/mordoo-app && npx tsc --noEmit --project tsconfig.json 2>&1 | head -20
```

Note: Consumers of `DailyPulseResponse` (hook, service, pulse screen) should still compile since that type shape is unchanged. The `useDailyPulse` hook imports `DailyPulseResponse` which is unchanged. The API route imports `computeReading` which now returns `DailyPulseReading` — that will need updating in Task 5.

- [ ] **Step 4: Commit**

```bash
git add shared/types.ts shared/compute-reading.ts
git commit -m "feat: add bilingual support to compute-reading and types"
```

---

## Chunk 2: API Updates

### Task 4: Add localized response helper

**Files:**
- Create: `api/src/lib/localize.ts`

- [ ] **Step 1: Create the localization helper**

```ts
import type { DailyPulseReading, DailyPulseResponse } from '@shared/types';

type Lang = 'en' | 'th';

export function validateLang(lang: string | null): Lang {
  if (lang === 'th') return 'th';
  return 'en';
}

export function localizePulseReading(reading: DailyPulseReading, lang: Lang): DailyPulseResponse {
  return {
    date: reading.date,
    energyScore: reading.energyScore,
    insight: lang === 'th' ? reading.insightTh : reading.insightEn,
    luckyColor: {
      name: lang === 'th' ? reading.luckyColor.nameTh : reading.luckyColor.name,
      hex: reading.luckyColor.hex,
    },
    luckyNumber: reading.luckyNumber,
    luckyDirection: lang === 'th' ? reading.luckyDirectionTh : reading.luckyDirection,
    subScores: reading.subScores,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add api/src/lib/localize.ts
git commit -m "feat: add pulse reading localization helper"
```

---

### Task 5: Update Daily Pulse API route

**Files:**
- Modify: `api/src/app/api/pulse/daily/route.ts`

- [ ] **Step 1: Update the route to accept `lang`, store bilingual data, return localized response**

The full updated route:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, createAuthClient } from '../../../../lib/supabase';
import { computeReading } from '@shared/compute-reading';
import { validateLang, localizePulseReading } from '../../../../lib/localize';

export async function GET(request: NextRequest) {
  // 1. Extract and validate token
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing authorization' }, { status: 401 });
  }
  const token = authHeader.slice(7);

  // 2. Get user from token
  const authClient = createAuthClient(token);
  const { data: { user }, error: userError } = await authClient.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  // 3. Get date and lang parameters
  const date = request.nextUrl.searchParams.get('date');
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: 'Invalid date parameter' }, { status: 400 });
  }
  const lang = validateLang(request.nextUrl.searchParams.get('lang'));

  const serviceClient = createServiceClient();

  // 4. Check cache
  const { data: cached } = await serviceClient
    .from('daily_readings')
    .select('*')
    .eq('user_id', user.id)
    .eq('reading_date', date)
    .single();

  if (cached && cached.insight_en && cached.insight_th) {
    const reading = {
      date: cached.reading_date,
      energyScore: cached.energy_score,
      insightEn: cached.insight_en,
      insightTh: cached.insight_th,
      luckyColor: {
        name: cached.lucky_color_name,
        nameTh: cached.lucky_color_name_th,
        hex: cached.lucky_color_hex,
      },
      luckyNumber: cached.lucky_number,
      luckyDirection: cached.lucky_direction,
      luckyDirectionTh: cached.lucky_direction_th,
      subScores: {
        business: cached.sub_score_business,
        heart: cached.sub_score_heart,
        body: cached.sub_score_body,
      },
    };
    return NextResponse.json(localizePulseReading(reading, lang));
  }

  // 5. Delete stale cache row if it exists but lacks bilingual data
  if (cached) {
    await serviceClient
      .from('daily_readings')
      .delete()
      .eq('user_id', user.id)
      .eq('reading_date', date);
  }

  // 6. Fetch birth data
  const { data: birthData, error: birthError } = await serviceClient
    .from('birth_data')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (birthError || !birthData) {
    return NextResponse.json({ error: 'No birth data found' }, { status: 404 });
  }

  // 7. Compute reading
  const reading = computeReading({
    userId: user.id,
    dateOfBirth: birthData.date_of_birth,
    fullName: birthData.full_name ?? undefined,
    currentDate: date,
  });

  // 8. Cache result with both languages
  await serviceClient.from('daily_readings').insert({
    user_id: user.id,
    reading_date: date,
    energy_score: reading.energyScore,
    insight_en: reading.insightEn,
    insight_th: reading.insightTh,
    lucky_color_name: reading.luckyColor.name,
    lucky_color_name_th: reading.luckyColor.nameTh,
    lucky_color_hex: reading.luckyColor.hex,
    lucky_number: reading.luckyNumber,
    lucky_direction: reading.luckyDirection,
    lucky_direction_th: reading.luckyDirectionTh,
    sub_score_business: reading.subScores.business,
    sub_score_heart: reading.subScores.heart,
    sub_score_body: reading.subScores.body,
  });

  // 9. Return localized response
  return NextResponse.json(localizePulseReading(reading, lang));
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/kesar/projects/mordoo-app && npx tsc --noEmit --project api/tsconfig.json 2>&1 | head -20
```

**Note:** This route writes to `insight_en`, `insight_th`, `lucky_color_name_th`, `lucky_direction_th` columns. Task 8's migration SQL must be applied to the database before testing this route at runtime.

- [ ] **Step 3: Commit**

```bash
git add api/src/app/api/pulse/daily/route.ts
git commit -m "feat: add lang param and bilingual caching to pulse API"
```

---

### Task 6: Create Siam Si API endpoint

**Files:**
- Create: `api/src/app/api/oracle/siam-si/route.ts`

- [ ] **Step 1: Create the Siam Si API route**

```ts
import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient, createAuthClient } from '../../../../lib/supabase';
import { drawSiamSi } from '@shared/siam-si';

export async function POST(request: NextRequest) {
  // 1. Validate auth
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing authorization' }, { status: 401 });
  }
  const token = authHeader.slice(7);

  const authClient = createAuthClient(token);
  const { data: { user }, error: userError } = await authClient.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const serviceClient = createServiceClient();

  // 2. Get user tier
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('tier')
    .eq('id', user.id)
    .single();

  const tier = profile?.tier || 'free';
  const maxDraws = tier === 'standard' ? Infinity : 5;

  // 3. Get/create quota record
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const { data: quota } = await serviceClient
    .from('user_quotas')
    .select('*')
    .eq('user_id', user.id)
    .single();

  let drawsThisMonth = 0;

  if (quota) {
    // Reset if month changed
    if (quota.siam_si_last_reset !== currentMonth) {
      drawsThisMonth = 0;
    } else {
      drawsThisMonth = quota.siam_si_draws_this_month || 0;
    }
  }

  // 4. Check quota
  if (maxDraws !== Infinity && drawsThisMonth >= maxDraws) {
    return NextResponse.json(
      { error: 'QUOTA_EXCEEDED', drawsTotal: maxDraws, drawsRemaining: 0 },
      { status: 429 },
    );
  }

  // 5. Perform draw using server-side draw index
  const yearMonth = currentMonth;
  const stick = drawSiamSi(user.id, yearMonth, drawsThisMonth);

  // 6. Increment quota
  const newDrawCount = drawsThisMonth + 1;
  if (quota) {
    await serviceClient.from('user_quotas').update({
      siam_si_draws_this_month: newDrawCount,
      siam_si_last_reset: currentMonth,
      updated_at: new Date().toISOString(),
    }).eq('user_id', user.id);
  } else {
    await serviceClient.from('user_quotas').insert({
      user_id: user.id,
      siam_si_draws_this_month: newDrawCount,
      siam_si_last_reset: currentMonth,
    });
  }

  // 7. Return stick with quota info
  const drawsTotal = maxDraws === Infinity ? null : maxDraws;
  const drawsRemaining = maxDraws === Infinity ? null : maxDraws - newDrawCount;

  return NextResponse.json({
    number: stick.number,
    fortune: stick.fortune,
    titleEn: stick.titleEn,
    titleTh: stick.titleTh,
    meaningEn: stick.meaningEn,
    meaningTh: stick.meaningTh,
    drawsUsed: newDrawCount,
    drawsTotal,
    drawsRemaining,
  });
}
```

- [ ] **Step 2: Verify the import path resolves**

Check that `@shared/siam-si` is configured in the API's tsconfig. Look at existing imports in `api/src/app/api/pulse/daily/route.ts` which already uses `@shared/compute-reading`.

- [ ] **Step 3: Commit**

```bash
git add api/src/app/api/oracle/siam-si/route.ts
git commit -m "feat: add Siam Si API endpoint with server-side quota"
```

---

### Task 7: Update Oracle Chat API for `lang` param

**Files:**
- Modify: `api/src/app/api/oracle/chat/route.ts`

- [ ] **Step 1: Extract `lang` from request body and use it in system prompt**

In the body parsing section (around line 108), add `lang` extraction:

```ts
const { message, birthData, lang: rawLang } = body as {
  message: string;
  birthData?: { dateOfBirth: string; fullName?: string; concerns: string[] };
  lang?: string;
};
```

Update `buildSystemPrompt` to accept a `lang` parameter:

```ts
function buildSystemPrompt(birthData?: {
  dateOfBirth: string;
  fullName?: string;
  concerns: string[];
}, lang?: string) {
```

Replace the last line of the system prompt (line 47) from:

```
Respond in the same language the seeker uses. If they write in Thai, respond in Thai. If English, respond in English.
```

to:

```
${lang === 'th'
  ? 'ตอบเป็นภาษาไทยเสมอ ใช้ภาษาที่สุภาพและเข้าใจง่าย'
  : 'Always respond in English. Use clear, accessible language.'}
```

Update the call site (around line 193):

```ts
const systemPrompt = buildSystemPrompt(birthData ?? undefined, rawLang ?? undefined);
```

- [ ] **Step 2: Commit**

```bash
git add api/src/app/api/oracle/chat/route.ts
git commit -m "feat: add lang param to oracle chat API"
```

---

## Chunk 3: Database Migration

### Task 8: Create Supabase migration for bilingual columns

**Files:**
- Create: `supabase/migrations/YYYYMMDDHHMMSS_add_bilingual_columns.sql` (use actual timestamp)

- [ ] **Step 1: Create migration SQL**

```sql
-- Add bilingual columns to daily_readings
ALTER TABLE daily_readings ADD COLUMN IF NOT EXISTS insight_en text;
ALTER TABLE daily_readings ADD COLUMN IF NOT EXISTS insight_th text;
ALTER TABLE daily_readings ADD COLUMN IF NOT EXISTS lucky_color_name_th text;
ALTER TABLE daily_readings ADD COLUMN IF NOT EXISTS lucky_direction_th text;

-- Backfill insight_en from existing insight column
UPDATE daily_readings SET insight_en = insight WHERE insight_en IS NULL AND insight IS NOT NULL;

-- Drop old insight column
ALTER TABLE daily_readings DROP COLUMN IF EXISTS insight;

-- Add Siam Si quota columns to user_quotas
ALTER TABLE user_quotas ADD COLUMN IF NOT EXISTS siam_si_draws_this_month integer DEFAULT 0;
ALTER TABLE user_quotas ADD COLUMN IF NOT EXISTS siam_si_last_reset text;
```

- [ ] **Step 2: Check if `supabase/migrations` directory exists**

```bash
ls /Users/kesar/projects/mordoo-app/supabase/migrations/ 2>/dev/null || echo "Directory does not exist"
```

If it doesn't exist, create the migration file in a location that makes sense for the project (e.g., `sql/migrations/` or just `migrations/`). The important thing is the SQL content — the user can apply it via Supabase dashboard or CLI.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/ || git add migrations/
git commit -m "feat: add bilingual columns and siam si quota migration"
```

---

## Chunk 4: App-Side Changes

### Task 9: Update pulse service to send `lang`

**Files:**
- Modify: `src/services/pulse.ts`

- [ ] **Step 1: Add `lang` parameter to `fetchDailyPulse`**

```ts
import { supabase } from '@/src/lib/supabase';
import type { DailyPulseResponse } from '@shared/types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;

export async function fetchDailyPulse(lang: 'en' | 'th' = 'en'): Promise<DailyPulseResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const response = await fetch(
    `${API_BASE_URL}/api/pulse/daily?date=${today}&lang=${lang}`,
    { headers: { Authorization: `Bearer ${session.access_token}` } },
  );

  if (!response.ok) {
    throw new Error(`Pulse API error: ${response.status}`);
  }

  return response.json();
}
```

- [ ] **Step 2: Commit**

```bash
git add src/services/pulse.ts
git commit -m "feat: add lang param to pulse service"
```

---

### Task 10: Add Siam Si service function

**Files:**
- Modify: `src/services/oracle.ts`

- [ ] **Step 1: Add `fetchSiamSiDraw` and `lang` to `sendOracleMessage`**

Add at the end of `src/services/oracle.ts`:

```ts
export interface SiamSiDrawResponse {
  number: number;
  fortune: 'excellent' | 'good' | 'fair' | 'caution';
  titleEn: string;
  titleTh: string;
  meaningEn: string;
  meaningTh: string;
  drawsUsed: number;
  drawsTotal: number | null;
  drawsRemaining: number | null;
}

export async function fetchSiamSiDraw(): Promise<SiamSiDrawResponse> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE_URL}/api/oracle/siam-si`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('QUOTA_EXCEEDED');
    }
    throw new Error(`Siam Si API error: ${response.status}`);
  }

  return response.json();
}
```

Also update `sendOracleMessage` params to include `lang`:

In the `SendMessageParams` interface, add:

```ts
lang?: 'en' | 'th';
```

In the `sendOracleMessage` function body, update the JSON.stringify call:

```ts
body: JSON.stringify({ message, birthData, lang }),
```

And destructure `lang` from params:

```ts
const { message, birthData, lang, onChunk, onDone, onError } = params;
```

- [ ] **Step 2: Commit**

```bash
git add src/services/oracle.ts
git commit -m "feat: add siam si service and lang param to oracle service"
```

---

### Task 11: Simplify `useDailyPulse` hook — remove local fallback

**Files:**
- Modify: `src/hooks/useDailyPulse.ts`

- [ ] **Step 1: Rewrite the hook to always use API**

```ts
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/src/stores/authStore';
import { useSettingsStore } from '@/src/stores/settingsStore';
import { fetchDailyPulse } from '@/src/services/pulse';
import type { DailyPulseResponse } from '@shared/types';

function getLocalToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function useDailyPulse() {
  const userId = useAuthStore((s) => s.userId);
  const lang = useSettingsStore((s) => s.language);
  const today = getLocalToday();

  return useQuery<DailyPulseResponse>({
    queryKey: ['dailyPulse', userId, today, lang],
    queryFn: () => fetchDailyPulse(lang),
    staleTime: 30 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 2,
    enabled: !!userId,
  });
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/kesar/projects/mordoo-app && npx tsc --noEmit --project tsconfig.json 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useDailyPulse.ts
git commit -m "refactor: remove local computation fallback from useDailyPulse"
```

---

### Task 12: Refactor `useSiamSi` hook to use API

**Files:**
- Modify: `src/hooks/useSiamSi.ts`

- [ ] **Step 1: Rewrite the hook to call API**

```ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';
import { fetchSiamSiDraw, type SiamSiDrawResponse } from '@/src/services/oracle';

const SHAKE_THRESHOLD = 1.8;
const SHAKE_DURATION_MS = 300;
const COOLDOWN_MS = 2000;

export function useSiamSi() {
  const [isShaking, setIsShaking] = useState(false);
  const [currentStick, setCurrentStick] = useState<SiamSiDrawResponse | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawsRemaining, setDrawsRemaining] = useState<number | null>(null);
  const [drawsTotal, setDrawsTotal] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const shakeStartRef = useRef<number | null>(null);
  const cooldownRef = useRef(false);

  const canDraw = drawsRemaining === null || drawsRemaining > 0;

  const performDraw = useCallback(async () => {
    if (!canDraw || cooldownRef.current || isDrawing) return;

    cooldownRef.current = true;
    setIsDrawing(true);
    setIsRevealing(true);
    setError(null);

    try {
      const result = await fetchSiamSiDraw();
      setCurrentStick(result);
      setDrawsRemaining(result.drawsRemaining);
      setDrawsTotal(result.drawsTotal);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Draw failed';
      setError(message);
      if (message === 'QUOTA_EXCEEDED') {
        setDrawsRemaining(0);
      }
    } finally {
      setIsDrawing(false);
      setTimeout(() => {
        cooldownRef.current = false;
        setIsRevealing(false);
      }, COOLDOWN_MS);
    }
  }, [canDraw, isDrawing]);

  useEffect(() => {
    const subscription = Accelerometer.addListener((data) => {
      const magnitude = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);

      if (magnitude > SHAKE_THRESHOLD) {
        if (!shakeStartRef.current) {
          shakeStartRef.current = Date.now();
          setIsShaking(true);
        } else if (Date.now() - shakeStartRef.current > SHAKE_DURATION_MS) {
          shakeStartRef.current = null;
          setIsShaking(false);
          performDraw();
        }
      } else {
        shakeStartRef.current = null;
        setIsShaking(false);
      }
    });

    Accelerometer.setUpdateInterval(100);

    return () => subscription.remove();
  }, [performDraw]);

  return {
    isShaking,
    currentStick,
    isRevealing,
    isDrawing,
    drawsRemaining,
    drawsTotal,
    canDraw,
    error,
    performDraw,
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useSiamSi.ts
git commit -m "refactor: useSiamSi now calls API instead of local draw"
```

---

### Task 13: Update Siam Si screen for new hook API

**Files:**
- Modify: `app/(main)/oracle/siam-si.tsx`

- [ ] **Step 1: Update the screen component**

Key changes:
- Remove `useAuthStore` import (no longer needed for tier check)
- `useSiamSi()` no longer takes `maxDraws` param
- `currentStick` now has `SiamSiDrawResponse` type instead of `SiamSiStick`
- Update quota badge to use `drawsRemaining` / `drawsTotal` from hook
- Remove `TIER_LIMITS` constant

Replace the component setup (lines 37-48):

```ts
const {
  isShaking,
  currentStick,
  isRevealing,
  isDrawing,
  drawsRemaining,
  drawsTotal,
  canDraw,
  error,
  performDraw,
} = useSiamSi();
```

Remove the `useAuthStore` import and `TIER_LIMITS`.

Update the quota badge text (line 108):

```ts
<Text style={styles.quotaText}>
  {drawsRemaining === null ? '∞' : drawsRemaining} left
</Text>
```

The result card still accesses `currentStick.titleEn`, `currentStick.titleTh`, `currentStick.meaningEn`, `currentStick.meaningTh`, `currentStick.number`, `currentStick.fortune` — these fields match the `SiamSiDrawResponse` type, so no changes needed there.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/kesar/projects/mordoo-app && npx tsc --noEmit --project tsconfig.json 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add app/\(main\)/oracle/siam-si.tsx
git commit -m "refactor: siam si screen uses API-backed hook"
```

---

### Task 14: Clean up `oracleStore` — remove quota tracking

**Files:**
- Modify: `src/stores/oracleStore.ts`

- [ ] **Step 1: Remove all quota-related state and methods**

Remove from interface and implementation:
- `oracleQuestionsToday`
- `oracleLastReset`
- `siamSiThisMonth`
- `siamSiLastReset`
- `incrementOracleQuota()`
- `incrementSiamSiQuota()`
- `checkAndResetQuotas()`
- Helper functions `getToday()` and `getCurrentYearMonth()`

Remove from `partialize`:
- `oracleQuestionsToday`
- `oracleLastReset`
- `siamSiThisMonth`
- `siamSiLastReset`

The store keeps: `messages`, `isStreaming`, `addMessage`, `appendToLastMessage`, `setStreaming`, `clearConversation`.

Updated store:

```ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '@/src/utils/zustand-mmkv';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface OracleState {
  messages: ChatMessage[];
  isStreaming: boolean;

  addMessage: (msg: ChatMessage) => void;
  appendToLastMessage: (chunk: string) => void;
  setStreaming: (streaming: boolean) => void;
  clearConversation: () => void;
}

export const useOracleStore = create<OracleState>()(
  persist(
    (set) => ({
      messages: [],
      isStreaming: false,

      addMessage: (msg) => set((state) => ({
        messages: [...state.messages, msg],
      })),

      appendToLastMessage: (chunk) => set((state) => {
        const messages = [...state.messages];
        if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
          messages[messages.length - 1] = {
            ...messages[messages.length - 1],
            content: messages[messages.length - 1].content + chunk,
          };
        }
        return { messages };
      }),

      setStreaming: (streaming) => set({ isStreaming: streaming }),

      clearConversation: () => set({ messages: [] }),
    }),
    {
      name: 'mordoo-oracle',
      storage: createJSONStorage(() => mmkvStorage),
      partialize: (state) => ({
        messages: state.messages,
      }),
    },
  ),
);
```

- [ ] **Step 2: Search for any remaining references to removed fields**

```bash
cd /Users/kesar/projects/mordoo-app && grep -rn "incrementOracleQuota\|incrementSiamSiQuota\|checkAndResetQuotas\|oracleQuestionsToday\|siamSiThisMonth\|oracleLastReset\|siamSiLastReset" --include="*.ts" --include="*.tsx" src/ app/
```

Fix any remaining references found. The oracle chat screen (`app/(main)/oracle/index.tsx`) may reference `incrementOracleQuota` — remove that call since the server handles quota.

- [ ] **Step 3: Commit**

```bash
git add src/stores/oracleStore.ts
git commit -m "refactor: remove client-side quota tracking from oracleStore"
```

---

### Task 15: Remove guest auth mode

**Files:**
- Modify: `src/stores/authStore.ts`
- Modify: `app/(onboarding)/soul-snapshot.tsx`

- [ ] **Step 1: Update `authStore.ts`**

Remove `setGuestAuth` method and change `authMode` type:

```ts
interface AuthState {
  isAuthenticated: boolean;
  authMode: 'account' | null;
  userId: string | null;
  supabaseUserId: string | null;
  token: string | null;

  setSupabaseSession: (session: Session) => void;
  logout: () => void;
}
```

Remove the entire `setGuestAuth` method from the store implementation.

- [ ] **Step 2: Update `soul-snapshot.tsx`**

Remove the `setGuestAuth` import and usage. Update `handleEnterRealms`:

```ts
const handleEnterRealms = () => {
  completeOnboarding();
  if (authMode === 'account' && birthData) {
    syncBirthData({ birthData, nameData, concerns, urgencyContext }).catch((err) => {
      console.warn('Failed to sync birth data:', err);
    });
  }
  router.replace('/(main)/pulse');
};
```

Remove `const setGuestAuth = useAuthStore((s) => s.setGuestAuth);`

- [ ] **Step 3: Search for any remaining `setGuestAuth` or `'guest'` references in app code**

```bash
cd /Users/kesar/projects/mordoo-app && grep -rn "setGuestAuth\|authMode.*guest\|=== 'guest'" --include="*.ts" --include="*.tsx" src/ app/
```

Fix any remaining references.

- [ ] **Step 4: Commit**

```bash
git add src/stores/authStore.ts app/\(onboarding\)/soul-snapshot.tsx
git commit -m "refactor: remove guest auth mode — sign-in required"
```

---

### Task 16: Update Oracle chat screen — add `lang`, remove quota tracking

**Files:**
- Modify: `app/(main)/oracle/index.tsx`

- [ ] **Step 1: Add `lang` and remove quota references**

1. Add import:
   ```ts
   import { useSettingsStore } from '@/src/stores/settingsStore';
   ```

2. In the component body, add:
   ```ts
   const lang = useSettingsStore((s) => s.language);
   ```

3. Remove these lines (they reference removed store fields):
   - Line 184: `const incrementOracleQuota = useOracleStore((s) => s.incrementOracleQuota);`
   - Line 185: `const checkAndResetQuotas = useOracleStore((s) => s.checkAndResetQuotas);`
   - Lines 191-194: the entire `useEffect` that calls `checkAndResetQuotas()`
   - Line 253: `incrementOracleQuota();` inside the `onDone` callback
   - Line 277: `incrementOracleQuota,` from the `useCallback` dependency array

4. Add `lang` to the `sendOracleMessage` call (around line 244):
   ```ts
   sendOracleMessage({
     message: text,
     birthData: birthPayload,
     lang,
     onChunk: (chunk) => { ... },
     onDone: () => { ... },
     onError: (error) => { ... },
   });
   ```
   Add `lang` to the `useCallback` dependency array.

5. Simplify the guest check (line 220). Since guest mode is removed, replace:
   ```ts
   if (authMode !== 'account') {
   ```
   with a userId check, or remove entirely since sign-in is now required. If keeping a guard:
   ```ts
   const userId = useAuthStore((s) => s.userId);
   // ...
   if (!userId) {
     sendingRef.current = false;
     router.push('/(onboarding)/soul-gate');
     return;
   }
   ```
   Remove the `authMode` selector and `useAuthStore` import if no longer needed.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/kesar/projects/mordoo-app && npx tsc --noEmit --project tsconfig.json 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add app/\(main\)/oracle/index.tsx
git commit -m "feat: send lang param in oracle chat, remove client quota tracking"
```

---

## Chunk 5: Final Verification

### Task 17: Full TypeScript compilation check

- [ ] **Step 1: Run TypeScript check for the app**

```bash
cd /Users/kesar/projects/mordoo-app && npx tsc --noEmit --project tsconfig.json 2>&1 | head -40
```

Fix any remaining type errors.

- [ ] **Step 2: Run TypeScript check for the API**

```bash
cd /Users/kesar/projects/mordoo-app && npx tsc --noEmit --project api/tsconfig.json 2>&1 | head -40
```

Fix any remaining type errors.

- [ ] **Step 3: Verify the app starts**

```bash
cd /Users/kesar/projects/mordoo-app && npx expo start --no-dev 2>&1 | head -20
```

- [ ] **Step 4: Final commit if any fixes were needed**

```bash
git add -A && git commit -m "fix: resolve remaining type errors from api-first migration"
```
