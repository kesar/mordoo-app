import { NextResponse } from 'next/server';

// Toggle these after App Store approval
const FLAGS = {
  dailyPulse: false,
  zodiacReferences: false,
  fortuneLabels: false,
  luckyElements: false,
  siamSi: true,
  oracleChat: true,
};

const VERSION = 1;

export async function GET() {
  return NextResponse.json(
    { flags: FLAGS, v: VERSION },
    {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    },
  );
}
