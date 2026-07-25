import type { NextConfig } from "next";
import { withTamagui } from "@tamagui/next-plugin";

const tamaguiPlugin = withTamagui({
  config: "./tamagui.config.ts",
  components: ["tamagui", "@atlas/ui"],
  appDir: true,
});

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const apiOrigin = new URL(apiBaseUrl).origin;

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      `connect-src 'self' ${apiOrigin} https://*.sentry.io https://*.posthog.com`,
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "worker-src 'self' blob:",
      "frame-ancestors 'none'",
    ].join("; "),
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Cross-Origin-Opener-Policy",
    value: "same-origin",
  },
  {
    key: "Cross-Origin-Resource-Policy",
    value: "same-origin",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@tamagui/core", "@tamagui/web", "@atlas/ui", "react-native-web"],
  experimental: {
    turbo: {
      resolveAlias: {
        "react-native": "react-native-web",
        "react-native-svg": "@tamagui/react-native-svg",
      },
    },
  },
  // eslint-disable-next-line @typescript-eslint/require-await
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "react-native$": "react-native-web",
      "react-native-svg": "@tamagui/react-native-svg",
    };
    if (!isServer) {
      config.resolve.extensions = [".web.tsx", ".web.ts", ".web.js", ...config.resolve.extensions];
    }
    return config;
  },
};

export default tamaguiPlugin(nextConfig);
