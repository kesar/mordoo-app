-- 1. Add partial index on profiles.push_token for notification registration dedup query
CREATE INDEX IF NOT EXISTS idx_profiles_push_token
  ON profiles (push_token)
  WHERE push_token IS NOT NULL;

-- 2. Drop redundant idx_oracle_messages_user (only used by rare account deletion)
DROP INDEX IF EXISTS idx_oracle_messages_user;

-- 3. Drop dead column siam_si_this_month (replaced by siam_si_draws_this_month)
ALTER TABLE user_quotas DROP COLUMN IF EXISTS siam_si_this_month;

-- 4. Fix stale month-only values before type conversion
UPDATE user_quotas
  SET siam_si_last_reset = siam_si_last_reset || '-01'
  WHERE siam_si_last_reset ~ '^\d{4}-\d{2}$';

-- 5. Change siam_si_last_reset from text to date for type consistency
ALTER TABLE user_quotas
  ALTER COLUMN siam_si_last_reset DROP DEFAULT;

ALTER TABLE user_quotas
  ALTER COLUMN siam_si_last_reset TYPE date USING siam_si_last_reset::date;

ALTER TABLE user_quotas
  ALTER COLUMN siam_si_last_reset SET DEFAULT CURRENT_DATE;
