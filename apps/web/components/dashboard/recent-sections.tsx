"use client";

import { Card, Heading, Stack, Text } from "@atlas/ui";
import { useRecentProjects, useRecentActivity } from "../../lib/queries";
import { EmptyState } from "./states";
import { StatisticCardSkeleton } from "./skeletons";

export function RecentProjects(): React.ReactElement {
  const projects = useRecentProjects(5);

  return (
    <Card padding="$4" gap="$2" flex={1} minWidth={260}>
      <Heading level={3}>Recent Projects</Heading>
      {projects.isPending ? (
        <StatisticCardSkeleton />
      ) : projects.data === undefined || projects.data.length === 0 ? (
        <EmptyState
          title="No recent projects"
          description="Projects you create will appear here."
        />
      ) : (
        <Stack gap="$2">
          {projects.data.map((project) => (
            <Stack key={project.id} gap="$1">
              <Text fontWeight="500">{project.name}</Text>
              <Text color="$gray11" fontSize={12}>
                {project.owner.displayName} &middot; {project.status}
              </Text>
            </Stack>
          ))}
        </Stack>
      )}
    </Card>
  );
}

export function RecentActivity(): React.ReactElement {
  const activity = useRecentActivity(5);

  return (
    <Card padding="$4" gap="$2" flex={1} minWidth={260}>
      <Heading level={3}>Recent Activity</Heading>
      {activity.isPending ? (
        <StatisticCardSkeleton />
      ) : activity.data === undefined || activity.data.length === 0 ? (
        <EmptyState
          title="No activity yet"
          description="Your recent activity will appear here."
        />
      ) : (
        <Stack gap="$2">
          {activity.data.map((entry) => (
            <Stack key={entry.id} gap="$1">
              <Text fontSize={13}>{entry.description}</Text>
              <Text color="$gray11" fontSize={11}>
                {entry.actor.displayName} &middot; {new Date(entry.createdAt).toLocaleDateString()}
              </Text>
            </Stack>
          ))}
        </Stack>
      )}
    </Card>
  );
}
