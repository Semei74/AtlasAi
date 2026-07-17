"use client";

import type { ReactElement, ReactNode } from "react";
import { NextThemeProvider, useRootTheme, type ColorScheme } from "@tamagui/next-theme";
import { TamaguiProvider } from "tamagui";
import { tamaguiConfig } from "../tamagui.config";

export function NextTamaguiProvider({ children }: { children: ReactNode }): ReactElement {
  const [theme, setTheme] = useRootTheme();

  return (
    <NextThemeProvider
      skipNextHead
      onChangeTheme={(next) => {
        setTheme(next as ColorScheme);
      }}
    >
      <TamaguiProvider config={tamaguiConfig} defaultTheme={theme}>
        {children}
      </TamaguiProvider>
    </NextThemeProvider>
  );
}
