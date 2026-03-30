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
import { readdir, mkdir, access, readFile } from "fs/promises";
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
};

const CAPTIONS = {
  en: {
    "1": "Your Daily Cosmic Energy",
    "2": "Ask the AI Oracle Anything",
    "3": "28 Sacred Fortune Sticks",
    "4": "Start Every Morning Guided",
    "5": "Your Cosmic Profile",
    "6": "Crafted with Cosmic Care",
  },
  th: {
    "1": "พลังจักรวาลประจำวันของคุณ",
    "2": "ถามหมอดู AI ได้ทุกเรื่อง",
    "3": "เซียมซี 28 กอ ศักดิ์สิทธิ์",
    "4": "ปลดล็อกศักยภาพเต็มที่",
    "5": "โปรไฟล์จักรวาลของคุณ",
    "6": "ออกแบบด้วยใจแห่งจักรวาล",
  },
};

const LOCALE_MAP = { en: "en-US", th: "th" };

// ─── Font Loading ────────────────────────────────────────────
const FONTS_DIR = join(ROOT, "assets", "fonts");
let fontCache = {};

async function loadFontBase64(filename) {
  if (fontCache[filename]) return fontCache[filename];
  const fontPath = join(FONTS_DIR, filename);
  const fontData = await readFile(fontPath);
  fontCache[filename] = fontData.toString("base64");
  return fontCache[filename];
}

// ─── SVG Text Rendering ─────────────────────────────────────
async function createCaptionSVG(text, width, totalHeight) {
  const captionHeight = Math.round(totalHeight * 0.15);
  const isThai = /[\u0E00-\u0E7F]/.test(text);

  // Load the right font
  const fontFile = isThai ? "NotoSansThai-Medium.ttf" : "CinzelDecorative-Bold.ttf";
  const fontBase64 = await loadFontBase64(fontFile);
  const fontFamily = isThai ? "NotoSansThai" : "CinzelDecorative";
  const fontWeight = isThai ? 500 : 700;

  // Calculate font size to fit within caption width with padding
  const maxWidth = width * 0.9;
  // Estimate: avg char width ~= fontSize * 0.6 for latin, ~0.9 for Thai
  const charWidthRatio = isThai ? 0.85 : 0.55;
  const estimatedFontSize = Math.floor(maxWidth / (text.length * charWidthRatio));
  const fontSize = Math.min(estimatedFontSize, Math.round(captionHeight * 0.35));
  const yCenter = Math.round(captionHeight * 0.55);
  const letterSpacing = isThai ? 0 : 2;

  const svg = `<svg width="${width}" height="${captionHeight}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <style>
      @font-face {
        font-family: '${fontFamily}';
        src: url('data:font/truetype;base64,${fontBase64}') format('truetype');
        font-weight: ${fontWeight};
      }
    </style>
  </defs>
  <text
    x="50%"
    y="${yCenter}"
    text-anchor="middle"
    dominant-baseline="middle"
    font-family="'${fontFamily}'"
    font-size="${fontSize}px"
    font-weight="${fontWeight}"
    fill="rgb(${COLORS.gold.r},${COLORS.gold.g},${COLORS.gold.b})"
    letter-spacing="${letterSpacing}"
  >${escapeXml(text)}</text>
</svg>`;

  return { svg: Buffer.from(svg), height: captionHeight };
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
  const { svg: captionSVG, height: captionHeight } = await createCaptionSVG(caption, w, h);
  const screenPadding = Math.round(w * 0.03);
  const screenWidth = w - screenPadding * 2;
  const screenInnerHeight = h - captionHeight - Math.round(screenPadding * 0.5);

  // Resize raw screenshot to fit
  const rawBuf = await sharp(rawPath)
    .resize(screenWidth, screenInnerHeight, {
      fit: "contain",
      background: COLORS.bg,
    })
    .png()
    .toBuffer();

  // Render caption SVG to PNG
  const captionBuf = await sharp(captionSVG)
    .resize(w, captionHeight)
    .png()
    .toBuffer();

  // Gold glow overlay
  const glowSVG = Buffer.from(`<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="50%" cy="8%" r="50%">
      <stop offset="0%" stop-color="rgb(${COLORS.gold.r},${COLORS.gold.g},${COLORS.gold.b})" stop-opacity="0.1"/>
      <stop offset="100%" stop-color="rgb(${COLORS.bg.r},${COLORS.bg.g},${COLORS.bg.b})" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
</svg>`);

  // Compose: background → glow → caption → app screenshot
  await sharp({
    create: {
      width: w,
      height: h,
      channels: 4,
      background: { ...COLORS.bg, alpha: 1 },
    },
  })
    .composite([
      { input: glowSVG, top: 0, left: 0 },
      { input: captionBuf, top: 0, left: 0 },
      { input: rawBuf, top: captionHeight, left: screenPadding },
    ])
    .png()
    .toFile(outputPath);
}

// ─── Main ────────────────────────────────────────────────────
async function main() {
  const rawDir = join(ROOT, "screenshots", "raw");

  try {
    await access(rawDir);
  } catch {
    console.log(`
Screenshot Generator for Mor Doo
=================================

Step 1: Create directories:
  mkdir -p screenshots/raw/en screenshots/raw/th

Step 2: Save simulator screenshots (Cmd+S) named by slot:
  1-pulse.png, 2-oracle.png, 3-siam-si.png, etc.

Step 3: Run: node scripts/generate-screenshots.mjs
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
      console.log(`No raw screenshots in screenshots/raw/${lang}/ — skipping`);
      continue;
    }

    const pngFiles = files.filter((f) => f.endsWith(".png")).sort();
    if (pngFiles.length === 0) {
      console.log(`No .png files in screenshots/raw/${lang}/ — skipping`);
      continue;
    }

    console.log(`\nProcessing ${lang} (${pngFiles.length} screenshots)...`);

    for (const file of pngFiles) {
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

      for (const [, size] of Object.entries(SIZES)) {
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
