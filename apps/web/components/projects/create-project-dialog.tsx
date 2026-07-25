"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Heading, Input, Stack, Text } from "@atlas/ui";
import { useWorkspaces } from "../../lib/queries";
import { useCreateProject } from "./project-mutations";
import { useToast } from "./toast-provider";
import { DialogOverlay } from "./dialog-overlay";
import { createProjectSchema, type CreateProjectValues } from "./project-form-schemas";

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateProjectDialog({ open, onClose }: CreateProjectDialogProps): React.ReactElement {
  const { showToast } = useToast();
  const { data: workspaces } = useWorkspaces();
  const createMutation = useCreateProject();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateProjectValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { name: "", description: "", workspaceId: "" },
  });

  const submit = handleSubmit((values: CreateProjectValues) => {
    setServerError(null);
    createMutation.mutate(values, {
      onSuccess: () => {
        showToast("Project created successfully", "success");
        reset();
        onClose();
      },
      onError: (error) => {
        setServerError(error instanceof Error ? error.message : "Failed to create project");
        showToast("Failed to create project", "error");
      },
    });
  });

  return (
    <DialogOverlay open={open} onClose={onClose}>
      <Heading level={3}>Create Project</Heading>
      <form onSubmit={(event) => { void submit(event); }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Stack gap="$2">
          <Text fontSize={14} fontWeight="600">Name</Text>
          <Input {...register("name")} placeholder="Project name" />
          {errors.name ? <Text color="$red10" fontSize={12}>{errors.name.message}</Text> : null}
        </Stack>

        <Stack gap="$2">
          <Text fontSize={14} fontWeight="600">Description</Text>
          <Input {...register("description")} placeholder="Optional description" />
          {errors.description ? <Text color="$red10" fontSize={12}>{errors.description.message}</Text> : null}
        </Stack>

        <Stack gap="$2">
          <Text fontSize={14} fontWeight="600">Workspace</Text>
          <Stack gap="$1">
            {workspaces?.map((ws) => (
              <label key={ws.id} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="radio"
                  value={ws.id}
                  {...register("workspaceId")}
                />
                <Text fontSize={14}>{ws.name}</Text>
              </label>
            ))}
          </Stack>
          {errors.workspaceId ? <Text color="$red10" fontSize={12}>{errors.workspaceId.message}</Text> : null}
        </Stack>

        {serverError ? <Text color="$red10" fontSize={13}>{serverError}</Text> : null}

        <Stack flexDirection="row" gap="$2" justifyContent="flex-end">
          <Button onPress={onClose} backgroundColor="$gray5" color="$text">Cancel</Button>
          <Button
            type="submit"
            disabled={createMutation.isPending}
            opacity={createMutation.isPending ? 0.6 : 1}
          >
            {createMutation.isPending ? "Creating..." : "Create"}
          </Button>
        </Stack>
      </form>
    </DialogOverlay>
  );
}
