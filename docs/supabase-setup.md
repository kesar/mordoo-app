# Supabase Project Setup

## 1. Create Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your **Project URL** and **anon (public) key** from Settings → API

## 2. Configure Environment

Copy `.env.local.example` or create `.env.local` in the project root:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 3. Enable Auth Providers

In Supabase Dashboard → Authentication → Providers:

### Phone (OTP)
- Enable Phone provider
- Configure an SMS provider (Twilio, MessageBird, or Vonage)
- Set OTP expiry and length as needed

### Apple
- Enable Apple provider
- Add your Apple Services ID and Secret Key
- Configure in Apple Developer Console:
  - Create a Services ID with "Sign In with Apple" enabled
  - Set the redirect URL to your Supabase callback URL

### Google
- Enable Google provider
- Create OAuth 2.0 credentials in Google Cloud Console
- Add Client ID and Client Secret
- Add authorized redirect URI from Supabase dashboard

## 4. Run Database Migration

In Supabase Dashboard → SQL Editor, run:

```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'th')),
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'standard')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, phone, language)
  VALUES (
    NEW.id,
    NEW.phone,
    COALESCE(NEW.raw_user_meta_data->>'language', 'en')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
```

## 5. Run Birth Data Migration

```sql
CREATE TABLE public.birth_data (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  date_of_birth DATE NOT NULL,
  time_of_birth TIME,
  time_approximate BOOLEAN DEFAULT false,
  place_name TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  country TEXT,
  gender TEXT,
  full_name TEXT,
  phone_number TEXT,
  car_plate TEXT,
  concerns TEXT[] DEFAULT '{}',
  urgency_context TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.birth_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own birth data"
  ON public.birth_data FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own birth data"
  ON public.birth_data FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own birth data"
  ON public.birth_data FOR UPDATE USING (auth.uid() = user_id);
```

## 6. Run Daily Readings Cache Migration

```sql
CREATE TABLE public.daily_readings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reading_date DATE NOT NULL,
  energy_score INTEGER NOT NULL CHECK (energy_score BETWEEN 0 AND 100),
  insight TEXT NOT NULL,
  lucky_color_name TEXT NOT NULL,
  lucky_color_hex TEXT NOT NULL,
  lucky_number INTEGER NOT NULL,
  lucky_direction TEXT NOT NULL,
  sub_score_business INTEGER NOT NULL,
  sub_score_heart INTEGER NOT NULL,
  sub_score_body INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, reading_date)
);

ALTER TABLE public.daily_readings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own readings"
  ON public.daily_readings FOR SELECT USING (auth.uid() = user_id);
```

## 7. User Quotas Migration

```sql
CREATE TABLE public.user_quotas (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  oracle_questions_today INTEGER DEFAULT 0,
  oracle_last_reset DATE DEFAULT CURRENT_DATE,
  siam_si_this_month INTEGER DEFAULT 0,
  siam_si_last_reset TEXT DEFAULT to_char(NOW(), 'YYYY-MM'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own quotas"
  ON public.user_quotas FOR SELECT USING (auth.uid() = user_id);
```

## 8. Vercel API Deployment

1. Create a new Vercel project pointing to the `api/` directory
2. Set the root directory to `api/` in Vercel project settings
3. Add environment variables in Vercel dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY`
4. Deploy
5. Update `.env.local` in the React Native project with the Vercel URL:
   ```
   EXPO_PUBLIC_API_BASE_URL=https://your-deployment.vercel.app
   ```

## 9. iOS Configuration

After setting up auth providers, rebuild the native project:

```bash
npx expo prebuild --clean
npx expo run:ios
```

The `expo-apple-authentication` plugin is already configured in `app.json`.

## 10. URL Scheme

The app uses `mordoo://` as its deep link scheme (configured in `app.json`). This is used for OAuth callbacks from Google Sign-In.
