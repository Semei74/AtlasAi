import posthog from "posthog-js";

export function trackEvent(name: string, properties?: Record<string, unknown>): void {
  posthog.capture(name, properties);
}

export function identifyUser(distinctId: string, traits?: Record<string, unknown>): void {
  posthog.identify(distinctId, traits);
}

export function resetIdentity(): void {
  posthog.reset();
}
