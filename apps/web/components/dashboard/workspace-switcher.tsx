"use client";

import { useWorkspaces } from "../../lib/queries";
import { useLocalStorage } from "../../lib/use-local-storage";
import { Card, Heading, Stack, Text, Spinner } from "@atlas/ui";
import { EmptyState, ErrorState } from "./states";
import { trackEvent } from "@atlas/observability";

export function WorkspaceSwitcher(): React.ReactElement {
  const { data, isPending, isError, error, refetch } = useWorkspaces();
  const [selectedId, setSelectedId] = useLocalStorage<string | null>("atlas:workspace", null);

  if (isPending) {
    return (
      <Card padding="$4" gap="$2">
        <Heading level={3}>Workspaces</Heading>
        <Spinner size="small" />
      </Card>
    );
  }

  if (isError) {
    return (
      <Card padding="$4">
        <ErrorState message={error.message} onRetry={() => void refetch()} />
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card padding="$4">
        <EmptyState
          title="No workspaces yet"
          description="Create a workspace to organize your projects."
        />
      </Card>
    );
  }

  return (
    <Card padding="$4" gap="$2">
      <Heading level={3}>Workspaces</Heading>
      <Stack gap="$1">
        {data.map((workspace) => {
          const isActive = selectedId === workspace.id;
          return (
            <Stack
              key={workspace.id}
              padding="$2"
              borderRadius={8}
              borderWidth={isActive ? 1 : 0}
              borderColor={isActive ? "$blue8" : "$border"}
              backgroundColor={isActive ? "$blue2" : "transparent"}
              hoverStyle={{ backgroundColor: "$gray3" }}
              pressStyle={{ backgroundColor: "$gray4" }}
              onPress={() => {
                setSelectedId(workspace.id);
                trackEvent("workspace_selected", { workspaceId: workspace.id });
              }}
            >
              <Text fontWeight={isActive ? "700" : "400"}>{workspace.name}</Text>
              {workspace.description ? (
                <Text color="$gray11" fontSize={12}>
                  {workspace.description}
                </Text>
              ) : null}
            </Stack>
          );
        })}
      </Stack>
    </Card>
  );
}
