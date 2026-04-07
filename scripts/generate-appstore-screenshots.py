#!/usr/bin/env python3
"""Generate App Store 6.9" captioned screenshots from raw simulator captures."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DESK = Path.home() / "Desktop"
OUT_EN = ROOT / "fastlane/screenshots/en-US"
OUT_TH = ROOT / "fastlane/screenshots/th"
FONT_HEAD = ROOT / "assets/fonts/CinzelDecorative-Bold.ttf"
FONT_SUB = Path("/System/Library/Fonts/Supplemental/Georgia Italic.ttf")
FONT_THAI = ROOT / "assets/fonts/NotoSansThai-Medium.ttf"

W, H = 1290, 2796  # iPhone 6.9" App Store size
BG = (10, 10, 20)
GOLD = (201, 168, 76)
PARCH = (244, 232, 193)

SHOTS = [
    ("Simulator Screenshot - iPhone 16e - 2026-04-07 at 12.08.17.png",
     ("ANCIENT WISDOM", "Modern guidance for every seeker"),
     ("ภูมิปัญญาโบราณ", "คำชี้แนะสำหรับทุกคำถาม")),
    ("Simulator Screenshot - iPhone 16e - 2026-04-07 at 12.07.39.png",
     ("DAILY THAI WISDOM", "Start every morning with insight"),
     ("ปัญญาไทยทุกวัน", "เริ่มต้นเช้าด้วยคำชี้แนะ")),
    ("Simulator Screenshot - iPhone 16e - 2026-04-07 at 12.07.48.png",
     ("CHAT WITH THE ORACLE", "Your personal AI companion"),
     ("สนทนากับหมอดู", "เพื่อน AI ส่วนตัวของคุณ")),
    ("Simulator Screenshot - iPhone 16e - 2026-04-07 at 12.08.08.png",
     ("UNLIMITED GUIDANCE", "Unlock your full potential"),
     ("คำแนะนำไม่จำกัด", "ปลดล็อกศักยภาพของคุณ")),
]

def draw_caption(draw, title, subtitle, font_head, font_sub, title_color=GOLD, sub_color=PARCH):
    # Title
    bbox = draw.textbbox((0, 0), title, font=font_head)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) / 2, 140), title, font=font_head, fill=title_color)
    # Subtitle
    bbox = draw.textbbox((0, 0), subtitle, font=font_sub)
    sw = bbox[2] - bbox[0]
    draw.text(((W - sw) / 2, 260), subtitle, font=font_sub, fill=sub_color)

def compose(src_path: Path, out_path: Path, title: str, subtitle: str, thai: bool):
    canvas = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(canvas)

    head_font_path = str(FONT_THAI if thai else FONT_HEAD)
    sub_font_path = str(FONT_THAI if thai else FONT_SUB)
    font_head = ImageFont.truetype(head_font_path, 78 if thai else 82)
    font_sub = ImageFont.truetype(sub_font_path, 46)

    draw_caption(draw, title, subtitle, font_head, font_sub)

    # Device screenshot — scale to fit, leave ~380px caption space top
    shot = Image.open(src_path).convert("RGB")
    target_w = 1100
    ratio = target_w / shot.width
    target_h = int(shot.height * ratio)
    shot = shot.resize((target_w, target_h), Image.LANCZOS)

    # Rounded corners
    mask = Image.new("L", shot.size, 0)
    mdraw = ImageDraw.Draw(mask)
    mdraw.rounded_rectangle((0, 0, shot.size[0], shot.size[1]), radius=60, fill=255)
    rounded = Image.new("RGB", shot.size, BG)
    rounded.paste(shot, (0, 0))

    x = (W - target_w) // 2
    y = 400
    canvas.paste(rounded, (x, y), mask)

    # subtle gold border
    bdraw = ImageDraw.Draw(canvas)
    bdraw.rounded_rectangle((x - 3, y - 3, x + target_w + 3, y + target_h + 3),
                            radius=63, outline=GOLD, width=3)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out_path, "PNG", optimize=True)
    print(f"wrote {out_path}")

def main():
    OUT_EN.mkdir(parents=True, exist_ok=True)
    OUT_TH.mkdir(parents=True, exist_ok=True)
    for idx, (fname, en, th) in enumerate(SHOTS, start=1):
        src = DESK / fname
        compose(src, OUT_EN / f"{idx}_APP_IPHONE_69.png", en[0], en[1], thai=False)
        compose(src, OUT_TH / f"{idx}_APP_IPHONE_69.png", th[0], th[1], thai=True)

if __name__ == "__main__":
    main()
