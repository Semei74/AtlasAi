import type { PrismaClient } from "../src/generated/prisma/client.js";

export const DEFAULT_ADMIN_ID = "00000000-0000-0000-0000-000000000001";

export async function seedUsers(prisma: PrismaClient): Promise<{ id: string }> {
  const admin = await prisma.user.upsert({
    where: { id: DEFAULT_ADMIN_ID },
    update: {},
    create: {
      id: DEFAULT_ADMIN_ID,
      email: "admin@atlas-ai.local",
      passwordHash: "$argon2id$v=19$m=65536,t=3,p=4$placeholder",
      displayName: "Admin",
      status: "Active",
    },
  });

  return { id: admin.id };
}
