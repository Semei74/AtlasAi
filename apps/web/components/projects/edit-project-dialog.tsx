"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Heading, Input, Stack, Text } from "@atlas/ui";
import { useUpdateProject } from "./project-mutations";
import { useToast } from "./toast-provider";
import { DialogOverlay } from "./dialog-overlay";
import { editProjectSchema, type EditProjectValues } from "./project-form-schemas";
import type { ProjectItem } from "../../lib/dashboard-schemas";

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "DRAFT", label: "Draft" },
  { value: "ARCHIVED", label: "Archived" },
  { value: "COMPLETED", label: "Completed" },
];

interface EditProjectDialogProps {
  open: boolean;
  onClose: () => void;
  project: ProjectItem;
}

export function EditProjectDialog({ open, onClose, project }: EditProjectDialogProps): React.ReactElement {
  const { showToast } = useToast();
  const updateMutation = useUpdateProject();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<EditProjectValues>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      name: project.name,
      description: project.description ?? "",
      status: project.status as EditProjectValues["status"],
    },
  });

  const submit = handleSubmit((values: EditProjectValues) => {
    setServerError(null);
    updateMutation.mutate(
      { id: project.id, values },
      {
        onSuccess: () => {
          showToast("Project updated successfully", "success");
          onClose();
        },
        onError: (error) => {
          setServerError(error instanceof Error ? error.message : "Failed to update project");
          showToast("Failed to update project", "error");
        },
      },
    );
  });

  return (
    <DialogOverlay open={open} onClose={onClose}>
      <Heading level={3}>Edit Project</Heading>
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
          <Text fontSize={14} fontWeight="600">Status</Text>
          <Stack gap="$1">
            {STATUS_OPTIONS.map((opt) => (
              <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input
                  type="radio"
                  value={opt.value}
                  {...register("status")}
                />
                <Text fontSize={14}>{opt.label}</Text>
              </label>
            ))}
          </Stack>
          {errors.status ? <Text color="$red10" fontSize={12}>{errors.status.message}</Text> : null}
        </Stack>

        {serverError ? <Text color="$red10" fontSize={13}>{serverError}</Text> : null}

        <Stack flexDirection="row" gap="$2" justifyContent="flex-end">
          <Button onPress={onClose} backgroundColor="$gray5" color="$text">Cancel</Button>
          <Button
            type="submit"
            disabled={updateMutation.isPending}
            opacity={updateMutation.isPending ? 0.6 : 1}
          >
            {updateMutation.isPending ? "Saving..." : "Save"}
          </Button>
        </Stack>
      </form>
    </DialogOverlay>
  );
}
