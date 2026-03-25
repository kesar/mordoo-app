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

-- Function to get users eligible for notification in current 15-min window
CREATE OR REPLACE FUNCTION get_notification_eligible_users()
RETURNS TABLE (user_id uuid, push_token text, language text, local_date date) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id as user_id, p.push_token, COALESCE(p.language, 'th') as language,
         (CURRENT_TIMESTAMP AT TIME ZONE p.timezone)::date as local_date
  FROM profiles p
  WHERE p.notifications_enabled = true
    AND p.push_token IS NOT NULL
    AND (p.last_notification_sent IS NULL OR p.last_notification_sent < (CURRENT_TIMESTAMP AT TIME ZONE p.timezone)::date)
    AND (CURRENT_TIMESTAMP AT TIME ZONE p.timezone)::time >= p.notification_time
    AND (CURRENT_TIMESTAMP AT TIME ZONE p.timezone)::time < p.notification_time + INTERVAL '15 minutes';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
