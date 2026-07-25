"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { AuthGuard } from "@atlas/auth";
import { Button, Card, Heading, Input, Stack, Text } from "@atlas/ui";
import { DashboardLayout } from "../../components/dashboard/dashboard-layout";
import { ErrorBoundary } from "../../components/dashboard/error-boundary";
import { EmptyState, ErrorState } from "../../components/dashboard/states";
import { StatisticCardSkeleton, CardSkeleton } from "../../components/dashboard/skeletons";
import { useWorkspaces, useProjectsPaginated, useArchiveProject, useRestoreProject } from "../../lib/queries";
import { ToastProvider, useToast } from "../../components/projects/toast-provider";
import { CreateProjectDialog } from "../../components/projects/create-project-dialog";
import { EditProjectDialog } from "../../components/projects/edit-project-dialog";
import { DeleteProjectDialog } from "../../components/projects/delete-project-dialog";
import type { ProjectItem } from "../../lib/dashboard-schemas";

const STATUS_OPTIONS = ["ALL", "ACTIVE", "DRAFT", "ARCHIVED", "COMPLETED"] as const;

function ProjectsContent(): React.ReactElement {
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "DRAFT" | "ARCHIVED" | "COMPLETED">("ALL");
  const [workspaceFilter, setWorkspaceFilter] = useState<string>("ALL");
  const [sort, setSort] = useState<"updatedAt" | "createdAt" | "name">("updatedAt");
  const [order, setOrder] = useState<"asc" | "desc">("desc");

  const projectStatusFilter: "ACTIVE" | "DRAFT" | "ARCHIVED" | "COMPLETED" | undefined = statusFilter !== "ALL" ? statusFilter : undefined;

  const { data: paginatedResult, isPending, isError, error, refetch } = useProjectsPaginated({
    page,
    limit: 20,
    search: search || undefined,
    status: projectStatusFilter,
    workspaceId: workspaceFilter !== "ALL" ? workspaceFilter : undefined,
    sort,
    order,
  });

  const { data: workspaces } = useWorkspaces();
  const archiveMutation = useArchiveProject();
  const restoreMutation = useRestoreProject();

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ProjectItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const handleRestore = useCallback((id: string, name: string) => {
    restoreMutation.mutate(id, {
      onSuccess: () => {
        showToast(`"${name}" restored`, "success");
      },
      onError: () => {
        showToast("Failed to restore project", "error");
      },
    });
  }, [restoreMutation, showToast]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((status: typeof statusFilter) => {
    setStatusFilter(status);
    setPage(1);
  }, []);

  const handleWorkspaceChange = useCallback((wsId: string) => {
    setWorkspaceFilter(wsId);
    setPage(1);
  }, []);

  const projects = paginatedResult?.items ?? [];
  const total = paginatedResult?.total ?? 0;
  const totalPages = paginatedResult?.totalPages ?? 0;
  const currentPage = paginatedResult?.page ?? 1;

  const statusCounts: Record<string, number> = {};
  if (paginatedResult?.items) {
    for (const p of paginatedResult.items) {
      statusCounts[p.status] = (statusCounts[p.status] ?? 0) + 1;
    }
  }

  if (isPending) {
    return (
      <Stack gap="$4">
        <Stack flexDirection="row" justifyContent="space-between" alignItems="center">
          <StatisticCardSkeleton />
          <StatisticCardSkeleton />
        </Stack>
        <CardSkeleton lines={3} />
        <CardSkeleton lines={3} />
        <CardSkeleton lines={3} />
      </Stack>
    );
  }

  if (isError) {
    return <ErrorState message={error.message} onRetry={() => void refetch()} />;
  }

  return (
    <Stack gap="$4">
      <Stack flexDirection="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap="$2">
        <Stack gap="$1">
          <Heading level={2}>Projects</Heading>
          <Text color="$gray11" fontSize={14}>
            {String(total)} total
            {Object.entries(statusCounts).map(([s, count]) => (
              count > 0 ? ` · ${String(count)} ${s.toLowerCase()}` : ""
            ))}
          </Text>
        </Stack>
        <Button onPress={() => { setCreateOpen(true); }}>Create Project</Button>
      </Stack>

      <Stack flexDirection="row" gap="$2" flexWrap="wrap" alignItems="center">
        <Input
          placeholder="Search projects..."
          value={search}
          onChangeText={handleSearchChange}
          flex={1}
          minWidth={200}
        />

        <Stack flexDirection="row" gap="$1" flexWrap="wrap" alignItems="center">
          <Text fontSize={13} color="$gray11">Status:</Text>
          {STATUS_OPTIONS.map((s) => (
            <Button
              key={s}
              size="$2"
              backgroundColor={statusFilter === s ? "$blue8" : "$gray5"}
              color={statusFilter === s ? "white" : "$text"}
              onPress={() => { handleStatusChange(s); }}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </Button>
          ))}
        </Stack>

        <Stack flexDirection="row" gap="$1" alignItems="center">
          <Text fontSize={13} color="$gray11">Sort:</Text>
          <Button
            size="$2"
            backgroundColor="$gray5"
            onPress={() => {
              if (sort === "updatedAt" && order === "desc") { setSort("updatedAt"); setOrder("asc"); }
              else if (sort === "updatedAt" && order === "asc") { setSort("name"); setOrder("asc"); }
              else if (sort === "name" && order === "asc") { setSort("name"); setOrder("desc"); }
              else if (sort === "name" && order === "desc") { setSort("createdAt"); setOrder("desc"); }
              else if (sort === "createdAt" && order === "desc") { setSort("createdAt"); setOrder("asc"); }
              else { setSort("updatedAt"); setOrder("desc"); }
              setPage(1);
            }}
          >
            {sort === "updatedAt" && order === "desc" ? "Newest Updated" :
             sort === "updatedAt" && order === "asc" ? "Oldest Updated" :
             sort === "name" && order === "asc" ? "Name A-Z" :
             sort === "name" && order === "desc" ? "Name Z-A" :
             sort === "createdAt" && order === "desc" ? "Newest Created" :
             "Oldest Created"}
          </Button>
        </Stack>
      </Stack>

      {workspaceFilter !== "ALL" && (
        <Stack flexDirection="row" gap="$1" alignItems="center">
          <Text fontSize={13} color="$gray11">Workspace:</Text>
          <Button size="$2" backgroundColor="$blue8" color="white" onPress={() => { handleWorkspaceChange("ALL"); }}>
            {workspaces?.find((w) => w.id === workspaceFilter)?.name ?? workspaceFilter} ✕
          </Button>
        </Stack>
      )}

      {projects.length === 0 ? (
        <EmptyState
          title={search || statusFilter !== "ALL" || workspaceFilter !== "ALL" ? "No matching projects" : "No projects yet"}
          description={search || statusFilter !== "ALL" || workspaceFilter !== "ALL" ? "Try adjusting your search or filters." : "Create your first project to get started."}
          actionLabel={!(search || statusFilter !== "ALL" || workspaceFilter !== "ALL") ? "Create Project" : undefined}
          onAction={!(search || statusFilter !== "ALL" || workspaceFilter !== "ALL") ? (): void => { setCreateOpen(true); } : undefined}
        />
      ) : (
        <Stack gap="$2">
          {projects.map((project) => (
            <Card key={project.id} padding="$4" gap="$2">
              <Stack flexDirection="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap="$2">
                <Stack gap="$1" flex={1}>
                  <Stack flexDirection="row" alignItems="center" gap="$2">
                    <Link href={`/projects/${project.id}`} style={{ textDecoration: "none" }}>
                      <Heading level={3} color="$blue10" hoverStyle={{ opacity: 0.8 }}>{project.name}</Heading>
                    </Link>
                    <Stack
                      paddingHorizontal="$2"
                      paddingVertical="$1"
                      borderRadius={4}
                      backgroundColor={
                        project.status === "ACTIVE" ? "$green3" :
                        project.status === "DRAFT" ? "$blue3" :
                        project.status === "ARCHIVED" ? "$gray5" : "$yellow3"
                      }
                    >
                      <Text fontSize={11} fontWeight="600">{project.status}</Text>
                    </Stack>
                  </Stack>
                  {project.description ? (
                    <Text color="$gray11" fontSize={13}>{project.description}</Text>
                  ) : null}
                  <Stack flexDirection="row" gap="$3" flexWrap="wrap">
                    <Text color="$gray11" fontSize={12}>
                      Owner: {project.owner.displayName}
                    </Text>
                    <Text color="$gray11" fontSize={12}>
                      Workspace: {workspaces?.find((w) => w.id === project.workspaceId)?.name ?? project.workspaceId.slice(0, 8)}
                    </Text>
                    <Text color="$gray11" fontSize={12}>
                      Updated: {new Date(project.updatedAt).toLocaleDateString()}
                    </Text>
                  </Stack>
                </Stack>

                <Stack flexDirection="row" gap="$1" alignItems="center">
                  <Link href={`/projects/${project.id}`}>
                    <Button size="$2" backgroundColor="$gray5" color="$text">View</Button>
                  </Link>
                  <Button
                    size="$2"
                    backgroundColor="$gray5"
                    color="$text"
                    onPress={() => { setEditTarget(project); }}
                  >
                    Edit
                  </Button>
                  {project.status === "ARCHIVED" ? (
                    <Button
                      size="$2"
                      backgroundColor="$green8"
                      color="white"
                      disabled={restoreMutation.isPending}
                      opacity={restoreMutation.isPending ? 0.6 : 1}
                      onPress={() => { handleRestore(project.id, project.name); }}
                    >
                      Restore
                    </Button>
                  ) : (
                    <Button
                      size="$2"
                      backgroundColor="$red8"
                      color="white"
                      disabled={archiveMutation.isPending}
                      opacity={archiveMutation.isPending ? 0.6 : 1}
                      onPress={() => {
                        archiveMutation.mutate(project.id, {
                          onSuccess: () => { showToast(`"${project.name}" archived`, "success"); },
                          onError: () => { showToast("Failed to archive project", "error"); },
                        });
                      }}
                    >
                      Archive
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Card>
          ))}

          {totalPages > 1 && (
            <Stack flexDirection="row" justifyContent="center" gap="$2" alignItems="center" padding="$2">
              <Button
                size="$2"
                backgroundColor="$gray5"
                disabled={currentPage <= 1}
                opacity={currentPage <= 1 ? 0.4 : 1}
                onPress={() => { setPage((p) => Math.max(1, p - 1)); }}
              >
                ← Prev
              </Button>
              <Text fontSize={13} color="$gray11">
                Page {currentPage} of {totalPages}
              </Text>
              <Button
                size="$2"
                backgroundColor="$gray5"
                disabled={currentPage >= totalPages}
                opacity={currentPage >= totalPages ? 0.4 : 1}
                onPress={() => { setPage((p) => Math.min(totalPages, p + 1)); }}
              >
                Next →
              </Button>
            </Stack>
          )}
        </Stack>
      )}

      <CreateProjectDialog open={createOpen} onClose={() => { setCreateOpen(false); }} />
      {editTarget && (
        <EditProjectDialog
          open={true}
          onClose={() => { setEditTarget(null); }}
          project={editTarget}
        />
      )}
      {deleteTarget && (
        <DeleteProjectDialog
          open={true}
          onClose={() => { setDeleteTarget(null); }}
          projectId={deleteTarget.id}
          projectName={deleteTarget.name}
        />
      )}
    </Stack>
  );
}

export default function ProjectsPage(): React.ReactElement {
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
            <ProjectsContent />
          </ToastProvider>
        </ErrorBoundary>
      </DashboardLayout>
    </AuthGuard>
  );
}
