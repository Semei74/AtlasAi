import { Card, Stack, Text } from "@atlas/ui";

function SkeletonBlock({ height = 16, width = "100%" }: { height?: number; width?: number | string }): React.ReactElement {
  return (
    <Stack
      height={height}
      width={width}
      borderRadius={6}
      backgroundColor="$gray5"
    />
  );
}

export function StatisticCardSkeleton(): React.ReactElement {
  return (
    <Card padding="$4" gap="$2">
      <SkeletonBlock height={12} width={90} />
      <SkeletonBlock height={28} width={60} />
    </Card>
  );
}

export function CardSkeleton({ lines = 3 }: { lines?: number }): React.ReactElement {
  return (
    <Card padding="$4" gap="$3">
      <SkeletonBlock height={18} width={140} />
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonBlock key={index} height={12} width={index === lines - 1 ? "60%" : "100%"} />
      ))}
    </Card>
  );
}

export function DashboardSkeleton(): React.ReactElement {
  return (
    <Stack gap="$4" padding="$4" flex={1}>
      <Stack flexDirection="row" gap="$4">
        <StatisticCardSkeleton />
        <StatisticCardSkeleton />
        <StatisticCardSkeleton />
      </Stack>
      <Stack flexDirection="row" gap="$4">
        <CardSkeleton lines={4} />
        <CardSkeleton lines={4} />
      </Stack>
      <Text color="$gray11">Loading your workspace…</Text>
    </Stack>
  );
}
