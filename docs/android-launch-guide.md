# Android Launch Guide — Mordoo

Step-by-step guide to launch Mordoo on Google Play Store.

---

## Phase 1: Local Development Setup

### 1.1 Install Android Studio
- Download from https://developer.android.com/studio
- During install, make sure **Android SDK**, **Android SDK Platform**, and **Android Virtual Device** are checked

### 1.2 Configure Environment Variables
Add to `~/.zshrc`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```
Then run `source ~/.zshrc`.

### 1.3 Create Android Emulator
1. Open Android Studio
2. **More Actions → Virtual Device Manager**
3. **Create Device** → Pixel 7 → Next
4. Download system image: **API 35, arm64-v8a** (for Apple Silicon Mac)
5. Finish → press **Play ▶️** to launch

### 1.4 Run App Locally
```bash
npx expo run:android
```
This compiles the app and installs it on the running emulator.

---

## Phase 2: Test Everything on Android

### 2.1 Core Functionality Checklist
- [ ] **Auth flow** — Phone OTP login, email login, sign out
- [ ] **Onboarding** — Birth data entry, all steps complete
- [ ] **Pulse (daily reading)** — Loads and displays correctly
- [ ] **Oracle chat** — SSE streaming works, messages render
- [ ] **Siam Si** — Shake detection works (use emulator shake: `Cmd+M` or shake button in emulator controls)
- [ ] **Share card** — Capture and share flow works on Android
- [ ] **Push notifications** — Permission prompt, notification channel created
- [ ] **Deep links** — `mordoo://` scheme opens the app

### 2.2 UI/Visual Checks
- [ ] Fonts render correctly (CinzelDecorative, CormorantGaramond, NotoSansThai)
- [ ] Dark theme looks right — no white flashes on navigation
- [ ] Splash screen displays correctly
- [ ] Adaptive icon looks good (check home screen, app drawer, settings)
- [ ] Thai language displays correctly
- [ ] Safe area / notch handling on different screen sizes
- [ ] Android back button works correctly on all screens (hardware back)

### 2.3 Known Platform Differences to Verify
- **Haptics** — currently iOS-only in `src/utils/haptics.ts` (skipped on Android, which is fine)
- **Apple Sign-In** — `expo-apple-authentication` is iOS-only; make sure it's hidden on Android (it's behind a feature flag)
- **Share** — sharing uses different APIs per platform (`src/hooks/useShareCard.ts` already handles this)
- **Notification channels** — Android requires channels; already set up in `src/services/notifications.ts`

---

## Phase 3: Google Play Developer Account

### 3.1 Register
1. Go to https://play.google.com/console/signup
2. Pay the **$25 one-time fee**
3. Choose **Personal** or **Organization** account type
   - Organization requires D-U-N-S number (takes days to get)
   - Personal is faster for solo developers
4. Complete **identity verification** — submit government ID
5. Wait for approval (can take **2-7 days**)

### 3.2 Create Your App
1. Google Play Console → **Create app**
2. App name: `Mor Doo` (or `Mor Doo - AI Astrology`)
3. Default language: **Thai** (or English, your choice for primary)
4. App type: **App**
5. Free or Paid: **Free** (you monetize via subscriptions)
6. Declarations: check the boxes for policies

---

## Phase 4: Store Listing Content

### 4.1 Required Text
| Field | Limit | Notes |
|-------|-------|-------|
| App name | 30 chars | `Mor Doo - AI Astrology` |
| Short description | 80 chars | One-liner for search results |
| Full description | 4000 chars | Keywords matter here for Google Play ASO |

### 4.2 Required Graphics
| Asset | Size | Notes |
|-------|------|-------|
| App icon | 512x512 PNG | High-res version of your icon |
| Feature graphic | 1024x500 PNG | Displayed at top of store listing |
| Phone screenshots | Min 2, recommended 6-8 | 16:9 or 9:16, min 320px, max 3840px |
| 7-inch tablet screenshots | Optional but recommended | |
| 10-inch tablet screenshots | Optional but recommended | |

### 4.3 Content Rating
1. Go to **Policy → App content → Content rating**
2. Fill out the IARC questionnaire
3. For an astrology app, answer honestly — should get **Everyone** or **Teen** rating
4. Important: disclose any fortune-telling/astrology content accurately

### 4.4 Privacy Policy
- Required for apps that collect personal data (you collect birth data, phone numbers)
- Host it at a public URL (e.g., `https://mordoo.app/privacy`)
- Link it in Google Play Console → **Policy → App content → Privacy policy**

### 4.5 Data Safety Section
Google Play requires a **Data safety** form. You need to declare:
- **Data collected:** Phone number, email, date/time/location of birth, chat messages
- **Data shared:** None (unless you share with third parties)
- **Encryption:** Yes (Supabase uses HTTPS)
- **Deletion:** Users can request data deletion (make sure you support this)

---

## Phase 5: Subscriptions & Billing

### 5.1 Google Play Billing Setup
1. Google Play Console → **Monetize → Products → Subscriptions**
2. Create subscription products that match your iOS offerings:
   - Use the same product IDs as RevenueCat expects (check your RevenueCat dashboard)
   - Set base plans, pricing, and free trial periods
3. Set up a **billing testing group** for QA (Settings → License testing → add test emails)

### 5.2 RevenueCat Android Setup
1. RevenueCat Dashboard → Your Mordoo project → **Google Play Store** app
2. Add your **Google Play service account key** (JSON)
3. Copy the **Public API Key** for Android
4. Add to EAS secrets:
   ```bash
   eas secret:create --name EXPO_PUBLIC_REVENUECAT_ANDROID_KEY --value "your_key_here"
   ```
5. Add to `.env.local`:
   ```
   EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=your_key_here
   ```
6. The code already handles platform switching in `src/services/purchases.ts:24`

### 5.3 Update Env Validation
Add `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` to `scripts/validate-env.js` (or make it conditional per platform).

---

## Phase 6: Push Notifications (FCM)

### 6.1 Firebase Setup
1. Go to https://console.firebase.google.com
2. Create a project (or use existing)
3. **Add Android app** → package name: `ai.mordoo.app`
4. Download `google-services.json`
5. Place it in the project root

### 6.2 Configure in app.json
Add to the `android` section:
```json
"android": {
  "package": "ai.mordoo.app",
  "googleServicesFile": "./google-services.json",
  "adaptiveIcon": { ... }
}
```

### 6.3 EAS Secret
```bash
eas secret:create --name GOOGLE_SERVICES_JSON --type file --value ./google-services.json
```

### 6.4 Expo Notifications Plugin
The `expo-notifications` plugin in `app.json` already has Android color configured. If you need a custom icon:
```json
["expo-notifications", {
  "color": "#c9a84c",
  "icon": "./assets/notification-icon.png"
}]
```
The notification icon must be a **white-on-transparent** PNG (Android shows it as a silhouette).

---

## Phase 7: Google Play Service Account (for EAS Submit)

### 7.1 Create Service Account
1. Go to https://console.cloud.google.com
2. Select or create a project
3. **IAM & Admin → Service Accounts → Create Service Account**
4. Name: `eas-submit`
5. Skip role assignment → Done
6. Click into the service account → **Keys → Add Key → JSON**
7. Download the `.json` file → save as `google-play-service-account.json` in project root

### 7.2 Link to Google Play Console
1. Google Play Console → **Settings (gear icon) → Developer account → API access**
   (This page only appears after your developer account is verified)
2. Link your Google Cloud project
3. Find your service account in the list → **Grant access**
4. Give it **Admin** or **Release manager** permission
5. **Wait 24-48 hours** for permissions to propagate

### 7.3 Configure EAS Submit
Add to `eas.json`:
```json
"submit": {
  "production": {
    "ios": {
      "ascAppId": "6761039282"
    },
    "android": {
      "serviceAccountKeyPath": "./google-play-service-account.json"
    }
  }
}
```

### 7.4 Add to .gitignore
```
google-play-service-account.json
```

---

## Phase 8: Build & Submit

### 8.1 First Production Build
```bash
eas build --platform android --profile production
```
This creates an `.aab` (Android App Bundle) file. First build takes 20-40 minutes.

### 8.2 First Upload (Manual)
For the **very first upload**, you must do it manually through Google Play Console:
1. Google Play Console → **Production → Create new release**
2. Upload the `.aab` file from EAS (download from the build URL)
3. Add release notes
4. **Save** (don't submit for review yet — complete all store listing sections first)

### 8.3 Subsequent Uploads via EAS
After the first manual upload, you can use:
```bash
eas submit --platform android --profile production
```

---

## Phase 9: Testing Tracks

Google Play has testing tracks before production. Use them:

### 9.1 Internal Testing (recommended first)
1. Google Play Console → **Testing → Internal testing**
2. Create a release, upload your `.aab`
3. Add testers by email (up to 100)
4. Testers get a link to install via Play Store
5. No review required — available within minutes

### 9.2 Closed Testing
- Up to 2000 testers
- Requires review (but faster than production)
- Good for beta testing with real users

### 9.3 Open Testing
- Anyone can join
- Requires review
- Good for public beta

---

## Phase 10: Pre-Launch Checklist

Before submitting to production review:

### Code
- [ ] `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` set in EAS secrets
- [ ] `google-services.json` configured (if using FCM)
- [ ] `google-play-service-account.json` in `.gitignore`
- [ ] Tested all features on Android emulator and at least one real device
- [ ] Android back button behavior tested on all screens

### Store Listing
- [ ] App name, short description, full description filled in
- [ ] 512x512 app icon uploaded
- [ ] 1024x500 feature graphic uploaded
- [ ] At least 2 phone screenshots (aim for 6-8)
- [ ] Content rating questionnaire completed
- [ ] Privacy policy URL added
- [ ] Data safety form completed
- [ ] App category selected (Lifestyle or Entertainment)
- [ ] Contact email and (optionally) website added
- [ ] Target audience and content declarations done

### Monetization
- [ ] Subscription products created in Google Play Console
- [ ] RevenueCat linked to Google Play Store app
- [ ] Test purchases work with license testing emails
- [ ] Restore purchases flow works

---

## Phase 11: Submit for Review

1. Google Play Console → **Production → Create new release**
2. Upload `.aab` or promote from testing track
3. Add release notes (Thai + English)
4. **Send for review**

### Review Timeline
- First review: **3-7 days** (can be longer)
- Subsequent reviews: **1-3 days**
- Google may ask follow-up questions about fortune-telling content

### Potential Rejection Reasons for Astrology Apps
- **Misleading claims** — don't claim predictions are real or guaranteed
- **Sensitive categories** — add disclaimers that it's for entertainment
- **Subscription transparency** — make sure pricing, trial length, and cancellation are clear
- **Data collection** — birth data collection must be justified and disclosed

---

## Phase 12: Post-Launch

### 12.1 OTA Updates
OTA updates via EAS Update work the same on Android — no changes needed. The existing workflow in `.eas/workflows/send-updates.yml` will push to both platforms.

### 12.2 Monitoring
- **Sentry** — already configured, works on Android
- **PostHog** — already configured, works on Android
- **Google Play Console → Android Vitals** — monitor crashes, ANRs, battery/wake locks

### 12.3 CI/CD
Consider adding Android build to your CI:
```bash
eas build --platform android --profile production --non-interactive
```
