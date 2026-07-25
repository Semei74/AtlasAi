"use client";

import Link from "next/link";
import { Stack, Text, Heading } from "@atlas/ui";

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/dashboard/workspaces", label: "Workspaces" },
  { href: "/dashboard/activity", label: "Activity" },
  { href: "/dashboard/settings", label: "Settings" },
];

export function Sidebar(): React.ReactElement {
  return (
    <Stack
      width={220}
      padding="$4"
      gap="$2"
      backgroundColor="$background"
      borderRightWidth={1}
      borderColor="$border"
      minHeight="100%"
    >
      <Heading level={3}>Atlas</Heading>
      <Stack gap="$1" marginTop="$3">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href}>
            <Stack
              padding="$2"
              borderRadius={8}
              hoverStyle={{ backgroundColor: "$gray3" }}
              pressStyle={{ backgroundColor: "$gray4" }}
            >
              <Text>{item.label}</Text>
            </Stack>
          </Link>
        ))}
      </Stack>
    </Stack>
  );
}
