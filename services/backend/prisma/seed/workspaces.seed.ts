import type { PrismaClient } from "../src/generated/prisma/client.js";

export const DEFAULT_WORKSPACE_ID = "00000000-0000-0000-0000-000000000020";

export async function seedWorkspaces(
  prisma: PrismaClient,
  organizationId: string,
): Promise<void> {
  await prisma.workspace.upsert({
    where: { id: DEFAULT_WORKSPACE_ID },
    update: {},
    create: {
      id: DEFAULT_WORKSPACE_ID,
      organizationId,
      name: "Default Workspace",
      description: "The default workspace for the default organization",
    },
  });
}
