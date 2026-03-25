import PostHog from 'posthog-react-native';

export { PostHogProvider } from 'posthog-react-native';

const POSTHOG_API_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY ?? '';
const POSTHOG_HOST = process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com';

export const posthog = new PostHog(POSTHOG_API_KEY, {
  host: POSTHOG_HOST,
  enableSessionReplay: false, // enable when ready
});

export const analytics = {
  identify(userId: string, properties?: Record<string, any>) {
    posthog.identify(userId, properties);
  },

  track(event: string, properties?: Record<string, any>) {
    posthog.capture(event, properties);
  },

  screen(screenName: string, properties?: Record<string, any>) {
    posthog.screen(screenName, properties);
  },

  reset() {
    posthog.reset();
  },

  setPersonProperties(properties: Record<string, any>) {
    posthog.identify(undefined, properties);
  },

  isFeatureEnabled(flag: string): boolean | undefined {
    return posthog.isFeatureEnabled(flag);
  },

  getFeatureFlag(flag: string) {
    return posthog.getFeatureFlag(flag);
  },

  reloadFeatureFlags() {
    posthog.reloadFeatureFlagsAsync();
  },
};
