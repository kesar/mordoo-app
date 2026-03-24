-- sql/009-push-notifications.sql
-- Add push notification fields to profiles table

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_token text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notifications_enabled boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS notification_time time DEFAULT '07:00';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone text DEFAULT 'Asia/Bangkok';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_notification_sent date;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language text DEFAULT 'th';

-- Index for the Edge Function query (find eligible users efficiently)
CREATE INDEX IF NOT EXISTS idx_profiles_notification_eligible
  ON profiles (notifications_enabled, last_notification_sent)
  WHERE notifications_enabled = true AND push_token IS NOT NULL;
