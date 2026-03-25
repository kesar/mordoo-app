import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '../../../../lib/supabase';
import { authenticateRequest } from '../../../../lib/auth';
import { validateLang } from '../../../../lib/localize';
import { getWesternZodiacSign, getChineseZodiacAnimal, getChineseElement } from '@shared/zodiac';

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
