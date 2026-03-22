-- Add bilingual columns to daily_readings
ALTER TABLE daily_readings ADD COLUMN IF NOT EXISTS insight_en text;
ALTER TABLE daily_readings ADD COLUMN IF NOT EXISTS insight_th text;
ALTER TABLE daily_readings ADD COLUMN IF NOT EXISTS lucky_color_name_th text;
ALTER TABLE daily_readings ADD COLUMN IF NOT EXISTS lucky_direction_th text;

-- Backfill insight_en from existing insight column
UPDATE daily_readings SET insight_en = insight WHERE insight_en IS NULL AND insight IS NOT NULL;

-- Drop old insight column
ALTER TABLE daily_readings DROP COLUMN IF EXISTS insight;

-- Add Siam Si quota columns to user_quotas
ALTER TABLE user_quotas ADD COLUMN IF NOT EXISTS siam_si_draws_this_month integer DEFAULT 0;
ALTER TABLE user_quotas ADD COLUMN IF NOT EXISTS siam_si_last_reset text;
