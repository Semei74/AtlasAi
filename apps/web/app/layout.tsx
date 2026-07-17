import type { ReactElement, ReactNode } from "react";
import type { Metadata } from "next";
import { NextTamaguiProvider } from "./NextTamaguiProvider";
import { QueryProvider } from "@atlas/hooks";
import { PostHogProvider } from "@atlas/observability";

export const metadata: Metadata = {
  title: "Atlas AI",
  description: "Enterprise AI Platform",
};

export default function RootLayout({ children }: { children: ReactNode }): ReactElement {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <NextTamaguiProvider>
          <QueryProvider>
            <PostHogProvider
              apiKey={process.env.NEXT_PUBLIC_POSTHOG_KEY ?? ""}
              apiHost={process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com"}
            >
              {children}
            </PostHogProvider>
          </QueryProvider>
        </NextTamaguiProvider>
      </body>
    </html>
  );
}
