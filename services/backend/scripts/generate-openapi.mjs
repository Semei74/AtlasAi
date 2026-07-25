import "reflect-metadata";
import { writeFileSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");

const specPath = resolve(PROJECT_ROOT, "openapi.json");
const spec = JSON.parse(readFileSync(specPath, "utf-8"));

spec.components ??= {};
spec.components.schemas ??= {};

// ── Dashboard ───────────────────────────────────────────────────────────────

spec.components.schemas.DashboardStatisticsResponseDto = {
  type: "object",
  properties: {
    workspacesCount: { type: "integer", description: "Number of workspaces in the organization", example: 5 },
    organizationsCount: { type: "integer", description: "Number of organizations the user belongs to", example: 2 },
    projectsCount: { type: "integer", description: "Number of active projects in the organization", example: 12 },
    activeUsersCount: { type: "integer", description: "Number of active members in the organization", example: 8 },
  },
  required: ["workspacesCount", "organizationsCount", "projectsCount", "activeUsersCount"],
};

// ── Activity ────────────────────────────────────────────────────────────────

spec.components.schemas.RecentActivityQueryDto = {
  type: "object",
  properties: {
    limit: { type: "integer", description: "Maximum number of activity entries to return", default: 10, maximum: 50 },
  },
};

spec.components.schemas.ActivityEntryDto = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid", description: "Activity entry ID" },
    type: { type: "string", description: "Activity type", example: "CREATED" },
    actor: {
      type: "object",
      properties: {
        id: { type: "string", format: "uuid", description: "Actor user ID" },
        displayName: { type: "string", description: "Actor display name", example: "Jane Doe" },
      },
      required: ["id", "displayName"],
    },
    description: { type: "string", description: "Activity description", example: 'Project "Q4 Campaign" created' },
    createdAt: { type: "string", format: "date-time", description: "Date the activity occurred", example: "2025-01-01T00:00:00.000Z" },
  },
  required: ["id", "type", "actor", "description", "createdAt"],
};

spec.components.schemas.RecentProjectsQueryDto = {
  type: "object",
  properties: {
    limit: { type: "integer", description: "Maximum number of projects to return", default: 10, maximum: 50 },
  },
};

// ── Project DTOs ────────────────────────────────────────────────────────────

spec.components.schemas.CreateProjectDto = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1, maxLength: 200, description: "Project name" },
    description: { type: "string", nullable: true, description: "Project description" },
    workspaceId: { type: "string", format: "uuid", description: "Workspace ID" },
  },
  required: ["name", "workspaceId"],
};

spec.components.schemas.UpdateProjectStatusEnum = {
  type: "string",
  enum: ["ACTIVE", "ARCHIVED", "DRAFT", "COMPLETED"],
};

spec.components.schemas.UpdateProjectDto = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 1, maxLength: 200, description: "Project name" },
    description: { type: "string", nullable: true, description: "Project description" },
    status: { $ref: "#/components/schemas/UpdateProjectStatusEnum" },
  },
};

spec.components.schemas.ProjectOwnerDto = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid", description: "Owner user ID" },
    displayName: { type: "string", description: "Owner display name", example: "Jane Doe" },
    avatarUrl: { type: "string", nullable: true, description: "Owner avatar URL" },
  },
  required: ["id", "displayName", "avatarUrl"],
};

spec.components.schemas.ProjectResponseDto = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid", description: "Project ID" },
    name: { type: "string", description: "Project name", example: "Q4 Campaign" },
    description: { type: "string", nullable: true, description: "Project description" },
    status: { type: "string", description: "Project status", enum: ["ACTIVE", "DRAFT", "ARCHIVED", "COMPLETED"] },
    workspaceId: { type: "string", format: "uuid", description: "Workspace ID" },
    organizationId: { type: "string", format: "uuid", description: "Organization ID" },
    owner: { $ref: "#/components/schemas/ProjectOwnerDto" },
    createdAt: { type: "string", format: "date-time", description: "Creation date" },
    updatedAt: { type: "string", format: "date-time", description: "Last update date" },
  },
  required: ["id", "name", "status", "workspaceId", "organizationId", "owner", "createdAt", "updatedAt"],
};

spec.components.schemas.ProjectSortField = {
  type: "string",
  enum: ["updatedAt", "createdAt", "name"],
};

spec.components.schemas.ProjectSortOrder = {
  type: "string",
  enum: ["asc", "desc"],
};

spec.components.schemas.ProjectListQueryDto = {
  type: "object",
  properties: {
    page: { type: "integer", description: "Page number", default: 1, minimum: 1 },
    limit: { type: "integer", description: "Items per page", default: 20, minimum: 1, maximum: 100 },
    search: { type: "string", description: "Search term for name or description" },
    status: { type: "string", enum: ["ACTIVE", "DRAFT", "ARCHIVED", "COMPLETED"], description: "Filter by status" },
    workspaceId: { type: "string", format: "uuid", description: "Filter by workspace ID" },
    sort: { $ref: "#/components/schemas/ProjectSortField" },
    order: { $ref: "#/components/schemas/ProjectSortOrder" },
  },
};

spec.components.schemas.ProjectListResponseDto = {
  type: "object",
  properties: {
    items: { type: "array", items: { $ref: "#/components/schemas/ProjectResponseDto" }, description: "List of projects" },
    total: { type: "integer", description: "Total number of projects matching the filter", example: 42 },
    page: { type: "integer", description: "Current page number", example: 1 },
    limit: { type: "integer", description: "Items per page", example: 20 },
    totalPages: { type: "integer", description: "Total number of pages", example: 3 },
  },
  required: ["items", "total", "page", "limit", "totalPages"],
};

spec.components.schemas.ProjectActivityLogEntryDto = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid", description: "Activity entry ID" },
    type: { type: "string", description: "Activity type", example: "CREATED" },
    description: { type: "string", description: "Activity description", example: 'Project "Q4 Campaign" created' },
    actorName: { type: "string", description: "Actor display name", example: "Jane Doe" },
    createdAt: { type: "string", format: "date-time", description: "Date the activity occurred" },
  },
  required: ["id", "type", "description", "actorName", "createdAt"],
};

spec.components.schemas.ProjectDetailResponseDto = {
  type: "object",
  properties: {
    id: { type: "string", format: "uuid", description: "Project ID" },
    name: { type: "string", description: "Project name", example: "Q4 Campaign" },
    description: { type: "string", nullable: true, description: "Project description" },
    status: { type: "string", enum: ["ACTIVE", "DRAFT", "ARCHIVED", "COMPLETED"] },
    workspaceId: { type: "string", format: "uuid", description: "Workspace ID" },
    workspaceName: { type: "string", description: "Workspace name", example: "Marketing" },
    organizationId: { type: "string", format: "uuid", description: "Organization ID" },
    owner: { $ref: "#/components/schemas/ProjectOwnerDto" },
    createdAt: { type: "string", format: "date-time", description: "Creation date" },
    updatedAt: { type: "string", format: "date-time", description: "Last update date" },
    isArchived: { type: "boolean", description: "Whether the project is archived" },
    activityLogs: { type: "array", items: { $ref: "#/components/schemas/ProjectActivityLogEntryDto" }, description: "Recent activity logs" },
  },
  required: ["id", "name", "status", "workspaceId", "workspaceName", "organizationId", "owner", "createdAt", "updatedAt", "isArchived", "activityLogs"],
};

// ── Ensure 2xx responses have content ───────────────────────────────────────

for (const [, methods] of Object.entries(spec.paths)) {
  for (const operation of Object.values(methods)) {
    if (operation?.responses) {
      for (const [statusCode, response] of Object.entries(operation.responses)) {
        if (!response.content && statusCode.startsWith("2")) {
          response.content = { "application/json": { schema: { type: "object" } } };
        }
      }
    }
  }
}

// ── Project paths ───────────────────────────────────────────────────────────

spec.paths["/projects"] = {
  post: {
    tags: ["Projects"],
    summary: "Create a new project",
    operationId: "ProjectController_create",
    security: [{ bearer: [] }],
    requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/CreateProjectDto" } } } },
    responses: {
      "201": { description: "Project created", content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectResponseDto" } } } },
      "422": { description: "Validation error" },
    },
  },
  get: {
    tags: ["Projects"],
    summary: "List projects for the current organization with pagination, search, and filters",
    operationId: "ProjectController_findAll",
    security: [{ bearer: [] }],
    parameters: [
      { name: "page", in: "query", required: false, schema: { type: "integer", default: 1, minimum: 1 }, description: "Page number" },
      { name: "limit", in: "query", required: false, schema: { type: "integer", default: 20, minimum: 1, maximum: 100 }, description: "Items per page" },
      { name: "search", in: "query", required: false, schema: { type: "string" }, description: "Search term for name or description" },
      { name: "status", in: "query", required: false, schema: { type: "string", enum: ["ACTIVE", "DRAFT", "ARCHIVED", "COMPLETED"] }, description: "Filter by status" },
      { name: "workspaceId", in: "query", required: false, schema: { type: "string", format: "uuid" }, description: "Filter by workspace ID" },
      { name: "sort", in: "query", required: false, schema: { type: "string", enum: ["updatedAt", "createdAt", "name"] }, description: "Sort field" },
      { name: "order", in: "query", required: false, schema: { type: "string", enum: ["asc", "desc"] }, description: "Sort order" },
    ],
    responses: {
      "200": { description: "Paginated list of projects", content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectListResponseDto" } } } },
    },
  },
};

spec.paths["/projects/recent"] = {
  get: {
    tags: ["Projects"],
    summary: "List recent projects for the current organization",
    operationId: "ProjectController_findRecent",
    security: [{ bearer: [] }],
    parameters: [
      { name: "limit", in: "query", required: false, schema: { type: "integer", default: 10, maximum: 50 }, description: "Maximum number of projects to return" },
    ],
    responses: {
      "200": { description: "List of recent projects", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/ProjectResponseDto" } } } } },
    },
  },
};

spec.paths["/projects/{id}"] = {
  get: {
    tags: ["Projects"],
    summary: "Get project by ID with full details",
    operationId: "ProjectController_findById",
    security: [{ bearer: [] }],
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
    responses: {
      "200": { description: "Project details with activity logs", content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectDetailResponseDto" } } } },
      "404": { description: "Project not found" },
    },
  },
  patch: {
    tags: ["Projects"],
    summary: "Update project",
    operationId: "ProjectController_update",
    security: [{ bearer: [] }],
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
    requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/UpdateProjectDto" } } } },
    responses: {
      "200": { description: "Project updated", content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectResponseDto" } } } },
      "404": { description: "Project not found" },
      "422": { description: "Validation error" },
    },
  },
  delete: {
    tags: ["Projects"],
    summary: "Soft-delete project",
    operationId: "ProjectController_delete",
    security: [{ bearer: [] }],
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
    responses: {
      "204": { description: "Project archived" },
      "404": { description: "Project not found" },
    },
  },
};

spec.paths["/projects/{id}/archive"] = {
  patch: {
    tags: ["Projects"],
    summary: "Archive a project",
    operationId: "ProjectController_archive",
    security: [{ bearer: [] }],
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
    responses: {
      "200": { description: "Project archived", content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectResponseDto" } } } },
      "404": { description: "Project not found" },
      "409": { description: "Project is already archived" },
    },
  },
};

spec.paths["/projects/{id}/restore"] = {
  patch: {
    tags: ["Projects"],
    summary: "Restore an archived project",
    operationId: "ProjectController_restore",
    security: [{ bearer: [] }],
    parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
    responses: {
      "200": { description: "Project restored", content: { "application/json": { schema: { $ref: "#/components/schemas/ProjectResponseDto" } } } },
      "404": { description: "Project not found" },
      "409": { description: "Project is not archived" },
    },
  },
};

// ── Dashboard + Activity paths ──────────────────────────────────────────────

spec.paths["/dashboard/statistics"] = {
  get: {
    tags: ["Dashboard"],
    summary: "Get dashboard statistics for the current organization",
    operationId: "DashboardController_getStatistics",
    security: [{ bearer: [] }],
    parameters: [],
    responses: {
      "200": {
        description: "Dashboard statistics",
        content: { "application/json": { schema: { $ref: "#/components/schemas/DashboardStatisticsResponseDto" } } },
      },
    },
  },
};

spec.paths["/activity/recent"] = {
  get: {
    tags: ["Activity"],
    summary: "List recent activity for the current organization",
    operationId: "ActivityController_findRecent",
    security: [{ bearer: [] }],
    parameters: [
      { name: "limit", in: "query", required: false, schema: { type: "integer", default: 10, maximum: 50 }, description: "Maximum number of activity entries to return" },
    ],
    responses: {
      "200": {
        description: "List of recent activity entries",
        content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/ActivityEntryDto" } } } },
      },
    },
  },
};

// ── Write ───────────────────────────────────────────────────────────────────

writeFileSync(specPath, JSON.stringify(spec, null, 2), "utf-8");

console.log(`OpenAPI spec updated at ${specPath}`);
console.log(`Paths: ${Object.keys(spec.paths).length}, Schemas: ${Object.keys(spec.components?.schemas ?? {}).length}`);

// ── Validate ────────────────────────────────────────────────────────────────

const missingContent = [];
for (const [path, methods] of Object.entries(spec.paths)) {
  for (const operation of Object.values(methods)) {
    if (operation?.responses) {
      for (const [statusCode, response] of Object.entries(operation.responses)) {
        if (statusCode.startsWith("2") && statusCode !== "204" && !response.content) {
          missingContent.push(`[${path}] ${statusCode}`);
        }
      }
    }
  }
}
if (missingContent.length > 0) {
  console.log("WARNING — responses without content:");
  missingContent.forEach((m) => console.log(`  ${m}`));
} else {
  console.log("All 2xx responses have content schema ✅");
}
