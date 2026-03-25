# Apple App Store Featuring Strategy: Mor Doo (หมอดู)

> **Last updated:** 2026-03-25
> **Target launch:** May 11, 2026
> **Pitch window:** Late April 2026 (2-3 weeks before launch)

---

## 1. Featuring Readiness Score

| Factor | Score | Progress | Notes |
|---|---|---|---|
| Design Quality | 9/10 | `█████████░` | Exceptional dark mystical theme, gold accents, constellation animations. Premium feel that rivals native apps. |
| Unique Value Proposition | 9/10 | `█████████░` | Siam Si (28 fortune sticks) has zero competition in the App Store. Genuine cultural IP. |
| AI Integration | 8/10 | `████████░░` | Claude-powered Oracle chat is a strong differentiator. SSE streaming feels responsive. |
| Localization / Bilingual | 8/10 | `████████░░` | Natively Thai + English from day one. Not bolted-on — both languages are first-class citizens. |
| Privacy & Business Model | 8/10 | `████████░░` | No ads, minimal tracking, clean subscription model. Apple loves this. |
| Accessibility | 3/10 | `███░░░░░░░` | No confirmed VoiceOver audit, Dynamic Type support unclear. Major gap. |
| Apple Platform Tech | 2/10 | `██░░░░░░░░` | No WidgetKit, no App Intents, no Live Activities, no App Clips. Biggest weakness. |
| Native Framework | 3/10 | `███░░░░░░░` | React Native + Expo, not SwiftUI. Apple editorial strongly favors native. This is the hardest gap to close. |
| iPad Support | 1/10 | `█░░░░░░░░░` | No iPad optimization. Apple expects universal apps for featuring. |
| App Store Rating | 0/10 | `░░░░░░░░░░` | Pre-launch. No ratings, no reviews, no track record. |
| App Store Listing Quality | 6/10 | `██████░░░░` | TBD — needs polished screenshots, preview video, compelling description. |
| Track Record / Updates | 0/10 | `░░░░░░░░░░` | New app, no update history. Apple favors apps with consistent improvement. |

### Overall Readiness

| | |
|---|---|
| **Raw Score** | **57 / 120** |
| **Weighted Score (featuring likelihood)** | **~42 / 100** |
| **Honest Assessment** | Not ready to pitch today. Fixable to ~65/100 by launch with targeted work. |

**Reality check:** React Native apps *can* get featured — Shopify, Discord, and Bloomberg all use RN — but they compensate with massive user bases or deep Apple tech adoption. As a solo-dev pre-launch RN app, the bar is higher. The cultural angle is the ace card.

---

## 2. Action Plan Before Pitching

Prioritized by impact-to-effort ratio. Complete items marked **Critical** before submitting a pitch.

### Critical (Must-Do Before Pitch)

| Priority | Action | Effort | Impact | Why |
|---|---|---|---|---|
| 1 | **Accessibility audit (VoiceOver + Dynamic Type)** | 3-5 days | High | Apple rejects pitches from apps that fail basic accessibility. Non-negotiable. |
| 2 | **Lock Screen / Home Screen widget** (daily Prana Index) | 5-7 days | Very High | Single most impactful Apple tech adoption. Widgets are a flagship feature Apple promotes heavily. Requires a native Swift extension — Expo has `expo-widgets` (community) or build a custom config plugin. |
| 3 | **App Store listing polish** — screenshots (6.7" + 6.1"), preview video, keyword-optimized description | 3-4 days | High | Apple editorial judges the listing before the app. Thai + English screenshot sets. |
| 4 | **Soft launch 2-3 weeks early** to accumulate ratings | 0 days (scheduling) | High | Even 50 ratings at 4.7+ dramatically improve pitch credibility. Use TestFlight beta testers to seed early reviews. |

### High Priority (Strongly Recommended)

| Priority | Action | Effort | Impact | Why |
|---|---|---|---|---|
| 5 | **App Intents + Siri Shortcuts** ("What's my Prana Index?") | 3-4 days | High | Shows Apple tech investment. "Hey Siri, what's my energy today?" is a compelling demo moment. |
| 6 | **iPad basic layout support** | 2-3 days | Medium | Doesn't need to be iPad-optimized, but must not look broken. Centered layout with max-width is acceptable. |
| 7 | **In-App Events setup** (self-serve, no pitch needed) | 1 day | Medium | Free featuring opportunity. Set up a launch event + Songkran event immediately. |
| 8 | **Privacy Nutrition Labels** — ensure accuracy | 0.5 days | Medium | Apple editorial checks this. Incorrect labels are disqualifying. |

### Nice-to-Have (Post-Launch)

| Priority | Action | Effort | Impact |
|---|---|---|---|
| 9 | App preview video with Siam Si stick animation | 2-3 days | Medium |
| 10 | StoreKit 2 direct integration (replacing RevenueCat) | 5+ days | Low-Medium |
| 11 | Live Activity for active Oracle reading session | 3-4 days | Medium |

### Recommended Pre-Pitch Timeline

```
March 25 - April 5:   Accessibility audit + fixes
April 1 - April 10:   Build Lock Screen widget (Prana Index)
April 5 - April 8:    App Intents / Siri Shortcuts
April 8 - April 12:   App Store listing (screenshots, video, copy)
April 12 - April 15:  iPad basic support
April 15 - April 18:  Final QA pass
April 18:             Submit app for review
April 20:             Submit featuring pitch (2-3 weeks before May 11)
April 25:             Soft launch (limited markets or TestFlight public link)
May 11:               Official launch
```

---

## 3. Pitch Strategy

### Timing

- **Submit pitch:** April 18-22, 2026 (2-3 weeks before May 11 launch)
- **Via:** https://developer.apple.com/contact/app-store/promote/
- **Follow up:** One polite follow-up email 5 days later if no response

### Story Angles (Ranked by Strength)

| Rank | Angle | Strength | Why It Works |
|---|---|---|---|
| 1 | **Cultural preservation** — "Bringing centuries-old Thai Siam Si tradition to the digital age" | Very Strong | Apple loves cultural storytelling. Siam Si (fortune sticks from Thai temples) is a unique, photogenic tradition with no digital equivalent. This is the lead angle. |
| 2 | **AI meets ancient wisdom** — "Where centuries-old Thai astrology meets modern AI" | Strong | AI is the hottest topic in tech. Framing it as AI that *respects* tradition (not replaces it) is a fresh narrative vs. generic "AI chatbot" apps. |
| 3 | **Indie developer authenticity** — Solo Thai developer building a culturally authentic app | Strong | Apple actively promotes indie developers. The "built by someone who grew up with this tradition" story is genuine and compelling. |
| 4 | **Bilingual by design** — Natively Thai and English, not a translation | Moderate | Shows thoughtful internationalization. Less unique as a standalone angle but strengthens the other narratives. |

### Pitch Email Draft

> **Subject:** Mor Doo — AI-Powered Thai Astrology Launching May 11 (Featuring Consideration)
>
> **To:** App Store Editorial Team
> **Via:** https://developer.apple.com/contact/app-store/promote/
>
> ---
>
> Hi App Store team,
>
> I'm writing to share **Mor Doo (หมอดู)**, an AI-powered Thai astrology app launching on **May 11, 2026**. It brings a centuries-old Thai temple tradition — Siam Si fortune sticks — into the digital age, paired with a conversational AI Oracle for personalized spiritual guidance.
>
> ### What makes Mor Doo unique
>
> **Siam Si (เซียมซี)** is a beloved fortune-telling tradition found in Thai temples: you shake a bamboo cylinder until a single numbered stick falls out, then receive a poetic fortune. Millions of Thai people do this every temple visit, yet no app has authentically recreated this experience — until now. Mor Doo features all 28 traditional fortune sticks, each with their original poetic verses, brought to life with immersive animations on iOS.
>
> Beyond Siam Si, Mor Doo includes:
> - **Daily Pulse** — A personalized daily energy reading based on Thai numerology
> - **AI Oracle** — A conversational astrology advisor powered by Claude AI that interprets readings in the context of your life
> - **Bilingual experience** — Built natively in Thai and English, not translated
>
> ### Design philosophy
>
> Mor Doo uses a dark celestial theme with gold accents and constellation animations, designed to feel like opening a mystical portal. The UI draws from traditional Thai temple aesthetics while feeling thoroughly modern on iOS.
>
> ### Technical highlights
> - Lock Screen widget showing daily Prana Index energy score
> - Siri Shortcuts integration ("What's my energy today?")
> - Full VoiceOver and Dynamic Type accessibility
> - Privacy-first: no ads, no tracking beyond essential analytics
> - Clean subscription model (free tier + Standard at ฿149/month)
>
> ### About me
>
> I'm a solo developer based in Thailand building Mor Doo as a passion project. I grew up visiting temples and drawing Siam Si sticks with my family, and I wanted to preserve that experience for a generation that lives on their phones. Every fortune verse, every cultural detail is authentic — not generated or approximated.
>
> ### Links
> - **App Store:** [link to pre-order page]
> - **Preview video:** [link]
> - **Press kit:** [link to screenshots and assets]
>
> I'd be grateful for any featuring consideration, whether on the Today tab, in a cultural collection, or through In-App Events. Mor Doo launches May 11 and I'd love for the App Store team to experience it.
>
> Thank you for your time.
>
> Best regards,
> [Your Name]
> Independent Developer, Thailand

### Pitch Attachments Checklist

- [ ] 3-5 high-resolution screenshots (iPhone 16 Pro Max)
- [ ] 15-30 second app preview video
- [ ] App icon in high resolution (1024x1024)
- [ ] Press kit ZIP with all assets
- [ ] TestFlight link or promo code for editorial team

---

## 4. Apple Tech Adoption Roadmap

Each phase adds Apple platform integration to increase featuring eligibility over time.

### Phase 1: v1.1 (Target: June 2026)

**Lock Screen + Home Screen Widget — Daily Prana Index**

| Detail | Value |
|---|---|
| **What** | A small widget showing today's Prana Index score (1-100) with a color-coded ring (gold/red/green) and one-line fortune. Lock Screen variant shows just the number + emoji. |
| **Why** | Widgets are Apple's most-promoted feature category. A daily-updating astrology widget has high glanceability and drives daily engagement. |
| **Effort** | 5-7 days. Requires a native Swift widget extension. Use `expo-apple-targets` or a custom Expo config plugin. Widget reads cached data from a shared App Group container. |
| **Featuring Impact** | **Very High.** Widget screenshots alone make App Store listings more compelling. Apple actively promotes "great widget experiences." |
| **Tech** | WidgetKit (SwiftUI), App Groups for data sharing, TimelineProvider for daily refresh. |

### Phase 2: v1.2 (Target: August 2026)

**App Intents + Siri Shortcuts**

| Detail | Value |
|---|---|
| **What** | "Hey Siri, what's my Prana Index today?" returns today's score and brief fortune. "Hey Siri, draw a Siam Si stick" triggers a fortune draw. Both available as Shortcuts actions. |
| **Why** | App Intents is Apple's current strategic focus. Showing up in Shortcuts and Spotlight makes the app feel system-integrated. |
| **Effort** | 3-4 days. Requires Swift App Intents framework. Simpler than widgets — just needs to read cached data and return a result. |
| **Featuring Impact** | **High.** Apple features apps that adopt new frameworks early. App Intents is still under-adopted, so standing out is easier. |
| **Tech** | App Intents framework, SiriKit donation, Spotlight integration. |

### Phase 3: v2.0 (Target: November 2026)

**iPad Optimization**

| Detail | Value |
|---|---|
| **What** | Proper iPad layout — multi-column navigation, larger card layouts, optimized for landscape. Not just a scaled-up iPhone. |
| **Why** | Apple expects featured apps to be universal. iPad users are high-value subscribers. |
| **Effort** | 7-10 days. Significant layout work across all screens. React Native responsive design with breakpoints. |
| **Featuring Impact** | **Medium.** Removes a disqualifying factor rather than adding a positive one. Unlocks iPad App Store featuring (separate editorial). |
| **Tech** | React Native responsive layouts, `useWindowDimensions`, conditional navigation structure. |

### Phase 4: v2.x (Target: Early 2027)

**App Clip for Siam Si**

| Detail | Value |
|---|---|
| **What** | A lightweight App Clip that lets anyone draw a Siam Si fortune stick without downloading the full app. Shareable via link, QR code, or NFC tag. Imagine QR codes at actual Thai temples that let visitors draw a digital stick. |
| **Why** | App Clips are underused and Apple wants to promote them. A temple QR code tying physical and digital is an incredible story for Apple editorial. |
| **Effort** | 10-14 days. App Clips must be under 15MB and built with native SwiftUI or a very slim RN bundle. Likely requires a native SwiftUI implementation of just the Siam Si flow. |
| **Featuring Impact** | **Very High** (if paired with real-world temple partnerships). The physical-digital bridge is exactly the kind of story Apple loves to tell on the Today tab. |
| **Tech** | App Clip target (SwiftUI), App Clip card metadata, universal links, optional NFC triggers. |

### Roadmap Summary

```
v1.0  May 2026     Launch (accessibility, basic iPad, In-App Events)
v1.1  June 2026    Lock Screen widget (Prana Index)        ███████████ High Impact
v1.2  Aug 2026     App Intents + Siri Shortcuts            ████████░░░ High Impact
v2.0  Nov 2026     iPad optimization                       █████░░░░░░ Medium Impact
v2.x  Early 2027   App Clip for Siam Si                    ███████████ Very High Impact
```

---

## 5. Alternative Featuring Paths

Since getting a flagship "App of the Day" feature is extremely competitive (especially for React Native apps), these alternative paths offer realistic featuring opportunities.

### 5a. In-App Events (Self-Serve — No Pitch Needed)

| Detail | Value |
|---|---|
| **What** | Promotional events that appear on your App Store product page and in search results. You create them in App Store Connect — no editorial approval for basic visibility. |
| **Why** | **This is the single highest-value action for a new app.** Free, self-serve, and gives you App Store real estate you control. |
| **Effort** | 1-2 hours per event |
| **Availability** | Immediately at launch |

**Recommended events for 2026:**

| Event | Date | Type | Badge |
|---|---|---|---|
| "Grand Opening — Draw Your First Fortune" | May 11, 2026 | Launch | `New` |
| "Songkran Fortune Festival" (สงกรานต์) | April 13, 2027* | Seasonal | `Event` |
| "Loy Krathong Blessings" (ลอยกระทง) | November 2026 | Seasonal | `Event` |
| "New Year Oracle — Your 2027 Reading" | Dec 28, 2026 | Seasonal | `Event` |
| "Makha Bucha Day Special" | Feb 2027 | Cultural | `Event` |

*Plan Songkran for year two — it's Thailand's biggest holiday and a perfect fit.

### 5b. Today Tab Story Pitch

| Detail | Value |
|---|---|
| **What** | A long-form editorial story on the App Store Today tab. Written by Apple's editorial team, featuring the app's story and screenshots. |
| **Angle** | Cultural preservation: "How a solo developer is bringing Thailand's temple fortune-telling tradition to iPhone." The Siam Si angle is genuinely unique — no other app has this. |
| **Likelihood** | Moderate. Apple publishes cultural stories regularly, especially for non-US markets. The Thai App Store has far less competition for editorial than the US store. |
| **How** | Same pitch form. Emphasize the cultural story, include compelling visuals of the Siam Si experience. |

### 5c. Collection Featuring

Target these App Store collections:

| Collection | Fit | Likelihood |
|---|---|---|
| **"Apps We Love"** (Lifestyle) | Strong — astrology is a major Lifestyle subcategory | Moderate |
| **"Apps We Love"** (Health & Wellness) | Moderate — daily mindfulness/self-reflection angle | Low-Moderate |
| **"Great Apps for Mindfulness"** | Moderate — position daily Pulse as a mindfulness check-in | Moderate |
| **"Hidden Gems"** | Strong — indie, unique, well-designed | Moderate-High |
| **"Made in Thailand"** (if it exists/seasonal) | Very Strong — cultural authenticity + Thai language | High |

### 5d. Regional Featuring (Thailand App Store)

| Detail | Value |
|---|---|
| **Why** | The Thailand App Store has far fewer apps competing for editorial attention. An app that is authentically Thai, bilingual, and well-designed has a much stronger chance of featuring in the Thai store than the US store. |
| **Strategy** | Pitch to Apple's **Thailand regional editorial team** specifically. Mention that the app preserves Thai cultural heritage. Apple has regional editorial teams who curate for local markets. |
| **Likelihood** | **High** — this is the most realistic featuring path. |
| **Impact** | Thailand featuring drives your primary market. If the app performs well in Thailand, it may be surfaced to global editorial. |

### 5e. Seasonal and Cultural Featuring Opportunities

Thai cultural calendar alignment is a unique advantage. No Western astrology app can credibly tie into these events.

| Event | Date | Featuring Angle | Action |
|---|---|---|---|
| **Songkran (Thai New Year)** | April 13-15 | "Start the new year with your fortune" — In-App Event + pitch | Set up themed content + In-App Event |
| **Makha Bucha Day** | Feb (varies) | Buddhist holiday — spiritual reflection theme | In-App Event |
| **Visakha Bucha Day** | May (varies) | Most important Buddhist holiday | In-App Event |
| **Loy Krathong** | November (full moon) | "Release your worries, discover your fortune" | In-App Event + themed UI |
| **Chinese New Year** | Jan/Feb | Overlaps with Thai-Chinese astrology traditions | In-App Event |
| **Western New Year** | Dec 31-Jan 1 | "Your 2027 Oracle Reading" — universal hook | In-App Event |
| **Halloween / Day of the Dead** | October | Mystical/spiritual apps get promoted globally | In-App Event (English markets) |

### 5f. Featuring Path Priority Matrix

| Path | Effort | Likelihood | Impact | Priority |
|---|---|---|---|---|
| In-App Events | Very Low | Guaranteed | Medium | **Do immediately** |
| Thailand regional pitch | Low | High | High | **Primary pitch target** |
| Today Tab cultural story | Medium | Moderate | Very High | **Include in pitch** |
| "Hidden Gems" collection | Low (part of pitch) | Moderate-High | High | **Include in pitch** |
| Seasonal featuring (Songkran, Loy Krathong) | Low | Moderate | Medium-High | **Plan for year one** |
| Global "Apps We Love" | Low (part of pitch) | Low | Very High | **Aspirational** |

---

## Summary: The Honest Path to Featuring

**The hard truth:** A pre-launch React Native app from a solo developer has roughly a 5-10% chance of getting flagship App Store featuring (App of the Day, top Today Tab story) at launch.

**The realistic strategy:**

1. **Maximize self-serve featuring** (In-App Events) — 100% in your control
2. **Target Thailand regional featuring** — far less competitive, culturally authentic angle is very strong
3. **Add one flagship Apple tech** (Lock Screen widget) before pitching — transforms the narrative from "React Native app" to "app that embraces Apple platform"
4. **Lead with the cultural story** — Siam Si is genuinely unique and Apple loves cultural preservation narratives
5. **Build featuring eligibility over v1.1-v2.0** — each update adds Apple tech, each update is a new pitch opportunity
6. **Play the long game** — most featured apps were featured on their 3rd or 4th pitch, not their first

The cultural angle (Siam Si tradition preservation) and Thailand regional targeting are the two strongest cards in this hand. Play them first and loudly.
