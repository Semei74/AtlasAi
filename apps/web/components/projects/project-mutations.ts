"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from "@tanstack/react-query";
import { useApi } from "../../lib/api";
import type { CreateProjectValues, EditProjectValues } from "./project-form-schemas";

interface UpdateProjectVariables {
  id: string;
  values: EditProjectValues;
}

export function useCreateProject(): UseMutationResult<unknown, unknown, CreateProjectValues> {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: CreateProjectValues) => {
      const response = await api.POST("/projects", {
        body: {
          name: values.name,
          description: values.description ?? null,
          workspaceId: values.workspaceId,
        },
      });
      if (!response.response.ok) {
        throw new Error("Failed to create project");
      }
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
      void queryClient.invalidateQueries({ queryKey: ["recent-projects"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-statistics"] });
    },
  });
}

export function useUpdateProject(): UseMutationResult<unknown, unknown, UpdateProjectVariables> {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, values }: UpdateProjectVariables) => {
      const response = await api.PATCH("/projects/{id}", {
        params: { path: { id } },
        body: {
          name: values.name,
          description: values.description ?? null,
          status: values.status,
        },
      });
      if (!response.response.ok) {
        throw new Error("Failed to update project");
      }
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
      void queryClient.invalidateQueries({ queryKey: ["recent-projects"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-statistics"] });
    },
  });
}

export function useDeleteProject(): UseMutationResult<unknown, unknown, string> {
  const api = useApi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.DELETE("/projects/{id}", {
        params: { path: { id } },
      });
      if (!response.response.ok && response.response.status !== 204) {
        throw new Error("Failed to delete project");
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["projects"] });
      void queryClient.invalidateQueries({ queryKey: ["recent-projects"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard-statistics"] });
    },
  });
}
