type Element = 'fire' | 'water' | 'earth' | 'air';
type ScoreRange = 'low' | 'medium' | 'high';

export interface BilingualText {
  en: string;
  th: string;
}

const TEMPLATES: Record<ScoreRange, Record<Element, BilingualText[]>> = {
  high: {
    fire: [
      { en: 'A powerful day for bold decisions. Your fire energy peaks in the morning — act before noon.', th: 'วันแห่งการตัดสินใจที่กล้าหาญ พลังไฟของคุณสูงสุดในตอนเช้า — ลงมือก่อนเที่ยง' },
      { en: 'Creative sparks fly today. Channel your intensity into one focused project.', th: 'ประกายความคิดสร้างสรรค์วันนี้ มุ่งพลังทั้งหมดไปที่โปรเจกต์เดียว' },
      { en: 'Your confidence radiates today. Others notice — use this for negotiations.', th: 'ความมั่นใจของคุณเปล่งประกายวันนี้ คนรอบข้างสังเกตเห็น — ใช้โอกาสนี้เจรจา' },
      { en: 'A strong day for leadership. Trust your instincts and move decisively.', th: 'วันที่เหมาะกับการเป็นผู้นำ เชื่อสัญชาตญาณและเดินหน้าอย่างเด็ดขาด' },
    ],
    water: [
      { en: 'Intuition runs deep today. Trust your gut on financial matters.', th: 'สัญชาตญาณแรงกล้าวันนี้ เชื่อใจตัวเองในเรื่องการเงิน' },
      { en: 'Emotional clarity arrives. A good day to mend relationships or start new ones.', th: 'ความชัดเจนทางอารมณ์มาถึง วันดีที่จะซ่อมแซมความสัมพันธ์หรือเริ่มต้นใหม่' },
      { en: 'Your empathy is your superpower today. Listen more than you speak.', th: 'ความเห็นอกเห็นใจคือพลังพิเศษวันนี้ ฟังมากกว่าพูด' },
      { en: 'Flow with changes today — resistance creates friction, acceptance creates power.', th: 'ไหลไปกับความเปลี่ยนแปลงวันนี้ — การต่อต้านสร้างแรงเสียดทาน การยอมรับสร้างพลัง' },
    ],
    earth: [
      { en: 'Stability is your strength today. Build something that lasts.', th: 'ความมั่นคงคือจุดแข็งวันนี้ สร้างสิ่งที่ยั่งยืน' },
      { en: 'Practical wisdom guides you. Focus on long-term investments and health.', th: 'ปัญญาเชิงปฏิบัตินำทางคุณ มุ่งเน้นการลงทุนระยะยาวและสุขภาพ' },
      { en: 'A grounding day — perfect for organizing, planning, and setting foundations.', th: 'วันแห่งความมั่นคง — เหมาะสำหรับจัดระเบียบ วางแผน และวางรากฐาน' },
      { en: 'Your patience pays off today. Steady progress beats dramatic leaps.', th: 'ความอดทนให้ผลตอบแทนวันนี้ ความก้าวหน้าที่มั่นคงดีกว่าการก้าวกระโดด' },
    ],
    air: [
      { en: 'Mental clarity is sharp today. Solve problems that have been lingering.', th: 'ความคิดแจ่มใสวันนี้ แก้ปัญหาที่ค้างคาไว้' },
      { en: 'Communication flows effortlessly. Write, speak, connect — your words carry weight.', th: 'การสื่อสารไหลลื่น เขียน พูด เชื่อมต่อ — คำพูดของคุณมีน้ำหนัก' },
      { en: 'Ideas come rapidly today. Capture them before they fade.', th: 'ไอเดียมาเร็ววันนี้ จดไว้ก่อนที่จะเลือนหาย' },
      { en: 'A social day — networking and collaboration bring unexpected opportunities.', th: 'วันแห่งสังคม — การสร้างเครือข่ายและความร่วมมือนำโอกาสที่ไม่คาดคิด' },
    ],
  },
  medium: {
    fire: [
      { en: 'Moderate energy today. Pace yourself and save your fire for what matters most.', th: 'พลังงานปานกลางวันนี้ ค่อยๆ ทำและเก็บไฟไว้สำหรับสิ่งสำคัญที่สุด' },
      { en: 'A balanced day ahead. Small, consistent actions beat grand gestures.', th: 'วันที่สมดุลรออยู่ การกระทำเล็กๆ สม่ำเสมอดีกว่าการแสดงใหญ่' },
      { en: 'Guard your energy after 6pm. The morning is your window of power.', th: 'รักษาพลังงานหลัง 6 โมงเย็น ช่วงเช้าคือหน้าต่างแห่งพลัง' },
      { en: 'Mixed signals today — verify before you trust. Your instincts need a second opinion.', th: 'สัญญาณปนกันวันนี้ — ตรวจสอบก่อนเชื่อ สัญชาตญาณต้องการความเห็นที่สอง' },
    ],
    water: [
      { en: 'Emotions may fluctuate. Stay centered and avoid reactive decisions.', th: 'อารมณ์อาจขึ้นลง อยู่ตรงกลางและหลีกเลี่ยงการตัดสินใจตามอารมณ์' },
      { en: 'A reflective day. Journal or meditate to find clarity beneath the surface.', th: 'วันแห่งการใคร่ครวญ เขียนบันทึกหรือนั่งสมาธิเพื่อค้นหาความชัดเจน' },
      { en: 'Water energy is gentle today. Go with the current, not against it.', th: 'พลังน้ำอ่อนโยนวันนี้ ไปตามกระแส อย่าฝืน' },
      { en: 'Sensitivity is heightened. Choose your company wisely today.', th: 'ความอ่อนไหวสูงขึ้น เลือกคนรอบข้างอย่างฉลาดวันนี้' },
    ],
    earth: [
      { en: 'Steady as she goes. Nothing dramatic, but quiet progress is still progress.', th: 'เดินหน้าอย่างมั่นคง ไม่มีอะไรน่าตื่นเต้น แต่ความก้าวหน้าเงียบๆ ก็คือความก้าวหน้า' },
      { en: 'A maintenance day — tend to what you have before seeking something new.', th: 'วันซ่อมบำรุง — ดูแลสิ่งที่มีก่อนไปหาสิ่งใหม่' },
      { en: 'Routine serves you well today. Find comfort in the familiar.', th: 'กิจวัตรรับใช้คุณดีวันนี้ ค้นหาความสบายในสิ่งที่คุ้นเคย' },
      { en: 'Practical matters need attention. Handle the small things before they grow.', th: 'เรื่องปฏิบัติต้องการความสนใจ จัดการเรื่องเล็กๆ ก่อนที่จะโตขึ้น' },
    ],
    air: [
      { en: 'Thoughts may scatter today. Write lists, set reminders, stay organized.', th: 'ความคิดอาจกระจัดกระจายวันนี้ เขียนรายการ ตั้งเตือน จัดระเบียบ' },
      { en: 'Communication needs extra care. Re-read messages before sending.', th: 'การสื่อสารต้องระมัดระวังเป็นพิเศษ อ่านข้อความซ้ำก่อนส่ง' },
      { en: 'A neutral day for air energy. Neither inspired nor blocked — just steady.', th: 'วันปกติสำหรับพลังลม ไม่ได้แรงบันดาลใจหรือติดขัด — แค่สม่ำเสมอ' },
      { en: 'Seek quiet spaces today. Too much noise disrupts your thinking.', th: 'หาพื้นที่เงียบวันนี้ เสียงรบกวนมากเกินไปทำให้ความคิดสับสน' },
    ],
  },
  low: {
    fire: [
      { en: 'Low fire energy today. Rest and recharge — tomorrow brings renewal.', th: 'พลังไฟต่ำวันนี้ พักผ่อนและเติมพลัง — พรุ่งนี้จะดีขึ้น' },
      { en: 'Not your day for confrontation. Retreat, plan, and prepare for a stronger tomorrow.', th: 'ไม่ใช่วันสำหรับการเผชิญหน้า ถอยกลับ วางแผน และเตรียมตัวสำหรับพรุ่งนี้ที่แข็งแกร่งกว่า' },
      { en: 'Energy dips in the afternoon. Schedule important tasks for morning only.', th: 'พลังงานตกในตอนบ่าย จัดงานสำคัญไว้ช่วงเช้าเท่านั้น' },
      { en: 'A cooling period. Your fire needs fuel — eat well, sleep early, reset.', th: 'ช่วงพักฟื้น ไฟของคุณต้องการเชื้อเพลิง — กินดี นอนเร็ว รีเซ็ต' },
    ],
    water: [
      { en: 'Emotional fog today. Avoid major decisions until clarity returns.', th: 'หมอกทางอารมณ์วันนี้ หลีกเลี่ยงการตัดสินใจใหญ่จนกว่าจะชัดเจน' },
      { en: 'Low tide energy. Withdraw inward and nurture yourself before giving to others.', th: 'พลังงานน้ำลง ถอยเข้าข้างในและดูแลตัวเองก่อนให้คนอื่น' },
      { en: 'Sensitivity is raw today. Protect your peace and say no when needed.', th: 'ความอ่อนไหวสูงวันนี้ ปกป้องความสงบและปฏิเสธเมื่อจำเป็น' },
      { en: 'A quiet day for reflection. Not every day needs action.', th: 'วันเงียบๆ สำหรับการใคร่ครวญ ไม่ใช่ทุกวันที่ต้องลงมือทำ' },
    ],
    earth: [
      { en: 'Foundations feel shaky today. Focus on self-care, not building.', th: 'รากฐานรู้สึกสั่นคลอนวันนี้ มุ่งเน้นการดูแลตัวเอง ไม่ใช่การสร้าง' },
      { en: 'Slow down. Your body is asking for rest, not productivity.', th: 'ช้าลง ร่างกายของคุณขอพักผ่อน ไม่ใช่ความมีประสิทธิผล' },
      { en: 'A day to simplify. Remove one unnecessary burden from your life.', th: 'วันที่จะทำให้ง่ายขึ้น เอาภาระที่ไม่จำเป็นออกจากชีวิตสักอย่าง' },
      { en: 'Grounding energy is scattered. Walk barefoot, touch nature, reconnect.', th: 'พลังสายดินกระจัดกระจาย เดินเท้าเปล่า สัมผัสธรรมชาติ เชื่อมต่อใหม่' },
    ],
    air: [
      { en: 'Mental fog rolls in. Postpone complex decisions if you can.', th: 'หมอกในความคิดเข้ามา เลื่อนการตัดสินใจซับซ้อนถ้าทำได้' },
      { en: 'Overthinking is the enemy today. Trust what you already know.', th: 'การคิดมากเกินไปคือศัตรูวันนี้ เชื่อในสิ่งที่คุณรู้อยู่แล้ว' },
      { en: 'Communication may be misread. Keep messages short and clear.', th: 'การสื่อสารอาจถูกเข้าใจผิด เขียนข้อความสั้นและชัดเจน' },
      { en: 'A day to listen rather than speak. Wisdom hides in silence.', th: 'วันที่ควรฟังมากกว่าพูด ปัญญาซ่อนอยู่ในความเงียบ' },
    ],
  },
};

export function getElement(birthMonth: number): Element {
  if (birthMonth >= 1 && birthMonth <= 3) return 'water';
  if (birthMonth >= 4 && birthMonth <= 6) return 'fire';
  if (birthMonth >= 7 && birthMonth <= 9) return 'earth';
  return 'air';
}

export function getScoreRange(score: number): ScoreRange {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

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
