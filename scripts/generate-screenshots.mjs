#!/usr/bin/env node
/**
 * App Store Screenshot Generator for Mor Doo
 *
 * Usage:
 *   1. Take raw simulator screenshots and save them to:
 *      screenshots/raw/en/  — English screenshots
 *      screenshots/raw/th/  — Thai screenshots
 *
 *   2. Name them by slot number:
 *      1-pulse.png, 2-oracle.png, 3-siam-si.png, etc.
 *
 *   3. Run: node scripts/generate-screenshots.mjs
 *
 *   4. Output goes to fastlane/screenshots/en-US/ and fastlane/screenshots/th/
 *      Ready for: fastlane ios upload_screenshots
 */

import sharp from "sharp";
import { readdir, mkdir, access } from "fs/promises";
import { join, basename } from "path";

// ─── Config ──────────────────────────────────────────────────
const ROOT = new URL("..", import.meta.url).pathname;

const SIZES = {
  IPHONE_67: { w: 1290, h: 2796, suffix: "APP_IPHONE_67" },
  IPHONE_65: { w: 1242, h: 2688, suffix: "APP_IPHONE_65" },
  IPHONE_55: { w: 1242, h: 2208, suffix: "APP_IPHONE_55" },
};

const COLORS = {
  bg: { r: 10, g: 10, b: 20 },
  gold: { r: 201, g: 168, b: 76 },
  parchment: { r: 244, g: 232, b: 193 },
};

const CAPTIONS = {
  en: {
    "1": "Your Daily Cosmic Energy",
    "2": "Ask the AI Oracle Anything",
    "3": "28 Sacred Fortune Sticks",
    "4": "Lucky Color, Number & Direction",
    "5": "Personalized to Your Birth Chart",
    "6": "Thai & English — Your Choice",
    "7": "Start Every Morning Guided",
    "8": "Tell Us What Matters to You",
    "9": "Crafted with Cosmic Care",
    "10": "Free to Start",
  },
  th: {
    "1": "พลังจักรวาลประจำวันของคุณ",
    "2": "ถามหมอดู AI ได้ทุกเรื่อง",
    "3": "เซียมซี 28 กอ ศักดิ์สิทธิ์",
    "4": "สีนำโชค เลขนำโชค ทิศนำโชค",
    "5": "เฉพาะตัวจากวันเกิดของคุณ",
    "6": "ไทยและอังกฤษ — เลือกได้เลย",
    "7": "เริ่มทุกเช้าอย่างมีทิศทาง",
    "8": "บอกเราว่าอะไรสำคัญสำหรับคุณ",
    "9": "ออกแบบด้วยใจแห่งจักรวาล",
    "10": "เริ่มฟรี อัปเกรด ฿149/เดือน",
  },
};

const LOCALE_MAP = { en: "en-US", th: "th" };

// ─── SVG Text Rendering ─────────────────────────────────────
function createCaptionSVG(text, width, height) {
  // Caption takes top 15% of the image
  const captionHeight = Math.round(height * 0.15);
  const fontSize = Math.round(captionHeight * 0.35);
  const yCenter = Math.round(captionHeight * 0.55);

  // Detect Thai text
  const isThai = /[\u0E00-\u0E7F]/.test(text);
  const fontFamily = isThai
    ? "'Noto Sans Thai', 'Sarabun', sans-serif"
    : "'Cinzel Decorative', 'Georgia', serif";

  const letterSpacing = isThai ? "0" : "3";

  return Buffer.from(`
    <svg width="${width}" height="${captionHeight}" xmlns="http://www.w3.org/2000/svg">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&amp;family=Noto+Sans+Thai:wght@500&amp;display=swap');
      </style>
      <text
        x="50%"
        y="${yCenter}"
        text-anchor="middle"
        dominant-baseline="middle"
        font-family="${fontFamily}"
        font-size="${fontSize}px"
        font-weight="${isThai ? 500 : 700}"
        fill="rgb(${COLORS.gold.r},${COLORS.gold.g},${COLORS.gold.b})"
        letter-spacing="${letterSpacing}"
      >${escapeXml(text)}</text>
    </svg>
  `);
}

function escapeXml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// ─── Screenshot Generator ───────────────────────────────────
async function generateScreenshot(rawPath, caption, size, outputPath) {
  const { w, h } = size;
  const captionHeight = Math.round(h * 0.15);
  const screenHeight = h - captionHeight;
  const screenPadding = Math.round(w * 0.04);
  const screenWidth = w - screenPadding * 2;
  const screenInnerHeight = screenHeight - Math.round(screenPadding * 0.5);

  // Create caption SVG
  const captionSVG = createCaptionSVG(caption, w, h);

  // Resize raw screenshot to fit
  const rawImage = sharp(rawPath).resize(screenWidth, screenInnerHeight, {
    fit: "contain",
    background: COLORS.bg,
  });

  // Create dark background
  const background = sharp({
    create: {
      width: w,
      height: h,
      channels: 4,
      background: { ...COLORS.bg, alpha: 1 },
    },
  });

  // Add subtle gold gradient glow at top
  const glowSVG = Buffer.from(`
    <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="glow" cx="50%" cy="10%" r="60%">
          <stop offset="0%" stop-color="rgb(${COLORS.gold.r},${COLORS.gold.g},${COLORS.gold.b})" stop-opacity="0.08"/>
          <stop offset="100%" stop-color="rgb(${COLORS.bg.r},${COLORS.bg.g},${COLORS.bg.b})" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="${w}" height="${h}" fill="url(#glow)"/>
    </svg>
  `);

  // Compose layers
  const rawBuf = await rawImage.png().toBuffer();
  const captionBuf = await sharp(captionSVG).resize(w, captionHeight).png().toBuffer();

  await background
    .composite([
      { input: glowSVG, top: 0, left: 0 },
      { input: captionBuf, top: 0, left: 0 },
      {
        input: rawBuf,
        top: captionHeight,
        left: screenPadding,
      },
    ])
    .png()
    .toFile(outputPath);
}

// ─── Main ────────────────────────────────────────────────────
async function main() {
  const rawDir = join(ROOT, "screenshots", "raw");

  // Check raw dir exists
  try {
    await access(rawDir);
  } catch {
    console.log(`
Screenshot Generator for Mor Doo
=================================

Step 1: Create the raw screenshots directories:
  mkdir -p screenshots/raw/en screenshots/raw/th

Step 2: Take simulator screenshots (Cmd+S in Simulator) and save them:

  screenshots/raw/en/
    1-pulse.png          Pulse screen (energy score visible)
    2-oracle.png         Oracle chat (mid-conversation)
    3-siam-si.png        Siam Si result card
    4-lucky.png          Pulse lucky elements section
    5-birth.png          Soul Snapshot / birth data card
    6-oracle-thai.png    Oracle in Thai (for bilingual slot)
    7-pulse-notif.png    Pulse with notification (or reuse 1)
    8-life-context.png   Life context concerns grid
    9-soul-gate.png      Soul Gate sign-in screen
    10-pricing.png       Paywall or pricing (optional)

  screenshots/raw/th/
    (same filenames, but with the app set to Thai language)

Step 3: Run this script again:
  node scripts/generate-screenshots.mjs

Output: fastlane/screenshots/en-US/ and fastlane/screenshots/th/
Then:   fastlane ios upload_screenshots
`);
    process.exit(0);
  }

  for (const lang of ["en", "th"]) {
    const langDir = join(rawDir, lang);
    const outDir = join(ROOT, "fastlane", "screenshots", LOCALE_MAP[lang]);
    await mkdir(outDir, { recursive: true });

    let files;
    try {
      files = await readdir(langDir);
    } catch {
      console.log(`No raw screenshots found in screenshots/raw/${lang}/ — skipping`);
      continue;
    }

    const pngFiles = files.filter((f) => f.endsWith(".png")).sort();
    if (pngFiles.length === 0) {
      console.log(`No .png files in screenshots/raw/${lang}/ — skipping`);
      continue;
    }

    console.log(`\nProcessing ${lang} (${pngFiles.length} screenshots)...`);

    for (const file of pngFiles) {
      // Extract slot number from filename (e.g., "1-pulse.png" → "1")
      const slotMatch = basename(file).match(/^(\d+)/);
      if (!slotMatch) {
        console.log(`  Skipping ${file} (no slot number)`);
        continue;
      }
      const slot = slotMatch[1];
      const caption = CAPTIONS[lang][slot];
      if (!caption) {
        console.log(`  Skipping ${file} (no caption for slot ${slot})`);
        continue;
      }

      const rawPath = join(langDir, file);

      // Generate for each device size
      for (const [sizeKey, size] of Object.entries(SIZES)) {
        const outFile = `${slot}_${size.suffix}.png`;
        const outPath = join(outDir, outFile);

        try {
          await generateScreenshot(rawPath, caption, size, outPath);
          console.log(`  ${lang}/${outFile} (${size.w}x${size.h})`);
        } catch (err) {
          console.error(`  ERROR ${outFile}: ${err.message}`);
        }
      }
    }
  }

  console.log("\nDone! Screenshots ready in fastlane/screenshots/");
  console.log("Upload with: fastlane ios upload_screenshots");
}

main().catch(console.error);
