"use client";

import { use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard } from "@atlas/auth";
import { Button, Card, Heading, Stack, Text, Spinner } from "@atlas/ui";
import { DashboardLayout } from "../../../components/dashboard/dashboard-layout";
import { ErrorBoundary } from "../../../components/dashboard/error-boundary";
import { ErrorState } from "../../../components/dashboard/states";
import { ToastProvider, useToast } from "../../../components/projects/toast-provider";
import { useProject, useArchiveProject, useRestoreProject } from "../../../lib/queries";

const STATUS_BADGE_COLORS: Record<string, string> = {
  ACTIVE: "$green3",
  DRAFT: "$blue3",
  ARCHIVED: "$gray5",
  COMPLETED: "$yellow3",
};

function ProjectDetailContent({ id }: { id: string }): React.ReactElement {
  const router = useRouter();
  const { showToast } = useToast();
  const { data: project, isPending, isError, error, refetch } = useProject(id);
  const archiveMutation = useArchiveProject();
  const restoreMutation = useRestoreProject();

  const handleArchive = useCallback(() => {
    archiveMutation.mutate(id, {
      onSuccess: () => {
        showToast("Project archived", "success");
        void refetch();
      },
      onError: () => {
        showToast("Failed to archive project", "error");
      },
    });
  }, [id, archiveMutation, showToast, refetch]);

  const handleRestore = useCallback(() => {
    restoreMutation.mutate(id, {
      onSuccess: () => {
        showToast("Project restored", "success");
        void refetch();
      },
      onError: () => {
        showToast("Failed to restore project", "error");
      },
    });
  }, [id, restoreMutation, showToast, refetch]);

  if (isPending) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight={300}>
        <Spinner />
      </Stack>
    );
  }

  if (isError) {
    return <ErrorState message={error.message} onRetry={() => void refetch()} />;
  }

  const isMutating = archiveMutation.isPending || restoreMutation.isPending;

  return (
    <Stack gap="$4">
      <Stack flexDirection="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$2">
        <Stack flexDirection="row" alignItems="center" gap="$2">
          <Button size="$2" backgroundColor="$gray5" color="$text" onPress={() => { router.push("/projects"); }}>
            ← Back
          </Button>
          <Heading level={2}>{project.name}</Heading>
          <Stack
            paddingHorizontal="$2"
            paddingVertical="$1"
            borderRadius={4}
            backgroundColor={STATUS_BADGE_COLORS[project.status] ?? "$gray5"}
          >
            <Text fontSize={11} fontWeight="600">{project.status}</Text>
          </Stack>
        </Stack>

        <Stack flexDirection="row" gap="$1">
          {project.isArchived ? (
            <Button
              onPress={handleRestore}
              disabled={isMutating}
              backgroundColor="$green8"
              color="white"
              opacity={isMutating ? 0.6 : 1}
            >
              {restoreMutation.isPending ? "Restoring..." : "Restore"}
            </Button>
          ) : (
            <Button
              onPress={handleArchive}
              disabled={isMutating}
              backgroundColor="$red8"
              color="white"
              opacity={isMutating ? 0.6 : 1}
            >
              {archiveMutation.isPending ? "Archiving..." : "Archive"}
            </Button>
          )}
        </Stack>
      </Stack>

      <Stack flexDirection="row" gap="$4" flexWrap="wrap">
        <Card padding="$4" gap="$2" flex={1} minWidth={280}>
          <Heading level={3}>Details</Heading>
          <Stack gap="$1">
            {project.description ? (
              <Text color="$gray11">{project.description}</Text>
            ) : null}
            <Stack flexDirection="row" gap="$4" flexWrap="wrap" marginTop="$2">
              <Stack gap="$1">
                <Text fontWeight="600" fontSize={13}>Workspace</Text>
                <Text fontSize={13}>{project.workspaceName}</Text>
              </Stack>
              <Stack gap="$1">
                <Text fontWeight="600" fontSize={13}>Owner</Text>
                <Text fontSize={13}>{project.owner.displayName}</Text>
              </Stack>
              <Stack gap="$1">
                <Text fontWeight="600" fontSize={13}>Created</Text>
                <Text fontSize={13}>{new Date(project.createdAt).toLocaleDateString()}</Text>
              </Stack>
              <Stack gap="$1">
                <Text fontWeight="600" fontSize={13}>Updated</Text>
                <Text fontSize={13}>{new Date(project.updatedAt).toLocaleDateString()}</Text>
              </Stack>
            </Stack>
          </Stack>
        </Card>

        <Card padding="$4" gap="$2" flex={1} minWidth={280}>
          <Heading level={3}>Activity Log</Heading>
          {project.activityLogs.length === 0 ? (
            <Text color="$gray11" fontSize={13}>No activity yet.</Text>
          ) : (
            <Stack gap="$2">
              {project.activityLogs.map((log) => (
                <Stack key={log.id} gap="$1" padding="$2" backgroundColor="$gray3" borderRadius={6}>
                  <Text fontSize={13}>{log.description}</Text>
                  <Stack flexDirection="row" gap="$2">
                    <Text color="$gray11" fontSize={11}>{log.actorName}</Text>
                    <Text color="$gray11" fontSize={11}>{new Date(log.createdAt).toLocaleDateString()}</Text>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          )}
        </Card>
      </Stack>
    </Stack>
  );
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }): React.ReactElement {
  const { id } = use(params);

  return (
    <AuthGuard
      fallback={
        <Stack flex={1} alignItems="center" justifyContent="center">
          <Text color="$gray11">Redirecting to sign in…</Text>
        </Stack>
      }
    >
      <DashboardLayout>
        <ErrorBoundary>
          <ToastProvider>
            <ProjectDetailContent id={id} />
          </ToastProvider>
        </ErrorBoundary>
      </DashboardLayout>
    </AuthGuard>
  );
}
