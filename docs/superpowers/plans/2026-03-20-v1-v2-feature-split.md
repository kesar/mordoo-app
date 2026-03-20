# V1/V2 Feature Split Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplify the Mor Doo landing page to reflect v1 scope — 2 realm cards + coming soon teaser, 2 pricing tiers, no micro-transactions.

**Architecture:** Single-file HTML edit (`index.html`). All changes are HTML and embedded CSS. No JS changes needed (i18n system handles new `data-i18n-*` attributes automatically).

**Tech Stack:** Static HTML/CSS, no build tools.

**Spec:** `docs/superpowers/specs/2026-03-20-v1-v2-feature-split-design.md`

**Prerequisites:** `docs/v2-roadmap.md` already exists with all deferred features. No action needed for that file.

**Codebase notes:**
- CSS custom properties (`--gold`, `--card-bg`, `--card-border`, `--text-muted`, etc.) are defined in the `:root` block near the top of `index.html` (around line 57).
- The `reveal` class triggers a scroll-reveal animation via an `IntersectionObserver` in the JS at the bottom of the file. Any element with `class="reveal"` will animate in on scroll.
- The `[lang="th"]` CSS selectors depend on the language toggle JS (`setLanguage()` at the bottom of `index.html`) which sets the `lang` attribute on `<html>`.
- The `data-i18n-en` / `data-i18n-th` attributes are read by that same JS to swap text content.
- **Line numbers:** All line numbers reference the **original** file. After CSS insertions in Chunk 1 (~60 lines added), line numbers in Chunks 2-3 will be shifted. **Use the before/after code snippets to locate content, not line numbers**, for Chunks 2-3.

---

## Chunk 1: Realm Cards & Coming Soon Strip

### Task 1: Update The Pulse realm card features

**Files:**
- Modify: `index.html:1167-1172`

- [ ] **Step 1: Remove v2 features from Pulse card**

Remove the "Power Windows" and "Cosmic news" `<li>` elements (lines 1169 and 1171). Keep lines 1168 and 1170.

Before:
```html
<ul class="realm-features i18n-body">
  <li data-i18n-en="Daily Energy Score (0–100)" data-i18n-th="คะแนนพลังงานประจำวัน (0–100)">Daily Energy Score (0–100)</li>
  <li data-i18n-en="Power Windows — best hours for deals & decisions" data-i18n-th="ช่วงเวลาทอง — ชั่วโมงที่ดีที่สุดสำหรับการตัดสินใจ">Power Windows — best hours for deals & decisions</li>
  <li data-i18n-en="Lucky color, number & direction" data-i18n-th="สีมงคล ตัวเลข และทิศทาง">Lucky color, number & direction</li>
  <li data-i18n-en="Cosmic news correlated with market data" data-i18n-th="ข่าวจักรวาลเชื่อมโยงกับข้อมูลตลาด">Cosmic news correlated with market data</li>
</ul>
```

After:
```html
<ul class="realm-features i18n-body">
  <li data-i18n-en="Daily Energy Score (0–100)" data-i18n-th="คะแนนพลังงานประจำวัน (0–100)">Daily Energy Score (0–100)</li>
  <li data-i18n-en="Lucky color, number & direction" data-i18n-th="สีมงคล ตัวเลข และทิศทาง">Lucky color, number & direction</li>
</ul>
```

- [ ] **Step 2: Verify visually**

Run: `open index.html` or `python3 -m http.server 8000`
Expected: Pulse card shows only 2 bullet points.

---

### Task 2: Update The Oracle realm card features

**Files:**
- Modify: `index.html:1187-1192`

- [ ] **Step 1: Replace Oracle feature list**

Replace the entire `<ul>` contents (lines 1187-1192).

Before:
```html
<ul class="realm-features i18n-body">
  <li data-i18n-en="Full 78-card Tarot with context-aware meanings" data-i18n-th="ไพ่ทาโรต์ 78 ใบ พร้อมความหมายตามบริบท">Full 78-card Tarot with context-aware meanings</li>
  <li data-i18n-en="Digital Siam Si (fortune stick ceremony)" data-i18n-th="เซียมซีดิจิทัล (พิธีเสี่ยงเซียมซี)">Digital Siam Si (fortune stick ceremony)</li>
  <li data-i18n-en="Persistent memory across sessions" data-i18n-th="หน่วยความจำต่อเนื่องข้ามเซสชัน">Persistent memory across sessions</li>
  <li data-i18n-en="Prediction tracker with accuracy scoring" data-i18n-th="ติดตามคำทำนายพร้อมคะแนนความแม่นยำ">Prediction tracker with accuracy scoring</li>
</ul>
```

After:
```html
<ul class="realm-features i18n-body">
  <li data-i18n-en="AI chat reading (Thai, Chinese & Western astrology)" data-i18n-th="ดูดวง AI (โหราศาสตร์ไทย จีน และตะวันตก)">AI chat reading (Thai, Chinese & Western astrology)</li>
  <li data-i18n-en="Digital Siam Si (fortune stick ceremony)" data-i18n-th="เซียมซีดิจิทัล (พิธีเสี่ยงเซียมซี)">Digital Siam Si (fortune stick ceremony)</li>
  <li data-i18n-en="Shareable Soul Snapshot" data-i18n-th="แชร์ภาพรวมจิตวิญญาณได้">Shareable Soul Snapshot</li>
</ul>
```

- [ ] **Step 2: Verify visually**

Expected: Oracle card shows 3 new bullet points.

---

### Task 3: Replace Compass/Sanctuary/Archive with Coming Soon strip

**Files:**
- Modify: `index.html:1196-1253` (remove realm cards 3-5)
- Modify: `index.html` CSS section (add `.coming-soon-*` styles)

- [ ] **Step 1: Add Coming Soon CSS**

Insert after the closing `}` of the `.realm-features li::before` rule (line 591), on a new blank line before the `/* ====== SECTION 3 ====== */` comment (line 593):

```css
/* Coming Soon teaser strip */
.coming-soon-strip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.2rem;
  margin-top: 2.5rem;
  padding-top: 2.5rem;
  border-top: 1px solid rgba(201, 168, 76, 0.08);
}

.coming-soon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1.5rem 1rem;
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 6px;
}

.coming-soon-item img {
  width: 64px;
  height: 64px;
  object-fit: contain;
  border-radius: 8px;
  filter: drop-shadow(0 0 12px rgba(201, 168, 76, 0.2));
  margin-bottom: 0.8rem;
  opacity: 0.7;
}

.coming-soon-name {
  font-family: 'Cinzel Decorative', serif;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--gold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 0.4rem;
}

[lang="th"] .coming-soon-name {
  font-family: 'Noto Sans Thai', sans-serif;
  text-transform: none;
  letter-spacing: 0.02em;
}

.coming-soon-desc {
  font-size: 0.82rem;
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: 0.8rem;
}

.coming-soon-badge {
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--gold);
  border: 1px solid rgba(201, 168, 76, 0.3);
  border-radius: 10px;
  padding: 0.2rem 0.7rem;
}
```

- [ ] **Step 2: Add Coming Soon responsive CSS**

In the `@media (max-width: 768px)` block, add before its closing `}` brace (search for the `.pricing-grid { grid-template-columns: 1fr;` rule — insert after that rule block):

```css
.coming-soon-strip {
  grid-template-columns: 1fr;
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
}
```

- [ ] **Step 3: Replace HTML realm cards 3-5 with Coming Soon strip**

Replace everything from `<!-- Realm 3: The Compass -->` (line 1196) through the closing `</div>` of Realm 5's `.realm-card` div (line 1253). **Do NOT delete line 1254** (`</div>` closing `.section-inner`) or line 1255 (`</section>`). Replace with:

```html
<!-- Coming Soon Realms -->
<div class="coming-soon-strip reveal">
  <div class="coming-soon-item">
    <picture><source srcset="img/realm-compass.webp" type="image/webp"><img src="img/realm-compass.png" alt="The Compass" width="400" height="400" loading="lazy"></picture>
    <p class="coming-soon-name" data-i18n-en="The Compass" data-i18n-th="เข็มทิศ">The Compass</p>
    <p class="coming-soon-desc i18n-body" data-i18n-en="Auspicious dates, compatibility & lucky numbers" data-i18n-th="วันมงคล ความเข้ากันได้ และเลขนำโชค">Auspicious dates, compatibility & lucky numbers</p>
    <span class="coming-soon-badge" data-i18n-en="Coming Soon" data-i18n-th="เร็วๆ นี้">Coming Soon</span>
  </div>
  <div class="coming-soon-item">
    <picture><source srcset="img/realm-sanctuary.webp" type="image/webp"><img src="img/realm-sanctuary.png" alt="The Sanctuary" width="400" height="400" loading="lazy"></picture>
    <p class="coming-soon-name" data-i18n-en="The Sanctuary" data-i18n-th="สถานศักดิ์สิทธิ์">The Sanctuary</p>
    <p class="coming-soon-desc i18n-body" data-i18n-en="Temple finder, digital amulets & ritual guides" data-i18n-th="ค้นหาวัด พระเครื่องดิจิทัล และคู่มือพิธีกรรม">Temple finder, digital amulets & ritual guides</p>
    <span class="coming-soon-badge" data-i18n-en="Coming Soon" data-i18n-th="เร็วๆ นี้">Coming Soon</span>
  </div>
  <div class="coming-soon-item">
    <picture><source srcset="img/realm-archive.webp" type="image/webp"><img src="img/realm-archive.png" alt="The Archive" width="400" height="400" loading="lazy"></picture>
    <p class="coming-soon-name" data-i18n-en="The Archive" data-i18n-th="คลังข้อมูล">The Archive</p>
    <p class="coming-soon-desc i18n-body" data-i18n-en="Life Map, chart comparisons & prophecy log" data-i18n-th="แผนที่ชีวิต เปรียบเทียบดวง และบันทึกคำทำนาย">Life Map, chart comparisons & prophecy log</p>
    <span class="coming-soon-badge" data-i18n-en="Coming Soon" data-i18n-th="เร็วๆ นี้">Coming Soon</span>
  </div>
</div>
```

- [ ] **Step 4: Verify visually**

Expected: 2 full realm cards followed by a compact 3-column teaser strip with Coming Soon badges. On mobile (< 768px), teaser strip stacks vertically.

---

### Task 4: Update section title

**Files:**
- Modify: `index.html:1154`

- [ ] **Step 1: Change "Five Realms of Insight" to "Realms of Insight"**

Before:
```html
<h2 class="section-title reveal" data-i18n-en="Five Realms of Insight" data-i18n-th="ห้าภพแห่งปัญญา">Five Realms of Insight</h2>
```

After:
```html
<h2 class="section-title reveal" data-i18n-en="Realms of Insight" data-i18n-th="ภพแห่งปัญญา">Realms of Insight</h2>
```

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "Simplify realms to v1 scope: 2 full cards + Coming Soon teaser strip"
```

---

## Chunk 2: Pricing Simplification

### Task 5: Verify Freemium tier (no changes needed)

The Freemium pricing card (lines 1311-1326) already contains the correct v1 features: Daily Energy Score, 1 Oracle question per day, Single tarot card draw, Lucky color/number/direction, Siam Si (5x per month), Shareable Soul Snapshot. **No changes needed** — this matches the spec exactly.

---

### Task 6: Remove Premium tier and micro-transactions

**Files:**
- Modify: `index.html:1349-1375` (Premium card + micro-tx div)

- [ ] **Step 1: Delete Premium pricing card**

Remove lines 1349-1365 (the entire `<!-- Premium (Investor) -->` card div).

- [ ] **Step 2: Delete micro-transactions section**

Remove lines 1369-1375 (the entire `<!-- Micro-transactions -->` div).

---

### Task 7: Slim down Standard tier features

**Files:**
- Modify: `index.html:1336-1344`

- [ ] **Step 1: Replace Standard feature list**

Before:
```html
<ul class="pricing-features i18n-body">
  <li data-i18n-en="Unlimited Oracle questions" data-i18n-th="คำถามออราเคิลไม่จำกัด">Unlimited Oracle questions</li>
  <li data-i18n-en="Full 78-card Tarot spreads" data-i18n-th="ไพ่ทาโรต์ 78 ใบเต็มรูปแบบ">Full 78-card Tarot spreads</li>
  <li data-i18n-en="Power Windows (hourly chart)" data-i18n-th="ช่วงเวลาทอง (กราฟรายชั่วโมง)">Power Windows (hourly chart)</li>
  <li data-i18n-en="Auspicious Date Finder" data-i18n-th="ค้นหาวันมงคล">Auspicious Date Finder</li>
  <li data-i18n-en="Partner Compatibility" data-i18n-th="ความเข้ากันได้ของคู่">Partner Compatibility</li>
  <li data-i18n-en="Persistent AI Memory" data-i18n-th="หน่วยความจำ AI ต่อเนื่อง">Persistent AI Memory</li>
  <li data-i18n-en="GPS Temple Recommendations" data-i18n-th="แนะนำวัดด้วย GPS">GPS Temple Recommendations</li>
  <li data-i18n-en="Weekly Digital Amulet" data-i18n-th="พระเครื่องดิจิทัลรายสัปดาห์">Weekly Digital Amulet</li>
</ul>
```

After:
```html
<ul class="pricing-features i18n-body">
  <li data-i18n-en="Everything in Free" data-i18n-th="ทุกอย่างในแพ็คฟรี">Everything in Free</li>
  <li data-i18n-en="Unlimited Oracle questions" data-i18n-th="คำถามออราเคิลไม่จำกัด">Unlimited Oracle questions</li>
  <li data-i18n-en="Siam Si (unlimited)" data-i18n-th="เซียมซี (ไม่จำกัด)">Siam Si (unlimited)</li>
  <li data-i18n-en="Persistent AI Memory" data-i18n-th="หน่วยความจำ AI ต่อเนื่อง">Persistent AI Memory</li>
</ul>
```

---

### Task 8: Update CSS for 2-column pricing grid and remove dead styles

**Files:**
- Modify: `index.html:700` (pricing grid columns)
- Modify: `index.html:857-896` (remove elite + micro-tx styles)
- Modify: `index.html:1090` (remove micro-tx responsive style)

- [ ] **Step 1: Change pricing grid to 2 columns**

Line 700 — change `repeat(3, 1fr)` to `repeat(2, 1fr)`:

```css
grid-template-columns: repeat(2, 1fr);
```

Also update `max-width` from `880px` to `620px` for better proportions with 2 cards.

- [ ] **Step 2: Remove dead CSS for `.pricing-cta-elite`**

Delete lines 857-864:
```css
.pricing-cta-elite {
  color: var(--gold);
  border: 1px solid rgba(201, 168, 76, 0.3);
}

.pricing-cta-elite:hover {
  background: rgba(201, 168, 76, 0.08);
}
```

- [ ] **Step 3: Remove dead CSS for `.micro-tx`, `.micro-tx-pill`, `.micro-tx-price`**

Delete lines 866-896 (the `/* Micro-transactions */` comment block through `.micro-tx-price`).

- [ ] **Step 4: Remove micro-tx responsive rule**

Delete line 1090:
```css
.micro-tx-pill { font-size: 0.65rem; padding: 0.35rem 0.8rem; }
```

- [ ] **Step 5: Verify visually**

Expected: 2-column pricing grid centered on page. No Premium card, no micro-transaction pills.

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "Simplify pricing to 2 tiers: remove Premium, micro-transactions, dead CSS"
```

---

## Chunk 3: Ancillary Changes

### Task 9: Update JSON-LD structured data

**Files:**
- Modify: `index.html:47-51`

- [ ] **Step 1: Remove Premium offer from JSON-LD**

Before:
```json
"offers": [
  { "@type": "Offer", "price": "0", "priceCurrency": "THB", "name": "Freemium" },
  { "@type": "Offer", "price": "149", "priceCurrency": "THB", "name": "Standard" },
  { "@type": "Offer", "price": "299", "priceCurrency": "THB", "name": "Premium" }
]
```

After:
```json
"offers": [
  { "@type": "Offer", "price": "0", "priceCurrency": "THB", "name": "Freemium" },
  { "@type": "Offer", "price": "149", "priceCurrency": "THB", "name": "Standard" }
]
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit -m "Update JSON-LD: remove Premium offer from structured data"
```

---

### Task 10: Final visual QA

- [ ] **Step 1: Open page and check all sections**

Run: `python3 -m http.server 8000` and verify:
1. Realms section shows 2 full cards (Pulse, Oracle) with correct features
2. Coming Soon strip shows 3 compact items below
3. Section title reads "Realms of Insight"
4. Pricing shows 2 cards (Freemium, Standard) in 2-column grid
5. No micro-transaction pills visible
6. Toggle to Thai — all new text has Thai translations
7. Mobile responsive: Coming Soon strip stacks, pricing stacks

- [ ] **Step 2: Final commit if any fixes needed**

```bash
git add index.html
git commit -m "Fix visual QA issues from v1/v2 simplification"
```
