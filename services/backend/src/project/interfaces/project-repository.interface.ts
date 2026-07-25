import type { Project } from "./project.interface.js";
import type { Prisma } from "../../generated/prisma/client.js";

export const PROJECT_REPOSITORY = "PROJECT_REPOSITORY";

export interface ProjectFindAllFilter {
  organizationId: string;
  search: string | undefined;
  status: string | undefined;
  workspaceId: string | undefined;
  sort: string | undefined;
  order: "asc" | "desc" | undefined;
  page: number;
  limit: number;
}

export interface ProjectWithOwner extends Project {
  ownerDisplayName: string;
  ownerAvatarUrl: string | null;
}

export interface ProjectFindAllResult {
  items: ProjectWithOwner[];
  total: number;
  page: number;
  limit: number;
}

export interface ProjectWithRelations extends Project {
  workspaceName: string | null;
  ownerName: string | null;
  ownerAvatarUrl: string | null;
}

export interface ProjectRepository {
  findById(id: string): Promise<Project | null>;
  findByOrganizationId(organizationId: string): Promise<Project[]>;
  findRecentByOrganizationId(organizationId: string, limit: number): Promise<Project[]>;
  countByOrganizationId(organizationId: string): Promise<number>;
  findAll(filter: ProjectFindAllFilter): Promise<ProjectFindAllResult>;
  findByIdWithDetails(id: string): Promise<ProjectWithRelations | null>;
  create(data: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<Project>;
  update(id: string, changes: Partial<Omit<Project, "id">>, tx?: Prisma.TransactionClient): Promise<Project>;
  softDelete(id: string): Promise<void>;
  archive(id: string, tx?: Prisma.TransactionClient): Promise<Project>;
  restore(id: string, tx?: Prisma.TransactionClient): Promise<Project>;
}
