# App Icon Optimization — Mor Doo (หมอดู)

*Generated: 2026-03-24 | Status: Pre-launch*

---

## Current Icon Audit

### iOS Icon (Gold Crystal Ball)

Your current iOS icon is a **gold crystal ball/orb** with celestial elements (constellation lines, stars, flame symbol, eye symbol) on a dark navy background.

```
Clarity at 60×60px:        8/10
  ✅ Strong central orb is recognizable even small
  ⚠️ Constellation details around the edge disappear at small size
  ✅ No text

Color contrast:            9/10
  ✅ Gold on dark navy — excellent contrast on both light and dark App Store backgrounds
  ✅ The glow effect helps the orb pop
  ⚠️ Very slightly dark in the corners — may blend into dark mode

Category differentiation:  8/10
  ✅ Most astrology apps use purple/blue gradients — gold is distinctive
  ✅ Crystal ball is recognizable but not overused
  ⚠️ Co-Star uses a stark black/white star — very different approach

Simplicity:                7/10
  ✅ Central orb is the clear focus
  ⚠️ The surrounding constellation frame adds complexity
  ⚠️ Multiple small elements (eye, flame, compass, stars) clutter the edges
  3-word description: "Gold crystal ball" ✅

Brand alignment:           10/10
  ✅ Matches app's gold (#c9a84c) + dark (#0a0a14) palette perfectly
  ✅ Mystical/celestial theme consistent with app UI
  ✅ Premium feel matches the app's design quality

Overall: 42/50 — STRONG
```

**Verdict:** This is a solid icon. The gold orb is distinctive and brand-aligned. Main improvement opportunity is simplifying the outer frame detail that gets lost at small sizes.

### Android Icon (Blue Chevron)

The Android foreground is a **blue chevron/arrow** — completely unrelated to the app's brand.

```
Overall: NOT USABLE — this appears to be a default Expo placeholder, not a Mordoo icon.
```

**Action Required:** Replace Android adaptive icon assets with the Mordoo gold orb design.

---

## Recommendations

### Keep the Gold Orb Concept

Your iOS icon is strong. Don't redesign — **refine**:

### Refinement 1: Simplify the Border

The constellation frame (lines, dots, small symbols) is elegant at 1024px but invisible at 60px. Options:

| Variant | Change | Effect |
|---------|--------|--------|
| **A: Clean border** | Remove constellation lines, keep only the 4 corner star symbols | Cleaner at small size, orb dominates more |
| **B: No border** | Remove all surrounding elements, just orb + glow on dark bg | Maximum simplicity, strongest silhouette |
| **C: Current** | Keep as-is | Already works well, just complex at small size |

**Recommendation:** Variant A — keep corner stars for visual interest but remove the thin constellation lines.

### Refinement 2: Fix the Black Dot

There's a small **black dot/artifact** on the upper-left of the orb (visible in all variants). Remove it.

### Refinement 3: Android Adaptive Icon

Create proper Android adaptive icon assets using the gold orb:

| Layer | Content |
|-------|---------|
| **Background** | Solid `#0a0a14` (dark navy) |
| **Foreground** | Gold orb with glow, centered in safe zone (66×66dp) |
| **Monochrome** | Simplified orb silhouette for Material You theming |

The orb should be **smaller on Android** than iOS because adaptive icons apply various masks (circle, squircle, rounded square). Keep the orb within the 66dp safe zone center.

### Refinement 4: Strengthen the Glow

The warm glow behind the orb is the key differentiator from competitors who use flat design. Consider:
- Slightly increase glow radius for more presence at small sizes
- Ensure the glow doesn't get clipped by Apple's corner mask

---

## Competitor Icon Comparison

| App | Icon Style | Color | Standout? |
|-----|-----------|-------|-----------|
| **Co-Star** | Black background, white star | B&W | Very distinctive (minimal) |
| **The Pattern** | Dark gradient, geometric pattern | Purple/blue | Elegant but dark |
| **Sanctuary** | Gradient, celestial | Purple/pink | Pretty but generic |
| **Nebula** | Dark, cosmic swirl | Blue/purple | Blends with category |
| **AstroSage** | Orange, bright, busy | Orange/white | Stands out but cluttered |
| **Thai ดูดวง apps** | Bright, cartoony, text-heavy | Mixed | Low quality, cluttered |
| **Mor Doo** | Gold orb, dark, premium | Gold/navy | **Unique in category** |

**Key insight:** Almost every astrology app uses **purple/blue**. Your **gold on dark** is genuinely distinctive. This is a competitive advantage — keep it.

---

## A/B Test Plan (Post-Launch)

Once you have 1,000+ daily impressions, test these variants:

### Test 1: Border Complexity (Week 3-4 post-launch)

| Variant | Description |
|---------|-------------|
| Control | Current icon (full constellation border) |
| Test A | Simplified border (corner stars only) |
| Test B | No border (orb + glow only) |

**Hypothesis:** Simpler variants will have higher TTR at small sizes in search results.

### Test 2: Glow Intensity (Month 2)

| Variant | Description |
|---------|-------------|
| Control | Current glow level |
| Test A | 30% stronger glow (more luminous) |
| Test B | Subtle glow (more matte/premium) |

**Hypothesis:** Stronger glow catches the eye better in a feed of dark icons.

---

## Designer Brief (for Gemini CLI or Designer)

```
App: Mor Doo (หมอดู) — AI-powered Thai astrology app
Category: Lifestyle
Audience: Thai adults 25-45, spiritually curious
Brand colors: Gold #c9a84c, Dark navy #0a0a14
Mood: Premium, mystical, celestial, warm

CURRENT ICON: Gold crystal ball/orb with constellation frame on dark background.
The concept is STRONG — we are REFINING, not redesigning.

TASK: Create 3 variants based on the current icon:

Variant A — "Clean Frame"
- Keep the gold orb exactly as-is (center, glow, reflections)
- Remove constellation lines around the border
- Keep only the 4 decorative symbols at corners (flame top, eye left, star right, compass bottom)
- Remove the thin connecting arcs between them
- Fix: remove the black dot artifact on the orb surface

Variant B — "Pure Orb"
- Gold orb only, centered, with glow on dark navy background
- No surrounding elements at all
- Slightly increase orb size (5-10%) to fill more space
- Fix: remove the black dot artifact

Variant C — "Refined Current"
- Keep current design but:
  - Make constellation lines 30% thicker so they're visible at 60px
  - Slightly increase glow radius
  - Fix: remove the black dot artifact

For EACH variant, deliver:
1. 1024×1024px PNG (no transparency, no rounded corners)
2. 60×60px preview mockup in a simulated App Store search result
3. Android adaptive icon layers:
   - foreground.png (108×108dp equivalent, orb in 66dp safe zone)
   - background.png (solid #0a0a14)
   - monochrome.png (white silhouette on transparent)

IMPORTANT: Match the existing gold color #c9a84c and dark background #0a0a14 exactly.
```

---

## Immediate Action Items

1. **Fix Android icon** — Replace the blue chevron placeholder with gold orb design
2. **Remove black dot** artifact from the current icon
3. **Generate 3 variants** using Gemini CLI with the brief above
4. **Test at 60×60px** — view all variants at actual App Store search result size
5. **Pick the best** for launch, save others for A/B testing post-launch

---

## Next Steps

After icon is finalized:
- `/onboarding-optimization` — Optimize the 6-step onboarding flow
- `/rating-prompt-strategy` — Implement review prompts before beta
- `/monetization-strategy` — Validate pricing and paywall placement
