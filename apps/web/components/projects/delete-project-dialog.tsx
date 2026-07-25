"use client";

import { Button, Heading, Stack, Text } from "@atlas/ui";
import { useDeleteProject } from "./project-mutations";
import { useToast } from "./toast-provider";
import { DialogOverlay } from "./dialog-overlay";

interface DeleteProjectDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
}

export function DeleteProjectDialog({ open, onClose, projectId, projectName }: DeleteProjectDialogProps): React.ReactElement {
  const { showToast } = useToast();
  const deleteMutation = useDeleteProject();

  const handleDelete = (): void => {
    deleteMutation.mutate(projectId, {
      onSuccess: () => {
        showToast("Project archived successfully", "success");
        onClose();
      },
      onError: () => {
        showToast("Failed to archive project", "error");
      },
    });
  };

  return (
    <DialogOverlay open={open} onClose={onClose}>
      <Heading level={3}>Archive Project</Heading>
      <Text color="$gray11">
        Are you sure you want to archive "{projectName}"? This action can be reversed by changing the project status back to Active.
      </Text>

      {deleteMutation.isError ? (
        <Text color="$red10" fontSize={13}>
          {deleteMutation.error instanceof Error ? deleteMutation.error.message : "Failed to archive project"}
        </Text>
      ) : null}

      <Stack flexDirection="row" gap="$2" justifyContent="flex-end">
        <Button onPress={onClose} backgroundColor="$gray5" color="$text">Cancel</Button>
        <Button
          onPress={handleDelete}
          disabled={deleteMutation.isPending}
          backgroundColor="$red8"
          color="white"
          opacity={deleteMutation.isPending ? 0.6 : 1}
        >
          {deleteMutation.isPending ? "Archiving..." : "Archive"}
        </Button>
      </Stack>
    </DialogOverlay>
  );
}
