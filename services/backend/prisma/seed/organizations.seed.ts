import type { PrismaClient } from "../src/generated/prisma/client.js";

export const DEFAULT_ORG_ID = "00000000-0000-0000-0000-000000000010";

export async function seedOrganizations(
  prisma: PrismaClient,
  ownerId: string,
): Promise<{ id: string }> {
  const org = await prisma.organization.upsert({
    where: { id: DEFAULT_ORG_ID },
    update: {},
    create: {
      id: DEFAULT_ORG_ID,
      name: "Default Organization",
      slug: "default-org",
      ownerId,
    },
  });

  return { id: org.id };
}
