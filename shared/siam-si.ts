export interface SiamSiStick {
  number: number;
  fortune: 'excellent' | 'good' | 'fair' | 'caution';
  titleEn: string;
  titleTh: string;
  meaningEn: string;
  meaningTh: string;
}

export const SIAM_SI_STICKS: SiamSiStick[] = [
  { number: 1, fortune: 'excellent', titleEn: 'Rising Dragon', titleTh: 'มังกรทะยาน', meaningEn: 'Great fortune ahead. Your efforts will be rewarded beyond expectation. Act boldly.', meaningTh: 'โชคดีมาก ความพยายามจะได้รับผลตอบแทนเกินคาด ทำอะไรให้กล้าหาญ' },
  { number: 2, fortune: 'good', titleEn: 'Gentle Breeze', titleTh: 'สายลมอ่อน', meaningEn: 'Steady progress comes naturally. Do not force matters — patience reveals the path.', meaningTh: 'ความก้าวหน้ามาอย่างเป็นธรรมชาติ อย่าเร่งรีบ ความอดทนจะชี้ทาง' },
  { number: 3, fortune: 'fair', titleEn: 'Still Water', titleTh: 'น้ำนิ่ง', meaningEn: 'A period of calm. Neither great fortune nor misfortune. Use this time to prepare.', meaningTh: 'ช่วงเวลาแห่งความสงบ ไม่มีโชคดีหรือร้าย ใช้เวลานี้เตรียมตัว' },
  { number: 4, fortune: 'caution', titleEn: 'Hidden Thorn', titleTh: 'หนามแฝง', meaningEn: 'Be careful in dealings with others. Not everyone shares your intentions. Verify before trusting.', meaningTh: 'ระวังในการติดต่อกับผู้อื่น ไม่ใช่ทุกคนจะมีเจตนาดี ตรวจสอบก่อนไว้วางใจ' },
  { number: 5, fortune: 'excellent', titleEn: 'Golden Lotus', titleTh: 'บัวทอง', meaningEn: 'Spiritual and material abundance align. A rare moment of complete harmony approaches.', meaningTh: 'ความอุดมสมบูรณ์ทางจิตใจและวัตถุมาบรรจบกัน ช่วงเวลาแห่งความสมดุลที่หายาก' },
  { number: 6, fortune: 'good', titleEn: 'Morning Star', titleTh: 'ดาวประกายพรึก', meaningEn: 'New beginnings favor you. Start projects, make plans — the stars support fresh ventures.', meaningTh: 'การเริ่มต้นใหม่เป็นมงคล เริ่มโปรเจกต์ วางแผน ดวงดาวสนับสนุน' },
  { number: 7, fortune: 'good', titleEn: 'Jade Mountain', titleTh: 'เขาหยก', meaningEn: 'Financial matters improve. Investments made now will grow steadily over time.', meaningTh: 'เรื่องการเงินดีขึ้น การลงทุนตอนนี้จะเติบโตอย่างมั่นคง' },
  { number: 8, fortune: 'fair', titleEn: 'Crossing River', titleTh: 'ข้ามแม่น้ำ', meaningEn: 'A transition period. Old ways must be released to embrace what comes next.', meaningTh: 'ช่วงเปลี่ยนผ่าน ต้องปล่อยวางสิ่งเก่าเพื่อรับสิ่งใหม่' },
  { number: 9, fortune: 'excellent', titleEn: 'Nine Heavens', titleTh: 'เก้าสวรรค์', meaningEn: 'Supreme luck in all endeavors. The heavens align in your favor — seize this moment.', meaningTh: 'โชคดีสูงสุดในทุกเรื่อง สวรรค์เข้าข้าง คว้าโอกาสนี้ไว้' },
  { number: 10, fortune: 'caution', titleEn: 'Autumn Leaf', titleTh: 'ใบไม้ร่วง', meaningEn: 'Something you hold dear may change. Accept impermanence — what falls makes room for growth.', meaningTh: 'สิ่งที่รักอาจเปลี่ยนแปลง ยอมรับความไม่เที่ยง สิ่งที่ร่วงหล่นเปิดทางให้สิ่งใหม่เติบโต' },
  { number: 11, fortune: 'good', titleEn: 'Phoenix Feather', titleTh: 'ขนหงส์', meaningEn: 'Recovery and renewal. Past difficulties transform into wisdom and strength.', meaningTh: 'การฟื้นตัวและเริ่มใหม่ ความยากลำบากในอดีตกลายเป็นปัญญาและพลัง' },
  { number: 12, fortune: 'fair', titleEn: 'Bamboo Bend', titleTh: 'ไผ่โน้ม', meaningEn: 'Flexibility is your strength now. Bend with circumstances rather than resisting.', meaningTh: 'ความยืดหยุ่นคือจุดแข็งตอนนี้ โอนอ่อนตามสถานการณ์แทนที่จะขัดขืน' },
  { number: 13, fortune: 'caution', titleEn: 'Clouded Moon', titleTh: 'จันทร์เมฆบัง', meaningEn: 'Clarity is temporarily obscured. Delay important decisions until the fog lifts.', meaningTh: 'ความชัดเจนถูกบดบังชั่วคราว เลื่อนการตัดสินใจสำคัญจนกว่าหมอกจะจาง' },
  { number: 14, fortune: 'good', titleEn: 'Twin Fish', titleTh: 'ปลาคู่', meaningEn: 'Love and partnership are highlighted. Existing bonds deepen; new connections spark.', meaningTh: 'ความรักและความสัมพันธ์โดดเด่น สายสัมพันธ์เดิมลึกซึ้งขึ้น การพบปะใหม่จุดประกาย' },
  { number: 15, fortune: 'excellent', titleEn: 'Thunderbolt', titleTh: 'สายฟ้า', meaningEn: 'A sudden breakthrough shatters obstacles. What seemed impossible becomes inevitable.', meaningTh: 'การเปลี่ยนแปลงอย่างฉับพลันทำลายอุปสรรค สิ่งที่ดูเป็นไปไม่ได้กลายเป็นความจริง' },
  { number: 16, fortune: 'fair', titleEn: 'Resting Tiger', titleTh: 'เสือพักผ่อน', meaningEn: 'Power in reserve. This is not the time to strike — gather your strength for what comes.', meaningTh: 'พลังสำรอง ยังไม่ใช่เวลาลงมือ สะสมพลังสำหรับสิ่งที่จะมา' },
  { number: 17, fortune: 'good', titleEn: 'Silk Thread', titleTh: 'ไหมทอ', meaningEn: 'Connections and networks bring opportunity. Reach out to those you have not spoken to recently.', meaningTh: 'สายสัมพันธ์และเครือข่ายนำโอกาสมาให้ ติดต่อคนที่ไม่ได้พูดคุยด้วยนานแล้ว' },
  { number: 18, fortune: 'caution', titleEn: 'Empty Vessel', titleTh: 'ภาชนะว่าง', meaningEn: 'You are overextending. Pull back, conserve resources, and fill your own cup first.', meaningTh: 'คุณใช้พลังงานมากเกินไป ถอยกลับ รักษาทรัพยากร เติมเต็มตัวเองก่อน' },
  { number: 19, fortune: 'good', titleEn: 'Garden Gate', titleTh: 'ประตูสวน', meaningEn: 'An invitation or opportunity arrives. Say yes — this door opens to abundance.', meaningTh: 'คำเชิญหรือโอกาสมาถึง ตอบรับ ประตูนี้เปิดสู่ความอุดมสมบูรณ์' },
  { number: 20, fortune: 'fair', titleEn: 'Mountain Path', titleTh: 'ทางขึ้นเขา', meaningEn: 'Progress is slow but upward. Each step, though difficult, brings you closer to the summit.', meaningTh: 'ความก้าวหน้าช้าแต่มุ่งขึ้น ทุกก้าวแม้ยากลำบากแต่ใกล้ยอดเขามากขึ้น' },
  { number: 21, fortune: 'excellent', titleEn: 'Diamond Rain', titleTh: 'ฝนเพชร', meaningEn: 'Unexpected wealth or recognition pours in. Your hidden talents finally receive their due.', meaningTh: 'ความมั่งคั่งหรือการยอมรับที่ไม่คาดคิดไหลเข้ามา พรสวรรค์ที่ซ่อนอยู่ได้รับการยอมรับ' },
  { number: 22, fortune: 'caution', titleEn: 'Broken Mirror', titleTh: 'กระจกแตก', meaningEn: 'Self-reflection reveals uncomfortable truths. Face them now to avoid greater pain later.', meaningTh: 'การสะท้อนตัวเองเผยความจริงที่ไม่สบายใจ เผชิญหน้าตอนนี้เพื่อหลีกเลี่ยงความเจ็บปวดในภายหลัง' },
  { number: 23, fortune: 'good', titleEn: 'White Crane', titleTh: 'นกกระเรียนขาว', meaningEn: 'Health and longevity are favored. Take care of your body — it will serve you well.', meaningTh: 'สุขภาพและอายุยืนเป็นมงคล ดูแลร่างกาย มันจะรับใช้คุณได้ดี' },
  { number: 24, fortune: 'fair', titleEn: 'Woven Basket', titleTh: 'ตะกร้าสาน', meaningEn: 'Gather what you have and organize. Small, practical actions create lasting results.', meaningTh: 'รวบรวมสิ่งที่มีและจัดระเบียบ การกระทำเล็กๆ ที่เป็นรูปธรรมสร้างผลลัพธ์ที่ยั่งยืน' },
  { number: 25, fortune: 'excellent', titleEn: 'Royal Elephant', titleTh: 'ช้างราชพาหนะ', meaningEn: 'Power, dignity, and authority are yours. Lead with confidence — others follow willingly.', meaningTh: 'พลัง ศักดิ์ศรี และอำนาจเป็นของคุณ นำด้วยความมั่นใจ ผู้อื่นยินดีตาม' },
  { number: 26, fortune: 'caution', titleEn: 'Deep Well', titleTh: 'บ่อลึก', meaningEn: 'Look before you leap. What appears inviting on the surface may hide depths you are unprepared for.', meaningTh: 'ดูก่อนกระโดด สิ่งที่ดูน่าดึงดูดบนผิวหน้าอาจซ่อนความลึกที่คุณไม่พร้อมรับ' },
  { number: 27, fortune: 'good', titleEn: 'Incense Smoke', titleTh: 'ควันธูป', meaningEn: 'Prayers and wishes are being heard. Maintain your spiritual practice — blessings are near.', meaningTh: 'คำอธิษฐานกำลังถูกรับฟัง รักษาการปฏิบัติทางจิตวิญญาณ พรใกล้เข้ามาแล้ว' },
  { number: 28, fortune: 'fair', titleEn: 'Twilight Hour', titleTh: 'ยามสนธยา', meaningEn: 'An ending and a beginning overlap. Honor what passes while welcoming what arrives.', meaningTh: 'จุดจบและจุดเริ่มต้นซ้อนทับกัน ให้เกียรติสิ่งที่ผ่านไปขณะต้อนรับสิ่งที่มา' },
];

import { hashCode } from './hash';

export function drawSiamSi(userId: string, yearMonth: string, drawIndex: number): SiamSiStick {
  const seed = hashCode(`${userId}:${yearMonth}:${drawIndex}`);
  const stickIndex = seed % SIAM_SI_STICKS.length;
  return SIAM_SI_STICKS[stickIndex];
}
