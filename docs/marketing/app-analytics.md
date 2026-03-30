# App Analytics Plan — Mor Doo (หมอดู)

*Updated: 2026-03-25 | Status: Pre-launch | Analytics: PostHog (installed)*

---

## Current State

| Component | Status |
|-----------|--------|
| Analytics SDK | **PostHog installed** (`posthog-react-native`) |
| Event tracking | **Service wrapper created** (`src/services/analytics.ts`) |
| Feature flags | **Available** (via PostHog) |
| Session replay | **Available** (enable when ready) |
| Crash reporting | **None** (Sentry planned) |
| Revenue analytics | **None** (planned via RevenueCat) |
| App Store Connect | Not yet set up (pre-launch) |

---

## Analytics Stack

| Tool | Purpose | Cost | Priority |
|------|---------|:----:|:--------:|
| **PostHog** | Product analytics, funnels, cohorts, feature flags, session replay | Free (1M events/mo cloud) | Must have |
| **Sentry** (via expo-sentry) | Crash reporting + performance | Free (up to 5K events/mo) | Must have |
| **RevenueCat** | Subscription analytics | Free (up to $2,500/mo) | Must have (from monetization plan) |
| **App Store Connect** | Store metrics, downloads, conversion | Free | Automatic |
| **Google Play Console** | Store metrics (Android) | Free | Automatic |

### Why PostHog

| Factor | PostHog | Mixpanel | Firebase Analytics |
|--------|---------|----------|-------------------|
| Free tier | 1M events/mo (cloud), unlimited (self-host) | 20M events/mo | Unlimited |
| Feature flags | Built-in | No | Remote Config (separate) |
| Session replay | Yes (RN beta) | No | No |
| Funnels | Good | Best-in-class | Limited |
| Cohort analysis | Built-in | Built-in | Requires BigQuery |
| Real-time | Yes | Yes | 24-hour delay |
| React Native SDK | Official | Official | react-native-firebase (heavy) |
| Setup complexity | API key | API key | google-services.json + pods |
| Self-host option | Yes (unlimited, free) | No | No |
| Data ownership | Yours (if self-hosted) | Their servers | Google |

PostHog gives analytics + feature flags + session replay in one SDK. Replaces the need for Mixpanel + LaunchDarkly.

---

## Installation (Done)

```bash
npm install posthog-react-native
```

### Analytics Service (`src/services/analytics.ts`)

```typescript
import PostHog from 'posthog-react-native';

export const posthog = new PostHog(POSTHOG_API_KEY, { host: POSTHOG_HOST });

export const analytics = {
  identify(userId, properties?)  // Link user to events
  track(event, properties?)      // Track custom events
  screen(screenName, properties?) // Track screen views
  reset()                        // On logout
  setPersonProperties(properties) // Update user properties
  isFeatureEnabled(flag)         // Check feature flag
  getFeatureFlag(flag)           // Get flag value
  reloadFeatureFlags()           // Refresh flags from server
};
```

### Root Layout Integration (`app/_layout.tsx`)

- `PostHogProvider` wraps the app for autocapture
- `useAnalytics` hook handles identify/reset on auth changes and session tracking

---

## Event Tracking Plan

### Onboarding Events

| Event | When | Properties |
|-------|------|------------|
| `onboarding_started` | Soul Gate loads | `language` |
| `onboarding_language_selected` | Language chosen | `language` |
| `onboarding_auth_method_selected` | Auth button tapped | `method: phone\|apple\|google` |
| `onboarding_otp_sent` | OTP requested | — |
| `onboarding_otp_verified` | OTP verified | — |
| `onboarding_otp_failed` | OTP failed | `error` |
| `onboarding_birth_data_completed` | Birth data submitted | `has_time, has_gender` |
| `onboarding_name_completed` | Name entered | `has_phone, has_car_plate` |
| `onboarding_snapshot_viewed` | Soul Snapshot seen | `energy_score` |
| `onboarding_completed` | Entered main app | `total_time_seconds, steps_completed` |
| `onboarding_abandoned` | App closed during onboarding | `last_step, time_spent` |

### Core Feature Events

| Event | When | Properties |
|-------|------|------------|
| `pulse_viewed` | Pulse screen loaded with data | `energy_score, date` |
| `pulse_lucky_elements_seen` | Scrolled to lucky elements | `color, number, direction` |
| `oracle_question_sent` | User sent Oracle message | `question_length, language` |
| `oracle_response_received` | AI response completed | `response_time_ms, token_count` |
| `oracle_response_error` | AI response failed | `error_type, status_code` |
| `oracle_conversation_started` | First message in new session | `is_first_ever` |
| `siam_si_draw_started` | User tapped Draw | — |
| `siam_si_draw_completed` | Result card shown | `stick_number, fortune_level` |
| `siam_si_shake_used` | User shook phone to draw | — |

### Quota & Monetization Events

| Event | When | Properties |
|-------|------|------------|
| `quota_exceeded` | User hit daily limit | `feature: oracle\|siam_si, tier` |
| `paywall_shown` | Paywall modal displayed | `trigger: quota\|feature_gate\|settings` |
| `paywall_dismissed` | User closed paywall | `time_on_paywall_seconds` |
| `paywall_plan_selected` | User tapped a plan | `plan: monthly\|annual` |
| `trial_started` | Free trial began | `plan: monthly\|annual` |
| `trial_converted` | Trial → paid | `plan, trial_duration_days` |
| `trial_expired` | Trial ended without payment | `usage_during_trial` |
| `subscription_started` | New subscriber | `plan, price, currency` |
| `subscription_cancelled` | User cancelled | `days_subscribed, reason` |
| `restore_purchases_tapped` | Restore button tapped | — |
| `restore_purchases_result` | Restore result | `found: boolean` |

### Engagement Events

| Event | When | Properties |
|-------|------|------------|
| `session_started` | App foregrounded | `time_since_last_session` |
| `tab_switched` | User switched tabs | `from_tab, to_tab` |
| `language_changed` | Language toggled | `from, to` |
| `notification_permission_result` | Permission prompt response | `granted: boolean, trigger` |
| `notification_tapped` | User opened app via notification | `notification_type` |
| `share_tapped` | User tapped share (if applicable) | `content_type` |

### Rating Events

| Event | When | Properties |
|-------|------|------------|
| `rating_survey_shown` | Pre-prompt survey displayed | `trigger` |
| `rating_survey_positive` | User tapped "Yes" | — |
| `rating_survey_negative` | User tapped "Not really" | — |
| `rating_native_prompt_shown` | Native review prompt triggered | — |
| `rating_feedback_submitted` | Negative user submitted feedback | `feedback_length` |

### Error Events

| Event | When | Properties |
|-------|------|------------|
| `api_error` | Any API call fails | `endpoint, status_code, error` |
| `auth_error` | Auth flow fails | `step, error` |
| `crash_detected` | Sentry captures crash | (handled by Sentry) |

---

## User Properties (Set on Identify)

```typescript
analytics.identify(userId);
analytics.setPersonProperties({
  language: 'th',
  tier: 'free',
  install_date: '2026-05-11',
  birth_year: 1992,
  gender: 'female',
  concerns: ['love', 'career'],
  platform: 'ios',
  app_version: '1.0.0',
});
```

Update on change:
```typescript
// When user upgrades
analytics.setPersonProperties({ tier: 'standard' });

// When language changes
analytics.setPersonProperties({ language: 'en' });
```

---

## Feature Flags (via PostHog)

Replace `src/config/features.ts` manual flags with PostHog remote flags:

```typescript
import { analytics } from '@/src/services/analytics';

// Check if paywall variant B is enabled
if (analytics.isFeatureEnabled('paywall-variant-b')) {
  // Show variant B
}

// Get multivariate flag value
const onboardingFlow = analytics.getFeatureFlag('onboarding-flow');
```

### Planned Feature Flags

| Flag | Type | Purpose |
|------|------|---------|
| `paywall-variant` | Multivariate | A/B test paywall designs |
| `onboarding-flow` | Multivariate | Test onboarding step order |
| `oracle-model` | Multivariate | Test different AI prompts |
| `show-siam-si` | Boolean | Gradual Siam Si rollout |

---

## Key Funnels to Build

### 1. Onboarding Funnel

```
onboarding_started
  → onboarding_auth_method_selected
    → onboarding_otp_verified
      → onboarding_birth_data_completed
        → onboarding_snapshot_viewed
          → onboarding_completed

Goal: Identify the biggest drop-off step
Target: 75% completion rate
```

### 2. Activation Funnel

```
onboarding_completed
  → pulse_viewed (first)
    → oracle_question_sent (first)
      → session_started (Day 2 return)

Goal: Measure first-day engagement depth
Target: 60% reach first Oracle question
```

### 3. Monetization Funnel

```
quota_exceeded
  → paywall_shown
    → paywall_plan_selected
      → trial_started
        → trial_converted

Goal: Measure free-to-paid conversion
Target: 5% of active users → trial, 45% trial → paid
```

### 4. Retention Funnel

```
Day 0: onboarding_completed
Day 1: session_started
Day 3: pulse_viewed (3rd time)
Day 7: session_started
Day 30: session_started

Goal: Track cohort retention curves
Target: D1=50%, D7=30%, D30=15%
```

---

## Dashboards

### Daily Dashboard (Check Every Morning)

| Metric | Source | What to Look For |
|--------|--------|-----------------|
| New installs (yesterday) | App Store Connect / Play Console | Trend direction |
| DAU | PostHog | Sudden drops = problem |
| Onboarding completion rate | PostHog funnel | Drop below 70% = investigate |
| Oracle questions asked | PostHog | Engagement health |
| Quota exceeded count | PostHog | Upgrade opportunity volume |
| Crash-free rate | Sentry | Must stay >99% |
| API error rate | PostHog | Watch for spikes |

### Weekly Dashboard

| Metric | Source | What to Look For |
|--------|--------|-----------------|
| WAU (Weekly Active Users) | PostHog | Growth trend |
| D1/D7 retention by cohort | PostHog | Improving or declining? |
| Paywall → trial conversion | PostHog funnel | A/B test results |
| Revenue (MRR) | RevenueCat | Month-over-month growth |
| Average rating | App Store Connect | Stay above 4.5 |
| Top Oracle topics | PostHog (question analysis) | Content/feature ideas |

### Monthly Dashboard

| Metric | Source | What to Look For |
|--------|--------|-----------------|
| MAU | PostHog | Total reach |
| D30 retention | PostHog | Long-term stickiness |
| LTV by cohort | RevenueCat | Is LTV improving? |
| Churn rate | RevenueCat | Monthly subscriber loss |
| ARPU / ARPPU | RevenueCat | Revenue efficiency |
| Keyword rankings | ASO tool | Organic growth health |

---

## Integration Points in Code

### Where to Add Tracking

| File | Events to Add |
|------|--------------|
| `app/_layout.tsx` | `session_started` (via `useAnalytics` hook — done) |
| `app/(onboarding)/soul-gate.tsx` | `onboarding_started`, `language_selected`, `auth_method_selected` |
| `app/(onboarding)/phone-auth.tsx` | `otp_sent`, `otp_verified`, `otp_failed` |
| `app/(onboarding)/birth-data.tsx` | `birth_data_completed` |
| `app/(onboarding)/name-numbers.tsx` | `name_completed` |
| `app/(onboarding)/soul-snapshot.tsx` | `snapshot_viewed` |
| `app/(onboarding)/power-ups.tsx` | `notification_permission_result`, `onboarding_completed` |
| `app/(main)/pulse.tsx` | `pulse_viewed` |
| `app/(main)/oracle/index.tsx` | `oracle_question_sent`, `oracle_response_received`, `quota_exceeded` |
| `app/(main)/oracle/siam-si.tsx` | `siam_si_draw_started`, `siam_si_draw_completed` |
| Paywall component (new) | `paywall_shown`, `paywall_dismissed`, `paywall_plan_selected` |
| Rating service (new) | `rating_survey_shown`, `rating_survey_positive`, `rating_survey_negative` |

---

## Privacy & Compliance

### What NOT to Track

- Full name, phone number, email (PII)
- Exact birth date (track birth year only for demographic segmentation)
- Oracle conversation content (track length, not content)
- Exact location
- Any data that could identify the user outside the app

### App Tracking Transparency (iOS)

PostHog's analytics-only use (no IDFA, no advertising linking):
- You do **NOT** need ATT prompt (App Tracking Transparency)
- PostHog uses its own anonymous distinct ID, not IDFA

If you later add Facebook Ads / attribution:
- You WILL need ATT prompt
- Show after activation (not during onboarding)

### Privacy Nutrition Labels (App Store)

Declare in App Store Connect:
- **Analytics:** Device ID (PostHog distinct ID), usage data
- **App Functionality:** Account info (auth), user content (birth data)
- **Not linked to identity** for analytics data

---

## Implementation Priority

| Phase | Tasks | When |
|:-----:|-------|------|
| **1** | ~~Install PostHog, create analytics service wrapper~~ | **Done** |
| **2** | Add onboarding funnel events (6 events) | Before beta |
| **3** | Add core feature events (Pulse, Oracle, Siam Si) | Before beta |
| **4** | Add monetization events (paywall, trial, subscription) | With paywall build |
| **5** | Add engagement events (sessions, tabs, notifications) | Before launch |
| **6** | Build PostHog dashboards (daily, weekly, monthly) | Launch week |
| **7** | Add rating events | With rating prompt build |
| **8** | Enable session replay | After launch stabilization |
| **9** | Migrate feature flags from local config to PostHog | When A/B testing needed |

---

## Cost Estimate

| Tool | Monthly Cost | Notes |
|------|:----------:|-------|
| PostHog (cloud) | $0 | Free up to 1M events/month |
| Sentry | $0 | Free up to 5K errors/month |
| RevenueCat | $0 | Free up to $2,500/month revenue |
| App Store Connect | $0 | Included with developer account |
| **Total** | **$0** | Self-host PostHog for unlimited free events if needed |

---

## Environment Variables

```
EXPO_PUBLIC_POSTHOG_KEY=        # PostHog project API key
EXPO_PUBLIC_POSTHOG_HOST=       # https://us.i.posthog.com (default)
```

Get your API key from: PostHog → Project Settings → Project API Key
