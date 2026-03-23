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
      { en: 'Your passion ignites everything around you. Start the project you have been postponing.', th: 'ความหลงใหลของคุณจุดไฟให้ทุกอย่างรอบตัว เริ่มโปรเจกต์ที่ผลัดมานานได้แล้ว' },
      { en: 'Ambition aligns with opportunity today. Aim higher than usual — you can reach it.', th: 'ความทะเยอทะยานสอดคล้องกับโอกาสวันนี้ ตั้งเป้าสูงกว่าปกติ — คุณไปถึงได้' },
      { en: 'A surge of energy arrives after midday. Save your biggest move for the afternoon.', th: 'พลังงานพุ่งสูงหลังเที่ยง เก็บการเคลื่อนไหวครั้งใหญ่ไว้ช่วงบ่าย' },
      { en: 'Your determination is magnetic today. People want to follow your lead.', th: 'ความมุ่งมั่นของคุณดึงดูดใจวันนี้ ผู้คนอยากเดินตามคุณ' },
      { en: 'The stars favor risk-takers today. Step outside your comfort zone with confidence.', th: 'ดวงดาวเข้าข้างคนกล้าเสี่ยงวันนี้ ก้าวออกจากคอมฟอร์ตโซนอย่างมั่นใจ' },
      { en: 'Competitive energy peaks. Channel it into personal bests, not conflicts.', th: 'พลังการแข่งขันสูงสุด ส่งมันไปที่การทำลายสถิติตัวเอง ไม่ใช่ความขัดแย้ง' },
      { en: 'Your inner fire burns clean and bright. Express what you truly want without hesitation.', th: 'ไฟภายในเผาไหม้สะอาดและสว่าง แสดงออกสิ่งที่คุณต้องการจริงๆ โดยไม่ลังเล' },
      { en: 'A breakthrough day. What felt impossible last week now feels within reach.', th: 'วันแห่งการฝ่าทะลุ สิ่งที่รู้สึกเป็นไปไม่ได้เมื่อสัปดาห์ก่อนตอนนี้อยู่แค่เอื้อม' },
    ],
    water: [
      { en: 'Intuition runs deep today. Trust your gut on financial matters.', th: 'สัญชาตญาณแรงกล้าวันนี้ เชื่อใจตัวเองในเรื่องการเงิน' },
      { en: 'Emotional clarity arrives. A good day to mend relationships or start new ones.', th: 'ความชัดเจนทางอารมณ์มาถึง วันดีที่จะซ่อมแซมความสัมพันธ์หรือเริ่มต้นใหม่' },
      { en: 'Your empathy is your superpower today. Listen more than you speak.', th: 'ความเห็นอกเห็นใจคือพลังพิเศษวันนี้ ฟังมากกว่าพูด' },
      { en: 'Flow with changes today — resistance creates friction, acceptance creates power.', th: 'ไหลไปกับความเปลี่ยนแปลงวันนี้ — การต่อต้านสร้างแรงเสียดทาน การยอมรับสร้างพลัง' },
      { en: 'Deep connections form easily today. Be open to vulnerability — it builds trust.', th: 'ความสัมพันธ์ลึกซึ้งเกิดง่ายวันนี้ เปิดใจยอมเปราะบาง — มันสร้างความไว้วางใจ' },
      { en: 'Your healing energy is strong. Spend time with someone who needs your calm presence.', th: 'พลังเยียวยาของคุณแข็งแกร่ง ใช้เวลากับคนที่ต้องการความสงบจากคุณ' },
      { en: 'Dreams carry messages tonight. Keep a notebook by your bed.', th: 'ความฝันส่งข้อความคืนนี้ วางสมุดไว้ข้างเตียง' },
      { en: 'A wave of inspiration rises from within. Follow the feeling before logic intervenes.', th: 'คลื่นแรงบันดาลใจขึ้นจากภายใน ตามความรู้สึกก่อนที่เหตุผลจะเข้ามาแทรก' },
      { en: 'Forgiveness comes easier today. Release what weighs on your heart.', th: 'การให้อภัยง่ายขึ้นวันนี้ ปล่อยสิ่งที่ถ่วงหัวใจของคุณ' },
      { en: 'Your emotional intelligence peaks. Read between the lines in every conversation.', th: 'ความฉลาดทางอารมณ์สูงสุด อ่านระหว่างบรรทัดในทุกบทสนทนา' },
      { en: 'Creative flow runs like a river today. Let art, music, or writing carry you.', th: 'กระแสสร้างสรรค์ไหลเหมือนแม่น้ำวันนี้ ปล่อยให้ศิลปะ ดนตรี หรือการเขียนพาคุณไป' },
      { en: 'An old memory surfaces with a new lesson. Pay attention to what it teaches you.', th: 'ความทรงจำเก่าผุดขึ้นพร้อมบทเรียนใหม่ สนใจสิ่งที่มันสอนคุณ' },
    ],
    earth: [
      { en: 'Stability is your strength today. Build something that lasts.', th: 'ความมั่นคงคือจุดแข็งวันนี้ สร้างสิ่งที่ยั่งยืน' },
      { en: 'Practical wisdom guides you. Focus on long-term investments and health.', th: 'ปัญญาเชิงปฏิบัตินำทางคุณ มุ่งเน้นการลงทุนระยะยาวและสุขภาพ' },
      { en: 'A grounding day — perfect for organizing, planning, and setting foundations.', th: 'วันแห่งความมั่นคง — เหมาะสำหรับจัดระเบียบ วางแผน และวางรากฐาน' },
      { en: 'Your patience pays off today. Steady progress beats dramatic leaps.', th: 'ความอดทนให้ผลตอบแทนวันนี้ ความก้าวหน้าที่มั่นคงดีกว่าการก้าวกระโดด' },
      { en: 'Financial decisions favor you today. Trust the numbers and commit.', th: 'การตัดสินใจทางการเงินเข้าข้างคุณวันนี้ เชื่อตัวเลขและตัดสินใจ' },
      { en: 'Your reliability attracts opportunity. Someone trusts you with something important today.', th: 'ความน่าเชื่อถือของคุณดึงดูดโอกาส มีคนไว้วางใจคุณกับเรื่องสำคัญวันนี้' },
      { en: 'The ground beneath you is solid. This is the day to take that next step.', th: 'พื้นใต้เท้าคุณมั่นคง วันนี้คือวันที่จะก้าวต่อไป' },
      { en: 'Nature recharges you today. Even a short walk outside amplifies your strength.', th: 'ธรรมชาติเติมพลังคุณวันนี้ แค่เดินสั้นๆ ข้างนอกก็เพิ่มพลังได้' },
      { en: 'A harvest day — the seeds you planted weeks ago begin to show results.', th: 'วันเก็บเกี่ยว — เมล็ดที่หว่านไว้หลายสัปดาห์ก่อนเริ่มให้ผล' },
      { en: 'Your body knows what it needs. Follow its signals for food, rest, and movement.', th: 'ร่างกายรู้ว่าต้องการอะไร ทำตามสัญญาณเรื่องอาหาร การพักผ่อน และการเคลื่อนไหว' },
      { en: 'Material abundance flows your way. Accept it without guilt.', th: 'ความอุดมสมบูรณ์ทางวัตถุไหลเข้าหาคุณ รับไว้โดยไม่ต้องรู้สึกผิด' },
      { en: 'Discipline becomes effortless today. Use this momentum to build a lasting habit.', th: 'วินัยกลายเป็นเรื่องง่ายวันนี้ ใช้โมเมนตัมนี้สร้างนิสัยที่ยั่งยืน' },
    ],
    air: [
      { en: 'Mental clarity is sharp today. Solve problems that have been lingering.', th: 'ความคิดแจ่มใสวันนี้ แก้ปัญหาที่ค้างคาไว้' },
      { en: 'Communication flows effortlessly. Write, speak, connect — your words carry weight.', th: 'การสื่อสารไหลลื่น เขียน พูด เชื่อมต่อ — คำพูดของคุณมีน้ำหนัก' },
      { en: 'Ideas come rapidly today. Capture them before they fade.', th: 'ไอเดียมาเร็ววันนี้ จดไว้ก่อนที่จะเลือนหาย' },
      { en: 'A social day — networking and collaboration bring unexpected opportunities.', th: 'วันแห่งสังคม — การสร้างเครือข่ายและความร่วมมือนำโอกาสที่ไม่คาดคิด' },
      { en: 'Your wit is razor-sharp. Use humor to open doors that logic cannot.', th: 'ไหวพริบของคุณคมกริบ ใช้อารมณ์ขันเปิดประตูที่เหตุผลเปิดไม่ได้' },
      { en: 'A flash of insight arrives unexpectedly. Trust it — your subconscious has been working.', th: 'แสงวาบของความเข้าใจมาอย่างไม่คาดคิด เชื่อมัน — จิตใต้สำนึกทำงานมาตลอด' },
      { en: 'Teaching or mentoring brings you joy today. Share what you know generously.', th: 'การสอนหรือเป็นพี่เลี้ยงนำความสุขมาวันนี้ แบ่งปันสิ่งที่คุณรู้อย่างเต็มที่' },
      { en: 'Written words have extra power today. Send that email, post that message, sign that deal.', th: 'ตัวอักษรมีพลังพิเศษวันนี้ ส่งอีเมลนั้น โพสต์ข้อความนั้น เซ็นสัญญานั้น' },
      { en: 'Curiosity leads to treasure today. Follow the question that won\'t leave your mind.', th: 'ความอยากรู้นำไปสู่สมบัติวันนี้ ตามคำถามที่วนเวียนในหัวไม่หยุด' },
      { en: 'Your perspective shifts today. What seemed complicated now reveals a simple truth.', th: 'มุมมองของคุณเปลี่ยนวันนี้ สิ่งที่ดูซับซ้อนเผยให้เห็นความจริงที่เรียบง่าย' },
      { en: 'Conversations spark transformation. One exchange today could change your direction entirely.', th: 'บทสนทนาจุดประกายการเปลี่ยนแปลง การพูดคุยครั้งเดียววันนี้อาจเปลี่ยนทิศทางคุณทั้งหมด' },
      { en: 'A brilliant strategy forms in your mind. Map it out before the day ends.', th: 'กลยุทธ์อันยอดเยี่ยมก่อตัวในใจ วางแผนให้เสร็จก่อนหมดวัน' },
    ],
  },
  medium: {
    fire: [
      { en: 'Moderate energy today. Pace yourself and save your fire for what matters most.', th: 'พลังงานปานกลางวันนี้ ค่อยๆ ทำและเก็บไฟไว้สำหรับสิ่งสำคัญที่สุด' },
      { en: 'A balanced day ahead. Small, consistent actions beat grand gestures.', th: 'วันที่สมดุลรออยู่ การกระทำเล็กๆ สม่ำเสมอดีกว่าการแสดงใหญ่' },
      { en: 'Guard your energy after 6pm. The morning is your window of power.', th: 'รักษาพลังงานหลัง 6 โมงเย็น ช่วงเช้าคือหน้าต่างแห่งพลัง' },
      { en: 'Mixed signals today — verify before you trust. Your instincts need a second opinion.', th: 'สัญญาณปนกันวันนี้ — ตรวจสอบก่อนเชื่อ สัญชาตญาณต้องการความเห็นที่สอง' },
      { en: 'Your spark is steady, not blazing. Perfect for tasks that need focus, not flair.', th: 'ประกายของคุณสม่ำเสมอ ไม่ลุกโชน เหมาะสำหรับงานที่ต้องใช้สมาธิ ไม่ใช่ความโฉบเฉี่ยว' },
      { en: 'A slow burn kind of day. Progress happens if you do not force it.', th: 'วันแบบค่อยๆ ไป ความก้าวหน้าเกิดขึ้นถ้าคุณไม่ฝืน' },
      { en: 'Passion simmers beneath the surface. Let it build — tomorrow may be the day to unleash it.', th: 'ความหลงใหลเดือดอยู่ใต้ผิว ปล่อยให้มันสะสม — พรุ่งนี้อาจเป็นวันที่ปล่อยออก' },
      { en: 'Others may test your patience. Stay warm but firm in your boundaries.', th: 'คนอื่นอาจทดสอบความอดทนคุณ อบอุ่นแต่หนักแน่นในขอบเขตของคุณ' },
      { en: 'A good day to refine rather than create. Polish what you already started.', th: 'วันที่ดีสำหรับปรับปรุงมากกว่าสร้างใหม่ ขัดเกลาสิ่งที่เริ่มไว้แล้ว' },
      { en: 'Your willpower is reliable but not infinite. Pick your battles wisely today.', th: 'พลังใจของคุณเชื่อถือได้แต่ไม่ไร้ขีดจำกัด เลือกศึกอย่างฉลาดวันนี้' },
      { en: 'Evening brings a second wind. If morning feels flat, wait for the shift.', th: 'ช่วงเย็นนำพลังรอบสองมา ถ้าเช้ารู้สึกแบน รอจังหวะเปลี่ยน' },
      { en: 'Half-finished projects call to you. Choose one and move it forward today.', th: 'โปรเจกต์ที่ทำค้างเรียกหาคุณ เลือกสักอันแล้วเดินหน้าวันนี้' },
    ],
    water: [
      { en: 'Emotions may fluctuate. Stay centered and avoid reactive decisions.', th: 'อารมณ์อาจขึ้นลง อยู่ตรงกลางและหลีกเลี่ยงการตัดสินใจตามอารมณ์' },
      { en: 'A reflective day. Journal or meditate to find clarity beneath the surface.', th: 'วันแห่งการใคร่ครวญ เขียนบันทึกหรือนั่งสมาธิเพื่อค้นหาความชัดเจน' },
      { en: 'Water energy is gentle today. Go with the current, not against it.', th: 'พลังน้ำอ่อนโยนวันนี้ ไปตามกระแส อย่าฝืน' },
      { en: 'Sensitivity is heightened. Choose your company wisely today.', th: 'ความอ่อนไหวสูงขึ้น เลือกคนรอบข้างอย่างฉลาดวันนี้' },
      { en: 'Nostalgia may visit today. Enjoy it briefly, then return to the present.', th: 'ความคิดถึงอดีตอาจมาเยือนวันนี้ เพลิดเพลินสั้นๆ แล้วกลับสู่ปัจจุบัน' },
      { en: 'Your mood shifts like tides. Neither peak nor dip lasts — ride them both.', th: 'อารมณ์เปลี่ยนเหมือนน้ำขึ้นน้ำลง ทั้งจุดสูงสุดและต่ำสุดไม่คงอยู่ — ขี่คลื่นทั้งสอง' },
      { en: 'Someone close needs your support. A small gesture means more than grand words.', th: 'คนใกล้ชิดต้องการการสนับสนุนของคุณ สิ่งเล็กๆ มีค่ามากกว่าคำพูดยิ่งใหญ่' },
      { en: 'Artistic expression soothes you today. Draw, cook, sing — anything with feeling.', th: 'การแสดงออกทางศิลปะปลอบประโลมคุณวันนี้ วาด ทำอาหาร ร้องเพลง — อะไรก็ได้ที่มีความรู้สึก' },
      { en: 'A secret weighs on you. Consider whether sharing it would bring relief.', th: 'ความลับถ่วงใจคุณ ลองพิจารณาว่าการเปิดเผยจะทำให้โล่งใจไหม' },
      { en: 'Boundaries need gentle reinforcement today. You can care without carrying.', th: 'ขอบเขตต้องเสริมอย่างอ่อนโยนวันนี้ คุณห่วงใยได้โดยไม่ต้องแบกรับ' },
      { en: 'Tea over coffee today. Slow rituals calm the inner storm.', th: 'ชาดีกว่ากาแฟวันนี้ พิธีกรรมช้าๆ สงบพายุภายใน' },
      { en: 'Midday brings a moment of emotional clarity. Watch for it and act on what it reveals.', th: 'ช่วงเที่ยงนำความชัดเจนทางอารมณ์มาสักครู่ จับตาดูแล้วลงมือตามที่มันเปิดเผย' },
    ],
    earth: [
      { en: 'Steady as she goes. Nothing dramatic, but quiet progress is still progress.', th: 'เดินหน้าอย่างมั่นคง ไม่มีอะไรน่าตื่นเต้น แต่ความก้าวหน้าเงียบๆ ก็คือความก้าวหน้า' },
      { en: 'A maintenance day — tend to what you have before seeking something new.', th: 'วันซ่อมบำรุง — ดูแลสิ่งที่มีก่อนไปหาสิ่งใหม่' },
      { en: 'Routine serves you well today. Find comfort in the familiar.', th: 'กิจวัตรรับใช้คุณดีวันนี้ ค้นหาความสบายในสิ่งที่คุ้นเคย' },
      { en: 'Practical matters need attention. Handle the small things before they grow.', th: 'เรื่องปฏิบัติต้องการความสนใจ จัดการเรื่องเล็กๆ ก่อนที่จะโตขึ้น' },
      { en: 'Not every day needs a win. Today, just showing up is enough.', th: 'ไม่ใช่ทุกวันต้องชนะ วันนี้แค่มาก็พอแล้ว' },
      { en: 'A loose thread in your finances needs tying up. Check your subscriptions or pending bills.', th: 'เส้นด้ายหลุดในเรื่องการเงินต้องจัดการ ตรวจสอบสมาชิกหรือบิลที่ค้างอยู่' },
      { en: 'Your home environment affects your mood today. Tidy one small space.', th: 'สภาพแวดล้อมที่บ้านส่งผลต่ออารมณ์วันนี้ จัดระเบียบพื้นที่เล็กๆ สักมุม' },
      { en: 'Comfort food and good company heal more than you think. Indulge a little.', th: 'อาหารที่ชอบและคนที่ดีเยียวยาได้มากกว่าที่คิด ตามใจตัวเองบ้าง' },
      { en: 'A contract, agreement, or plan benefits from one more review before signing.', th: 'สัญญา ข้อตกลง หรือแผนจะได้ประโยชน์จากการทบทวนอีกครั้งก่อนเซ็น' },
      { en: 'Physical activity grounds scattered thoughts. Move your body, even briefly.', th: 'กิจกรรมทางกายทำให้ความคิดกระจัดกระจายลงตัว ขยับร่างกาย แม้แค่สั้นๆ' },
      { en: 'Someone offers practical help today. Accept it — you do not have to do everything alone.', th: 'มีคนเสนอช่วยเรื่องปฏิบัติวันนี้ รับไว้ — คุณไม่ต้องทำทุกอย่างคนเดียว' },
      { en: 'Review your goals from last month. Small adjustments now prevent big corrections later.', th: 'ทบทวนเป้าหมายจากเดือนที่แล้ว ปรับเล็กน้อยตอนนี้ป้องกันการแก้ใหญ่ทีหลัง' },
    ],
    air: [
      { en: 'Thoughts may scatter today. Write lists, set reminders, stay organized.', th: 'ความคิดอาจกระจัดกระจายวันนี้ เขียนรายการ ตั้งเตือน จัดระเบียบ' },
      { en: 'Communication needs extra care. Re-read messages before sending.', th: 'การสื่อสารต้องระมัดระวังเป็นพิเศษ อ่านข้อความซ้ำก่อนส่ง' },
      { en: 'A neutral day for air energy. Neither inspired nor blocked — just steady.', th: 'วันปกติสำหรับพลังลม ไม่ได้แรงบันดาลใจหรือติดขัด — แค่สม่ำเสมอ' },
      { en: 'Seek quiet spaces today. Too much noise disrupts your thinking.', th: 'หาพื้นที่เงียบวันนี้ เสียงรบกวนมากเกินไปทำให้ความคิดสับสน' },
      { en: 'A half-formed idea needs one more conversation to crystallize. Talk it out.', th: 'ไอเดียที่ยังไม่สมบูรณ์ต้องการบทสนทนาอีกครั้งเพื่อตกผลึก พูดคุยเรื่องนี้' },
      { en: 'Information overload threatens. Limit your inputs and focus on one source of truth.', th: 'ข้อมูลท่วมท้นคุกคาม จำกัดสิ่งที่รับเข้ามาและโฟกัสแหล่งข้อมูลเดียว' },
      { en: 'Your analytical side dominates today. Good for spreadsheets, less good for heart-to-hearts.', th: 'ด้านวิเคราะห์ครองวันนี้ ดีสำหรับสเปรดชีต ไม่ค่อยดีสำหรับคุยเรื่องหัวใจ' },
      { en: 'A podcast, article, or book holds the answer you are looking for. Keep exploring.', th: 'พอดแคสต์ บทความ หรือหนังสือมีคำตอบที่คุณหา ค้นหาต่อไป' },
      { en: 'Multitasking tempts you, but single focus wins today. One thing at a time.', th: 'การทำหลายอย่างพร้อมกันยั่วใจ แต่โฟกัสเดียวชนะวันนี้ ทีละอย่าง' },
      { en: 'A misunderstanding brews if you assume instead of asking. Clarify early.', th: 'ความเข้าใจผิดก่อตัวถ้าคุณคาดเดาแทนที่จะถาม ชี้แจงแต่เนิ่นๆ' },
      { en: 'Your mind wanders toward the future. Useful for planning, but do not skip the present.', th: 'ใจคุณลอยไปอนาคต ดีสำหรับวางแผน แต่อย่าข้ามปัจจุบัน' },
      { en: 'Learning something new energizes you today. Even ten minutes of study counts.', th: 'การเรียนรู้สิ่งใหม่เติมพลังคุณวันนี้ แม้แค่สิบนาทีของการเรียนก็มีค่า' },
    ],
  },
  low: {
    fire: [
      { en: 'Low fire energy today. Rest and recharge — tomorrow brings renewal.', th: 'พลังไฟต่ำวันนี้ พักผ่อนและเติมพลัง — พรุ่งนี้จะดีขึ้น' },
      { en: 'Not your day for confrontation. Retreat, plan, and prepare for a stronger tomorrow.', th: 'ไม่ใช่วันสำหรับการเผชิญหน้า ถอยกลับ วางแผน และเตรียมตัวสำหรับพรุ่งนี้ที่แข็งแกร่งกว่า' },
      { en: 'Energy dips in the afternoon. Schedule important tasks for morning only.', th: 'พลังงานตกในตอนบ่าย จัดงานสำคัญไว้ช่วงเช้าเท่านั้น' },
      { en: 'A cooling period. Your fire needs fuel — eat well, sleep early, reset.', th: 'ช่วงพักฟื้น ไฟของคุณต้องการเชื้อเพลิง — กินดี นอนเร็ว รีเซ็ต' },
      { en: 'Frustration simmers beneath the surface. Name it, then let it pass.', th: 'ความหงุดหงิดเดือดอยู่ใต้ผิว เรียกชื่อมัน แล้วปล่อยให้ผ่านไป' },
      { en: 'Your flame is low but not out. Protect it from winds — avoid draining people today.', th: 'เปลวไฟของคุณอ่อนแต่ไม่ดับ ปกป้องจากลม — หลีกเลี่ยงคนที่ดูดพลังวันนี้' },
      { en: 'Ambition outpaces energy today. Scale your plans down and execute what is realistic.', th: 'ความทะเยอทะยานนำหน้าพลังงานวันนี้ ลดขนาดแผนแล้วทำสิ่งที่เป็นจริงได้' },
      { en: 'A candle recharges in darkness. Let today be your quiet preparation.', th: 'เทียนเติมพลังในความมืด ปล่อยให้วันนี้เป็นการเตรียมตัวอย่างเงียบๆ' },
      { en: 'Skip the gym, take a bath. Gentle warmth restores more than intensity today.', th: 'ข้ามยิม ไปแช่น้ำ ความอบอุ่นอ่อนโยนฟื้นฟูได้มากกว่าความเข้มข้นวันนี้' },
      { en: 'Do not mistake stillness for failure. Even fire needs to rest between burns.', th: 'อย่าเข้าใจผิดว่าความนิ่งคือความล้มเหลว แม้ไฟยังต้องพักระหว่างลุกไหม้' },
      { en: 'Inspiration feels distant. It will return — today, focus on recovery.', th: 'แรงบันดาลใจรู้สึกห่างไกล มันจะกลับมา — วันนี้โฟกัสที่การฟื้นตัว' },
      { en: 'Your inner critic is loud today. Counter every doubt with one thing you did well this week.', th: 'เสียงวิจารณ์ภายในดังวันนี้ ตอบโต้ทุกความสงสัยด้วยสิ่งที่คุณทำได้ดีสัปดาห์นี้' },
    ],
    water: [
      { en: 'Emotional fog today. Avoid major decisions until clarity returns.', th: 'หมอกทางอารมณ์วันนี้ หลีกเลี่ยงการตัดสินใจใหญ่จนกว่าจะชัดเจน' },
      { en: 'Low tide energy. Withdraw inward and nurture yourself before giving to others.', th: 'พลังงานน้ำลง ถอยเข้าข้างในและดูแลตัวเองก่อนให้คนอื่น' },
      { en: 'Sensitivity is raw today. Protect your peace and say no when needed.', th: 'ความอ่อนไหวสูงวันนี้ ปกป้องความสงบและปฏิเสธเมื่อจำเป็น' },
      { en: 'A quiet day for reflection. Not every day needs action.', th: 'วันเงียบๆ สำหรับการใคร่ครวญ ไม่ใช่ทุกวันที่ต้องลงมือทำ' },
      { en: 'Tears may come without reason. Let them — they carry old weight away.', th: 'น้ำตาอาจมาโดยไม่มีเหตุผล ปล่อยมัน — มันพาภาระเก่าออกไป' },
      { en: 'You absorb others\' moods easily today. Create distance from negativity.', th: 'คุณซึมซับอารมณ์คนอื่นง่ายวันนี้ สร้างระยะห่างจากความลบ' },
      { en: 'The well runs dry if you keep giving. Refill yourself first today.', th: 'บ่อน้ำแห้งถ้าให้ต่อไปเรื่อยๆ เติมตัวเองก่อนวันนี้' },
      { en: 'Old wounds may surface. Acknowledge them gently — healing is not linear.', th: 'บาดแผลเก่าอาจผุดขึ้นมา ยอมรับอย่างอ่อนโยน — การเยียวยาไม่ได้เป็นเส้นตรง' },
      { en: 'Loneliness whispers today. Reach out to one person — connection is the antidote.', th: 'ความเหงากระซิบวันนี้ ติดต่อคนสักคน — ความเชื่อมต่อคือยาแก้' },
      { en: 'Avoid sad music and heavy films today. Your emotions need lightness, not depth.', th: 'หลีกเลี่ยงเพลงเศร้าและหนังหนักวันนี้ อารมณ์ของคุณต้องการความเบา ไม่ใช่ความลึก' },
      { en: 'Water stagnates when it cannot flow. A walk near water or a warm shower helps reset.', th: 'น้ำนิ่งเมื่อไม่ได้ไหล เดินใกล้น้ำหรืออาบน้ำอุ่นช่วยรีเซ็ต' },
      { en: 'Your intuition is muffled, not gone. Rest now and it returns sharper tomorrow.', th: 'สัญชาตญาณถูกอุดแต่ไม่หายไป พักตอนนี้แล้วมันจะกลับมาคมขึ้นพรุ่งนี้' },
    ],
    earth: [
      { en: 'Foundations feel shaky today. Focus on self-care, not building.', th: 'รากฐานรู้สึกสั่นคลอนวันนี้ มุ่งเน้นการดูแลตัวเอง ไม่ใช่การสร้าง' },
      { en: 'Slow down. Your body is asking for rest, not productivity.', th: 'ช้าลง ร่างกายของคุณขอพักผ่อน ไม่ใช่ความมีประสิทธิผล' },
      { en: 'A day to simplify. Remove one unnecessary burden from your life.', th: 'วันที่จะทำให้ง่ายขึ้น เอาภาระที่ไม่จำเป็นออกจากชีวิตสักอย่าง' },
      { en: 'Grounding energy is scattered. Walk barefoot, touch nature, reconnect.', th: 'พลังสายดินกระจัดกระจาย เดินเท้าเปล่า สัมผัสธรรมชาติ เชื่อมต่อใหม่' },
      { en: 'Gravity feels heavier today. Lower your expectations and be kind to yourself.', th: 'แรงโน้มถ่วงรู้สึกหนักขึ้นวันนี้ ลดความคาดหวังและใจดีกับตัวเอง' },
      { en: 'Plans crumble if you push too hard. Hold loosely and adapt.', th: 'แผนพังถ้าฝืนมากเกินไป ถือเบาๆ และปรับตัว' },
      { en: 'Your usual discipline wavers. That is okay — one off day does not erase your progress.', th: 'วินัยที่เคยมีสั่นคลอน ไม่เป็นไร — วันพักวันเดียวไม่ลบความก้าวหน้าของคุณ' },
      { en: 'Avoid new commitments today. Your plate is already full enough.', th: 'หลีกเลี่ยงภาระใหม่วันนี้ จานของคุณเต็มพอแล้ว' },
      { en: 'Comfort is not laziness. Sometimes rest is the most productive choice.', th: 'ความสบายไม่ใช่ความเกียจคร้าน บางครั้งการพักคือทางเลือกที่มีประสิทธิผลที่สุด' },
      { en: 'Something you built needs mending. Repair before you expand.', th: 'สิ่งที่คุณสร้างต้องซ่อมแซม ซ่อมก่อนขยาย' },
      { en: 'Money worries may surface. Breathe — then check the actual numbers, not the fears.', th: 'ความกังวลเรื่องเงินอาจผุดขึ้น หายใจ — แล้วตรวจสอบตัวเลขจริง ไม่ใช่ความกลัว' },
      { en: 'A heavy day, but temporary. Tomorrow the earth settles and strength returns.', th: 'วันที่หนัก แต่ชั่วคราว พรุ่งนี้ดินทรุดตัวและพลังกลับมา' },
    ],
    air: [
      { en: 'Mental fog rolls in. Postpone complex decisions if you can.', th: 'หมอกในความคิดเข้ามา เลื่อนการตัดสินใจซับซ้อนถ้าทำได้' },
      { en: 'Overthinking is the enemy today. Trust what you already know.', th: 'การคิดมากเกินไปคือศัตรูวันนี้ เชื่อในสิ่งที่คุณรู้อยู่แล้ว' },
      { en: 'Communication may be misread. Keep messages short and clear.', th: 'การสื่อสารอาจถูกเข้าใจผิด เขียนข้อความสั้นและชัดเจน' },
      { en: 'A day to listen rather than speak. Wisdom hides in silence.', th: 'วันที่ควรฟังมากกว่าพูด ปัญญาซ่อนอยู่ในความเงียบ' },
      { en: 'Your mind races in circles. Break the loop with physical movement.', th: 'ใจวิ่งวนเป็นวงกลม ทำลายวงจรด้วยการขยับร่างกาย' },
      { en: 'Anxiety borrows from tomorrow. Stay rooted in what is real right now.', th: 'ความวิตกกังวลยืมจากพรุ่งนี้ อยู่กับสิ่งที่เป็นจริงตอนนี้' },
      { en: 'Words come out wrong today. When in doubt, say less.', th: 'คำพูดออกมาผิดวันนี้ เมื่อไม่แน่ใจ พูดน้อยลง' },
      { en: 'Screen fatigue clouds your thinking. Step away from devices for an hour.', th: 'ความเหนื่อยล้าจากหน้าจอบดบังความคิด ออกห่างจากอุปกรณ์สักชั่วโมง' },
      { en: 'You cannot think your way out of this mood. Feel it, then move on.', th: 'คุณคิดหาทางออกจากอารมณ์นี้ไม่ได้ รู้สึกมัน แล้วก้าวต่อไป' },
      { en: 'Comparison steals your peace today. Unfollow, mute, or log off if needed.', th: 'การเปรียบเทียบขโมยความสงบวันนี้ เลิกติดตาม ปิดเสียง หรือออกจากระบบถ้าจำเป็น' },
      { en: 'A scattered mind needs a simple anchor. Focus on your breath for two minutes.', th: 'จิตใจกระจัดกระจายต้องการสมอเรียบง่าย โฟกัสที่ลมหายใจสองนาที' },
      { en: 'Not a day for debates or big emails. Save the important conversations for tomorrow.', th: 'ไม่ใช่วันสำหรับการถกเถียงหรืออีเมลสำคัญ เก็บบทสนทนาสำคัญไว้พรุ่งนี้' },
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
