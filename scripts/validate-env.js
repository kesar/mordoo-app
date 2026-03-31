/**
 * Validates that all required environment variables are set.
 * Runs before EAS builds to fail fast with a clear error.
 */
const required = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'EXPO_PUBLIC_API_BASE_URL',
  'EXPO_PUBLIC_POSTHOG_KEY',
  'EXPO_PUBLIC_POSTHOG_HOST',
  'EXPO_PUBLIC_REVENUECAT_IOS_KEY',
  'EXPO_PUBLIC_REVENUECAT_ANDROID_KEY',
  'EXPO_PUBLIC_SENTRY_DSN',
  'SENTRY_AUTH_TOKEN',
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error('\n❌ Missing required environment variables:\n');
  missing.forEach((key) => console.error(`   - ${key}`));
  console.error('\nSet them with: eas secret:create --name <NAME> --value <VALUE>\n');
  process.exit(1);
}

console.log('✅ All required environment variables are set.');
