type Element = 'fire' | 'water' | 'earth' | 'air';
type ScoreRange = 'low' | 'medium' | 'high';

const TEMPLATES: Record<ScoreRange, Record<Element, string[]>> = {
  high: {
    fire: [
      'A powerful day for bold decisions. Your fire energy peaks in the morning — act before noon.',
      'Creative sparks fly today. Channel your intensity into one focused project.',
      'Your confidence radiates today. Others notice — use this for negotiations.',
      'A strong day for leadership. Trust your instincts and move decisively.',
    ],
    water: [
      'Intuition runs deep today. Trust your gut on financial matters.',
      'Emotional clarity arrives. A good day to mend relationships or start new ones.',
      'Your empathy is your superpower today. Listen more than you speak.',
      'Flow with changes today — resistance creates friction, acceptance creates power.',
    ],
    earth: [
      'Stability is your strength today. Build something that lasts.',
      'Practical wisdom guides you. Focus on long-term investments and health.',
      'A grounding day — perfect for organizing, planning, and setting foundations.',
      'Your patience pays off today. Steady progress beats dramatic leaps.',
    ],
    air: [
      'Mental clarity is sharp today. Solve problems that have been lingering.',
      'Communication flows effortlessly. Write, speak, connect — your words carry weight.',
      'Ideas come rapidly today. Capture them before they fade.',
      'A social day — networking and collaboration bring unexpected opportunities.',
    ],
  },
  medium: {
    fire: [
      'Moderate energy today. Pace yourself and save your fire for what matters most.',
      'A balanced day ahead. Small, consistent actions beat grand gestures.',
      'Guard your energy after 6pm. The morning is your window of power.',
      'Mixed signals today — verify before you trust. Your instincts need a second opinion.',
    ],
    water: [
      'Emotions may fluctuate. Stay centered and avoid reactive decisions.',
      'A reflective day. Journal or meditate to find clarity beneath the surface.',
      'Water energy is gentle today. Go with the current, not against it.',
      'Sensitivity is heightened. Choose your company wisely today.',
    ],
    earth: [
      'Steady as she goes. Nothing dramatic, but quiet progress is still progress.',
      'A maintenance day — tend to what you have before seeking something new.',
      'Routine serves you well today. Find comfort in the familiar.',
      'Practical matters need attention. Handle the small things before they grow.',
    ],
    air: [
      'Thoughts may scatter today. Write lists, set reminders, stay organized.',
      'Communication needs extra care. Re-read messages before sending.',
      'A neutral day for air energy. Neither inspired nor blocked — just steady.',
      'Seek quiet spaces today. Too much noise disrupts your thinking.',
    ],
  },
  low: {
    fire: [
      'Low fire energy today. Rest and recharge — tomorrow brings renewal.',
      'Not your day for confrontation. Retreat, plan, and prepare for a stronger tomorrow.',
      'Energy dips in the afternoon. Schedule important tasks for morning only.',
      'A cooling period. Your fire needs fuel — eat well, sleep early, reset.',
    ],
    water: [
      'Emotional fog today. Avoid major decisions until clarity returns.',
      'Low tide energy. Withdraw inward and nurture yourself before giving to others.',
      'Sensitivity is raw today. Protect your peace and say no when needed.',
      'A quiet day for reflection. Not every day needs action.',
    ],
    earth: [
      'Foundations feel shaky today. Focus on self-care, not building.',
      'Slow down. Your body is asking for rest, not productivity.',
      'A day to simplify. Remove one unnecessary burden from your life.',
      'Grounding energy is scattered. Walk barefoot, touch nature, reconnect.',
    ],
    air: [
      'Mental fog rolls in. Postpone complex decisions if you can.',
      'Overthinking is the enemy today. Trust what you already know.',
      'Communication may be misread. Keep messages short and clear.',
      'A day to listen rather than speak. Wisdom hides in silence.',
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
): string {
  const element = getElement(birthMonth);
  const range = getScoreRange(score);
  const pool = TEMPLATES[range][element];
  return pool[seedValue % pool.length];
}
