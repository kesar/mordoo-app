export interface ThaiProverb {
  th: string;
  en: string;
  meaning: string;
  meaningTh: string;
}

export const THAI_PROVERBS: ThaiProverb[] = [
  { th: 'น้ำขึ้นให้รีบตัก', en: 'When the water rises, scoop quickly', meaning: 'Seize opportunity when it comes', meaningTh: 'คว้าโอกาสเมื่อมันมาถึง' },
  { th: 'ช้าๆ ได้พร้าเล่มงาม', en: 'Go slowly, get a beautiful axe', meaning: 'Patience yields the best results', meaningTh: 'ความอดทนให้ผลลัพธ์ที่ดีที่สุด' },
  { th: 'ฝนทั่งให้เป็นเข็ม', en: 'Grind an anvil into a needle', meaning: 'Persistence conquers all', meaningTh: 'ความพยายามเอาชนะทุกอย่าง' },
  { th: 'ตนเป็นที่พึ่งแห่งตน', en: 'Be your own refuge', meaning: 'True strength comes from within', meaningTh: 'ความเข้มแข็งที่แท้จริงมาจากภายใน' },
  { th: 'น้ำหยดลงหินทุกวัน หินมันยังกร่อน', en: 'Water dripping on stone every day — even stone erodes', meaning: 'Small consistent effort creates big change', meaningTh: 'ความพยายามเล็กๆ สม่ำเสมอสร้างการเปลี่ยนแปลงครั้งใหญ่' },
  { th: 'สิบปากว่า ไม่เท่าตาเห็น', en: 'Ten mouths telling is not equal to one eye seeing', meaning: 'Experience trumps hearsay', meaningTh: 'ประสบการณ์ตรงดีกว่าคำบอกเล่า' },
  { th: 'ทำดีได้ดี ทำชั่วได้ชั่ว', en: 'Do good, receive good. Do evil, receive evil', meaning: 'Your actions shape your destiny', meaningTh: 'การกระทำของคุณกำหนดชะตาชีวิต' },
  { th: 'ผิดเป็นครู', en: 'Mistakes are teachers', meaning: 'Learn from every failure', meaningTh: 'เรียนรู้จากความล้มเหลวทุกครั้ง' },
  { th: 'อดเปรี้ยวไว้กินหวาน', en: 'Endure the sour to taste the sweet', meaning: 'Short-term sacrifice for long-term reward', meaningTh: 'เสียสละระยะสั้นเพื่อรางวัลระยะยาว' },
  { th: 'ไม่มีใครแก่เกินเรียน', en: 'No one is too old to learn', meaning: 'Growth never stops', meaningTh: 'การเติบโตไม่เคยหยุด' },
  { th: 'น้ำใจเป็นสิ่งสำคัญ', en: 'A generous heart is what matters most', meaning: 'Kindness outweighs material wealth', meaningTh: 'ความเมตตามีค่ามากกว่าความร่ำรวย' },
  { th: 'เวลาเป็นเงินเป็นทอง', en: 'Time is silver and gold', meaning: 'Value every moment', meaningTh: 'ให้คุณค่ากับทุกช่วงเวลา' },
  { th: 'รักยาวให้บั่น รักสั้นให้ต่อ', en: 'For lasting love, trim it. For brief love, extend it', meaning: 'Know when to hold on and when to let go', meaningTh: 'รู้ว่าเมื่อไหร่ควรยึดมั่นและเมื่อไหร่ควรปล่อยวาง' },
  { th: 'ความพยายามอยู่ที่ไหน ความสำเร็จอยู่ที่นั่น', en: 'Where there is effort, there is success', meaning: 'Effort always leads to achievement', meaningTh: 'ความพยายามนำไปสู่ความสำเร็จเสมอ' },
  { th: 'เข้าเมืองตาหลิ่ว ต้องหลิ่วตาตาม', en: 'In the city of the squinting, squint along', meaning: 'Adapt to your environment', meaningTh: 'ปรับตัวเข้ากับสภาพแวดล้อม' },
  { th: 'น้ำเชี่ยวอย่าขวางเรือ', en: "Don't block the boat in swift water", meaning: "Don't fight forces beyond your control", meaningTh: 'อย่าต่อสู้กับสิ่งที่ควบคุมไม่ได้' },
  { th: 'แพ้เป็นพระ ชนะเป็นมาร', en: 'To lose with grace is noble, to win with cruelty is demonic', meaning: 'How you handle defeat defines your character', meaningTh: 'วิธีที่คุณรับมือกับความพ่ายแพ้กำหนดบุคลิกของคุณ' },
  { th: 'ไม้อ่อนดัดง่าย ไม้แก่ดัดยาก', en: 'Young wood bends easily, old wood does not', meaning: 'Embrace change while you can', meaningTh: 'เปิดรับการเปลี่ยนแปลงขณะที่ยังทำได้' },
  { th: 'อย่าชิงสุกก่อนห่าม', en: "Don't pick the fruit before it's ripe", meaning: "Don't rush — let things mature naturally", meaningTh: 'อย่ารีบร้อน ปล่อยให้สิ่งต่างๆ สุกงอมเอง' },
  { th: 'มีสลึงพึงบรรจบให้ครบบาท', en: 'With a quarter coin, strive to make a full baht', meaning: 'Save and build from what you have', meaningTh: 'เก็บออมและสร้างจากสิ่งที่มี' },
];

export function getDailyProverb(dateStr: string): ThaiProverb {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
  }
  const index = Math.abs(hash) % THAI_PROVERBS.length;
  return THAI_PROVERBS[index];
}
