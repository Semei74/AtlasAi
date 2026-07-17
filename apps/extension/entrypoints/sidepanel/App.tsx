import type { ReactElement } from "react";
import { TamaguiProvider, tamaguiConfig } from "@atlas/ui";
import { QueryProvider } from "@atlas/hooks";
import { PostHogProvider } from "@atlas/observability";

export default function SidePanel(): ReactElement {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <QueryProvider>
        <PostHogProvider
          apiKey={import.meta.env.VITE_POSTHOG_KEY ?? ""}
          apiHost={import.meta.env.VITE_POSTHOG_HOST ?? "https://app.posthog.com"}
        >
          <div style={{ padding: 16 }}>
            <h1>Atlas Side Panel</h1>
          </div>
        </PostHogProvider>
      </QueryProvider>
    </TamaguiProvider>
  );
}
