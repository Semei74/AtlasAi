import posthog from "posthog-js";

export function useFeatureFlag(key: string): boolean {
  return posthog.isFeatureEnabled(key) ?? false;
}

export function getFeatureFlagValue(key: string): string | undefined {
  return posthog.getFeatureFlag(key) as string | undefined;
}
