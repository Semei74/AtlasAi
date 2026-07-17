"use client";
import type { ReactElement } from "react";
import { Text } from "@atlas/ui";

export default function LoginPage(): ReactElement {
  return (
    <main
      style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text>Atlas — Authentication</Text>
    </main>
  );
}
