import type { NextConfig } from "next";
import { withTamagui } from "@tamagui/next-plugin";

const tamaguiPlugin = withTamagui({
  config: "./tamagui.config.ts",
  components: ["tamagui", "@atlas/ui"],
  appDir: true,
});

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
