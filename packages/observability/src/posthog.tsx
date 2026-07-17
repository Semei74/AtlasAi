"use client";

import type { PostHog } from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect, useState } from "react";
import type { ReactElement, ReactNode } from "react";

interface PostHogSetupProps {
  apiKey: string;
  apiHost: string;
  children: ReactNode;
}

export function PostHogProvider({ apiKey, apiHost, children }: PostHogSetupProps): ReactElement {
  const [posthog, setPosthog] = useState<PostHog | null>(null);

  useEffect(() => {
    if (!apiKey) return;
    let active = true;
    void import("posthog-js").then((mod): void => {
      if (!active) return;
      const ph = mod.default;
      ph.init(apiKey, {
        api_host: apiHost,
        capture_pageview: false,
        loaded: (loadedPh) => {
          if (process.env.NODE_ENV === "development") loadedPh.opt_out_capturing();
        },
      });
      setPosthog(ph);
    });
    return (): void => {
      active = false;
    };
  }, [apiKey, apiHost]);

  if (!apiKey || !posthog) return <>{children}</>;

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
