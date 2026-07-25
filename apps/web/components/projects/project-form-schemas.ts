import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  workspaceId: z.string().min(1, "Workspace is required"),
});

export type CreateProjectValues = z.infer<typeof createProjectSchema>;

export const projectStatusEnum = z.enum(["ACTIVE", "ARCHIVED", "DRAFT", "COMPLETED"]);

export const editProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  status: projectStatusEnum,
});

export type EditProjectValues = z.infer<typeof editProjectSchema>;
