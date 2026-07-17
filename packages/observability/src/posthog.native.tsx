"use client";

import { PostHogProvider as RNPostHogProvider } from "posthog-react-native";
import type { ReactElement, ReactNode } from "react";

interface PostHogSetupProps {
  apiKey: string;
  apiHost: string;
  children: ReactNode;
}

export function PostHogProvider({ apiKey, apiHost, children }: PostHogSetupProps): ReactElement {
  if (!apiKey) return <>{children}</>;

  return (
    <RNPostHogProvider apiKey={apiKey} options={{ host: apiHost }}>
      {children}
    </RNPostHogProvider>
  );
}
