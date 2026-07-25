"use client";

import { useDashboardStatistics } from "../../lib/queries";
import { Card, Heading, Stack, Text } from "@atlas/ui";
import { StatisticCardSkeleton } from "./skeletons";

export function StatisticsCards(): React.ReactElement {
  const stats = useDashboardStatistics();

  if (stats.isPending) {
    return (
      <Stack flexDirection="row" gap="$4" flexWrap="wrap">
        <StatisticCardSkeleton />
        <StatisticCardSkeleton />
        <StatisticCardSkeleton />
        <StatisticCardSkeleton />
      </Stack>
    );
  }

  const statistics = [
    { label: "Workspaces", value: String(stats.data?.workspacesCount ?? 0) },
    { label: "Organizations", value: String(stats.data?.organizationsCount ?? 0) },
    { label: "Projects", value: String(stats.data?.projectsCount ?? 0) },
    { label: "Active Users", value: String(stats.data?.activeUsersCount ?? 0) },
  ];

  return (
    <Stack flexDirection="row" gap="$4" flexWrap="wrap">
      {statistics.map((statistic) => (
        <Card key={statistic.label} padding="$4" gap="$1" flex={1} minWidth={160}>
          <Text color="$gray11" fontSize={12}>
            {statistic.label}
          </Text>
          <Heading level={2}>{statistic.value}</Heading>
        </Card>
      ))}
    </Stack>
  );
}
