-- Schedule: run every 15 minutes
-- NOTE: Replace <project> and <service_role_key> with actual values before running
-- Run this manually in Supabase SQL editor after deploying the Edge Function

SELECT cron.schedule(
  'send-daily-reminders',
  '*/15 * * * *',
  $$SELECT net.http_post(
    url := 'https://<project>.supabase.co/functions/v1/send-daily-reminder',
    headers := '{"Authorization": "Bearer <service_role_key>", "Content-Type": "application/json"}'::jsonb
  )$$
);
