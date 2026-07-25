import type { PrismaClient } from "../src/generated/prisma/client.js";

export async function seedMemberships(
  prisma: PrismaClient,
  organizationId: string,
  userId: string,
): Promise<void> {
  await prisma.membership.upsert({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
    update: { role: "Owner", status: "Active" },
    create: {
      organizationId,
      userId,
      role: "Owner",
      status: "Active",
    },
  });
}
