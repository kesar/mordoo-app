# App Launch Plan — Mor Doo (หมอดู)

*Generated: 2026-03-24 | Type: New app launch | Budget: Bootstrapped | Team: Solo*

---

## Launch Overview

| Parameter | Value |
|-----------|-------|
| **App** | Mor Doo (หมอดู) — AI Astrology Oracle |
| **Platforms** | iOS + Android (simultaneous) |
| **Primary Market** | Thailand |
| **Secondary Market** | Global English |
| **Budget** | Organic-first, minimal paid UA |
| **Pre-existing Audience** | None (cold launch) |
| **Suggested Launch Date** | Week of May 11, 2026 (Monday) |

**Why May 11?** — Gives 7 weeks from today (March 24). Avoids Songkran holiday rush (April 13-15), launches after people return to routine. Monday launches get best press pickup. Buddhist holy day alignment can be a PR angle.

---

## Phase 1: Foundation (Now → April 6) — Weeks 1-2

### ASO & Store Setup

- [x] Keyword research completed (`keyword-research.md`)
- [x] Metadata optimized (`metadata-optimization.md`)
- [x] Screenshot strategy planned (`screenshot-optimization.md`)
- [x] Marketing context established (`app-marketing-context.md`)
- [ ] **Create Apple Developer account** (if not done) — takes 1-2 days approval
- [ ] **Create Google Play Developer account** (if not done) — $25 one-time fee
- [ ] **Reserve app listing** on both stores with placeholder metadata
- [ ] **Generate app screenshots** — use Gemini CLI to create the 10 screenshots per locale (20 total)
- [ ] **Design app icon variants** — test 2-3 options with friends/community
- [ ] **Record app preview video** (30s) — follow storyboard in `screenshot-optimization.md`

### Technical Readiness

- [ ] **Set up analytics** — Expo analytics or Mixpanel for key events:
  - App open, Pulse viewed, Oracle question asked, Siam Si drawn
  - Subscription started, free-to-paid conversion
  - Language toggle, notification permission granted
- [ ] **Implement in-app rating prompt** — trigger after 3rd Pulse view or 2nd Oracle conversation (positive moment)
- [ ] **Set up crash reporting** — Sentry or Firebase Crashlytics via Expo
- [ ] **Test subscriptions end-to-end** — StoreKit sandbox (iOS) + Google Play test track
- [ ] **Verify deep links** — `mordoo://` scheme works for sharing

### Press Kit

Create a `/press` page or folder with:
- [ ] App icon (1024x1024 PNG)
- [ ] 5 best screenshots (both locales)
- [ ] App description (short: 1 paragraph, long: full)
- [ ] Founder story (1-2 paragraphs) — "Why I built a Thai astrology AI app"
- [ ] Key facts (features, pricing, platforms, languages)
- [ ] Contact email for press inquiries

---

## Phase 2: Beta & Content (April 7 → April 20) — Weeks 3-4

### TestFlight / Internal Testing

- [ ] **Recruit 30-50 beta testers** via:
  - Thai tech/spirituality Facebook groups
  - Thai Twitter/X astrology community
  - Personal network
  - r/Thailand, r/astrology Reddit (carefully — contribute first)
- [ ] **Run TestFlight (iOS)** + **Internal test track (Android)** for 2 weeks
- [ ] **Collect structured feedback** — Google Form with:
  - "What's your favorite feature?"
  - "What's confusing?"
  - "Would you pay ฿149/month? Why or why not?"
  - "Rate 1-5: design, usefulness, fun"
- [ ] **Fix critical bugs** from feedback
- [ ] **Ask beta testers to commit** to leaving a review on launch day

### Content Preparation

- [ ] **Write 10 social media posts** for launch week:
  1. Teaser: "Something mystical is coming..." + app icon
  2. Feature reveal: Siam Si demo GIF
  3. Feature reveal: Oracle AI conversation screenshot
  4. Feature reveal: Pulse energy score
  5. Behind-the-scenes: "Building a Thai astrology AI"
  6. Cultural story: "The tradition of Siam Si"
  7. Launch countdown: "3 days..."
  8. Launch day: "Mor Doo is live!"
  9. Day 2: User testimonial or first review
  10. Week 1: "Thank you" + download milestone

- [ ] **Create short demo videos** (15-30s, vertical) for:
  - TikTok / Reels: Siam Si shake → result reveal
  - TikTok / Reels: "Ask the AI Oracle about your love life"
  - TikTok / Reels: "Your daily energy score in 10 seconds"

- [ ] **Draft blog/Medium post**: "Why I Built an AI-Powered Thai Astrology App"
  - Personal story angle
  - Thai cultural context (Siam Si tradition)
  - Technical angle (Claude AI, React Native)
  - Include screenshots

### Community Seeding

- [ ] **Identify Thai communities** to post in:
  - Facebook: ดูดวง groups, Thai tech groups, Thai startup groups
  - Twitter/X: Thai astrology accounts, Thai indie dev community
  - Pantip (Thai forum): ดูดวง, เทคโนโลยี boards
  - LINE OpenChat: Astrology/horoscope groups
- [ ] **Start engaging** in these communities NOW (don't just show up on launch day)
- [ ] **Identify 10-15 Thai micro-influencers** (5K-50K followers) in:
  - Astrology / horoscope niche
  - Lifestyle / wellness
  - Tech / app reviews
  - Offer free Standard tier for 3 months in exchange for honest review

---

## Phase 3: Pre-Launch (April 21 → May 4) — Weeks 5-6

### App Submission

- [ ] **Submit iOS app** for review — allow 3-5 day buffer
  - Upload all 10 screenshots (EN + TH locales)
  - Set metadata (title, subtitle, keywords, description)
  - Set pricing (Free with IAP)
  - Set app rating questionnaire
  - Enable pre-order if approved early
- [ ] **Submit Android app** to Google Play
  - Upload screenshots, short description, full description
  - Set up pricing and subscription products
  - Target production track (or open testing first)
- [ ] **Set release date** to May 11, 2026 (manual release — you control the moment)

### Press Outreach

- [ ] **Send personalized pitches** to 15-20 contacts:

  **Thai press/blogs:**
  - Beartai (เบียร์ไทย) — Thai tech blog
  - Droidsans — Thai mobile/tech
  - Blognone — Thai tech news
  - Thai tech YouTubers covering app reviews
  - Thai lifestyle bloggers interested in astrology

  **English/International:**
  - AppAdvice
  - 9to5Mac (if there's an Apple angle)
  - ProductHunt (schedule launch)
  - IndieHackers

- [ ] **Pitch angle for Thai press:**
  > "Thai developer builds AI-powered Siam Si app — blending centuries-old temple tradition with modern AI for ฿149/month"

- [ ] **Pitch angle for international press:**
  > "Mor Doo brings authentic Thai astrology to the world — the first app combining Siam Si fortune sticks with AI-powered personalized readings"

- [ ] **Set embargo**: Lift on May 11 at 9:00 AM (Bangkok time, GMT+7)

### Apple Editorial Submission

- [ ] **Submit for Apple featuring** via App Store Connect → "Promote Your App"
  - Highlight: First Thai astrology AI app
  - Highlight: Cultural authenticity (Siam Si tradition)
  - Highlight: Bilingual design (Thai + English)
  - Highlight: Beautiful dark theme design
  - Highlight: Respectful monetization (generous free tier)
- [ ] **Submit for Google Play featuring** via Play Console → "Promotions" tab

### Final Testing

- [ ] Full end-to-end test on 3+ real devices
- [ ] Test both languages completely
- [ ] Verify subscription flow (purchase, restore, cancel)
- [ ] Test notification scheduling
- [ ] Verify API endpoints under load (10-50 concurrent users)
- [ ] Check Supabase RLS policies one more time

---

## Phase 4: Launch Week (May 5-10) — Week 7 (Pre-Launch Buffer)

### Final Countdown

- [ ] **Monday May 5:** Post teaser on all channels ("6 days...")
- [ ] **Tuesday May 6:** Share Siam Si demo video
- [ ] **Wednesday May 7:** Share Oracle AI conversation screenshot
- [ ] **Thursday May 8:** Share behind-the-scenes / founder story
- [ ] **Friday May 9:** "This Monday: Your cosmic journey begins"
- [ ] **Saturday May 10:** Prep all launch day materials, test links, pre-schedule posts
- [ ] **Confirm** beta testers are ready to review
- [ ] **Confirm** press contacts received the app and embargo details
- [ ] **Prepare** App Store Connect / Play Console for release

---

## Phase 5: Launch Day — May 11, 2026 (Monday)

### Morning (8:00-10:00 AM Bangkok Time)

- [ ] **Release the app** on both stores (hit the button!)
- [ ] **Verify** both store listings are live and correct
- [ ] **Post launch announcement** on all channels simultaneously:
  - Personal Twitter/X, Facebook, Instagram, LinkedIn
  - App social accounts (if created)
  - Thai communities (Facebook groups, Pantip, LINE)
- [ ] **Send press embargo lift emails**: "Mor Doo is now live — embargo lifted"
- [ ] **Email beta testers**: "We're live! Please leave your review now"
- [ ] **Submit to Product Hunt** (if prepared)
- [ ] **Post on Indie Hackers** / Hacker News (Show HN)

### Throughout the Day

- [ ] **Monitor downloads** in App Store Connect + Play Console every 2-3 hours
- [ ] **Respond to EVERY review** within 2 hours — personal, grateful, thoughtful
- [ ] **Engage with social media mentions** — retweet, thank, amplify
- [ ] **Monitor crash reports** — if anything critical, hotfix immediately
- [ ] **Monitor API/Supabase** — watch for quota errors, rate limits, DB issues
- [ ] **Share milestones** as they happen:
  - "100 downloads!" / "First 5-star review!" / "Top 100 in Lifestyle!"

### Evening

- [ ] **Thank early adopters** publicly
- [ ] **Screenshot** any chart positions or milestones
- [ ] **Plan tomorrow's content** based on what resonated today

---

## Phase 6: Post-Launch (May 12 → June 11) — Month 1

### Week 1 (May 12-18)

- [ ] Continue daily social posting
- [ ] Respond to all reviews (both stores)
- [ ] Check keyword rankings — are you indexing for target keywords?
- [ ] Follow up with press who didn't respond
- [ ] Share user testimonials (with permission)
- [ ] Monitor Day-1 and Day-3 retention rates

### Week 2 (May 19-25)

- [ ] Run first `aso-audit` with real data
- [ ] Adjust keyword field based on actual ranking data
- [ ] Identify top acquisition channels (where are users coming from?)
- [ ] Plan first app update based on user feedback
- [ ] Consider starting Apple Search Ads (small budget: ฿500-1,000/day)

### Week 3-4 (May 26 → June 11)

- [ ] A/B test screenshots (`/ab-test-store-listing`)
- [ ] Submit first update (bug fixes + top requested feature)
- [ ] Set up In-App Events for visibility
- [ ] Evaluate free-to-paid conversion rate
- [ ] Plan Month 2 content calendar

---

## Success Metrics

### Week 1 Targets

| Metric | Target | How to Measure |
|--------|--------|---------------|
| Total downloads | 500+ | App Store Connect + Play Console |
| Day-1 retention | 50%+ | Analytics |
| App Store rating | 4.5+ | Store listings |
| Reviews count | 15+ | Store listings |
| Crash-free rate | 99%+ | Crashlytics |

### Month 1 Targets

| Metric | Target | How to Measure |
|--------|--------|---------------|
| Total downloads | 2,000+ | Store analytics |
| Day-7 retention | 40%+ | Analytics |
| Free-to-paid conversion | 3-5% | Subscription analytics |
| Monthly revenue | ฿5,000+ | App Store Connect |
| Keyword rankings | Top 50 for 5+ keywords | ASO tool |
| Category ranking (Thailand) | Top 200 Lifestyle | Store charts |

### Month 3 Targets

| Metric | Target | How to Measure |
|--------|--------|---------------|
| Total downloads | 10,000+ | Store analytics |
| Day-30 retention | 20%+ | Analytics |
| Monthly revenue | ฿20,000+ | Store analytics |
| Paying subscribers | 200+ | Subscription dashboard |
| Average rating | 4.5+ | Store listings |
| Category ranking (Thailand) | Top 50 Lifestyle | Store charts |

---

## Channel Strategy (Organic-First)

### Priority 1: Thai Communities (Highest ROI for Zero Budget)

| Channel | Action | Expected Impact |
|---------|--------|----------------|
| **Facebook groups** | Post in 5-10 ดูดวง/horoscope groups | 500+ impressions each |
| **Pantip** | Create thread in ดูดวง + เทคโนโลยี boards | 1,000+ views |
| **LINE OpenChat** | Share in astrology/lifestyle groups | Direct, engaged audience |
| **Thai Twitter/X** | Launch thread + engage astrology accounts | Network effect |
| **TikTok (Thai)** | 3 short demo videos (Siam Si, Oracle, Pulse) | Viral potential |

### Priority 2: English/Global (Brand Building)

| Channel | Action | Expected Impact |
|---------|--------|----------------|
| **Product Hunt** | Launch with demo, screenshots, story | 100-500 visits |
| **Reddit** | r/astrology, r/numerology, r/Thailand | Niche traffic |
| **Twitter/X** | Build-in-public thread | Dev community |
| **Indie Hackers** | Launch post + revenue updates | Founder community |

### Priority 3: Micro-Influencers (Low/No Cost)

| Type | Quantity | Offer | Expected Impact |
|------|----------|-------|----------------|
| Thai astrology creators | 5-8 | Free Standard 3mo | 500-2,000 installs each |
| Thai lifestyle bloggers | 3-5 | Free Standard 3mo | 200-500 installs each |
| Thai tech reviewers | 2-3 | Free Standard 3mo | 300-1,000 installs each |

---

## Budget Allocation (If Any Budget Available)

| Channel | Monthly Budget | Expected CPI | Expected Installs |
|---------|:-------------:|:------------:|:-----------------:|
| Apple Search Ads (Thailand) | ฿3,000 | ฿5-15 | 200-600 |
| Facebook/IG ads (Thailand) | ฿2,000 | ฿3-8 | 250-650 |
| Micro-influencer gifts | ฿0 (free tier) | ฿0 | 500-2,000 |
| **Total** | **฿5,000/mo** | — | **950-3,250** |

If no budget: skip paid UA entirely and focus on organic + influencer outreach. The app's unique angle (Thai tradition + AI) is inherently shareable.

---

## Risk Mitigation

| Risk | Mitigation |
|------|-----------|
| App rejection (Apple) | Submit 5+ days early; follow guidelines strictly; no placeholder content |
| Low reviews at launch | Pre-commit 20+ beta testers to review Day 1 |
| API costs spike | Set Claude API spending limits; monitor Vercel usage |
| Negative reviews | Respond personally within 2 hours; fix issues fast |
| Low conversion to paid | Adjust free tier limits after Month 1 data |
| Server downtime | Set up Vercel alerts; have Supabase dashboard bookmarked |

---

## Quick Reference: Key Dates

| Date | Milestone |
|------|-----------|
| **Mar 24** | Marketing context, keywords, metadata, screenshots planned |
| **Apr 6** | Screenshots generated, press kit ready, analytics set up |
| **Apr 20** | Beta feedback collected, content created, bugs fixed |
| **May 4** | App submitted to stores, press pitched, communities seeded |
| **May 5-10** | Countdown content posted daily |
| **May 11** | **LAUNCH DAY** |
| **May 18** | Week 1 review — adjust keywords, respond to all reviews |
| **Jun 11** | Month 1 review — first ASO audit with real data |
| **Aug 11** | Month 3 review — evaluate growth trajectory |

---

## Documents Created in This Series

| Document | Purpose |
|----------|---------|
| `app-marketing-context.md` | Positioning, audience, competitors, goals |
| `keyword-research.md` | Target keywords for Thai + English stores |
| `metadata-optimization.md` | Title, subtitle, keywords, descriptions (both locales) |
| `screenshot-optimization.md` | 10-screenshot plan with design brief |
| `app-launch-plan.md` | This document — full launch timeline and checklist |

---

## Next Steps (Immediate)

1. **Generate screenshot assets** — use Gemini CLI with the design brief
2. **Set up analytics + crash reporting** — before beta
3. **Recruit beta testers** — start posting in Thai communities this week
4. **Build press kit** — founder story + key assets
5. **Submit to stores** — as soon as screenshots and metadata are ready
