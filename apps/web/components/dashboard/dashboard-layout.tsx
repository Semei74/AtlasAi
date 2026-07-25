"use client";

import type { ReactNode } from "react";
import { Stack } from "@atlas/ui";
import { Sidebar } from "./sidebar";
import { Header } from "./header";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps): React.ReactElement {
  return (
    <Stack flexDirection="row" flexWrap="wrap" flex={1} minHeight="100vh" backgroundColor="$background">
      <Sidebar />
      <Stack flex={1} minWidth={0} flexDirection="column" maxWidth="100%">
        <Header />
        <Stack flex={1} padding="$4" gap="$4" overflow="scroll">
          {children}
        </Stack>
      </Stack>
    </Stack>
  );
}
