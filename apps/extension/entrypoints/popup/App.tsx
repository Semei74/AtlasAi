import type { ReactElement } from "react";
import { TamaguiProvider, tamaguiConfig } from "@atlas/ui";
import { QueryProvider } from "@atlas/hooks";
import { PostHogProvider } from "@atlas/observability";

export default function Popup(): ReactElement {
  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <QueryProvider>
        <PostHogProvider
          apiKey={import.meta.env.VITE_POSTHOG_KEY ?? ""}
          apiHost={import.meta.env.VITE_POSTHOG_HOST ?? "https://app.posthog.com"}
        >
          <div style={{ width: 400, minHeight: 400, padding: 16 }}>
            <h1>Atlas</h1>
          </div>
        </PostHogProvider>
      </QueryProvider>
    </TamaguiProvider>
  );
}
