"use client";

import { AuthGuard, useAuthStore } from "@atlas/auth";
import { Stack, Heading, Text } from "@atlas/ui";
import { DashboardLayout } from "../../components/dashboard/dashboard-layout";
import { ErrorBoundary } from "../../components/dashboard/error-boundary";
import { DashboardSkeleton } from "../../components/dashboard/skeletons";
import { UserProfileCard } from "../../components/dashboard/user-profile-card";
import { WorkspaceSwitcher } from "../../components/dashboard/workspace-switcher";
import { StatisticsCards } from "../../components/dashboard/statistics-cards";
import { RecentProjects, RecentActivity } from "../../components/dashboard/recent-sections";
import { useWorkspaces } from "../../lib/queries";

function DashboardContent(): React.ReactElement {
  const user = useAuthStore((s) => s.user);
  const workspaces = useWorkspaces();

  if (workspaces.isPending) {
    return <DashboardSkeleton />;
  }

  return (
    <ErrorBoundary>
      <Stack gap="$4" flex={1}>
        <Stack gap="$1">
          <Heading level={1}>Welcome back, {user?.displayName ?? "User"}</Heading>
          <Text color="$gray11">Here is an overview of your Atlas workspace.</Text>
        </Stack>

        <StatisticsCards />

        <Stack flexDirection="row" gap="$4" flexWrap="wrap" alignItems="flex-start">
          <Stack flex={1} minWidth={260} gap="$4">
            <UserProfileCard />
            <WorkspaceSwitcher />
          </Stack>
          <Stack flex={2} minWidth={280} flexDirection="row" gap="$4" flexWrap="wrap">
            <RecentProjects />
            <RecentActivity />
          </Stack>
        </Stack>
      </Stack>
    </ErrorBoundary>
  );
}

export default function DashboardPage(): React.ReactElement {
  return (
    <AuthGuard
      fallback={
        <Stack flex={1} alignItems="center" justifyContent="center">
          <Text color="$gray11">Redirecting to sign in…</Text>
        </Stack>
      }
    >
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </AuthGuard>
  );
}
