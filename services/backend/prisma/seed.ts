import { PrismaClient } from "./src/generated/prisma/client.js";
import { seedUsers } from "./seed/users.seed.js";
import { seedOrganizations } from "./seed/organizations.seed.js";
import { seedWorkspaces } from "./seed/workspaces.seed.js";
import { seedMemberships } from "./seed/memberships.seed.js";
import { seedPromptCategories } from "./seed/prompt-categories.seed.js";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const admin = await seedUsers(prisma);
  const org = await seedOrganizations(prisma, admin.id);
  await seedWorkspaces(prisma, org.id);
  await seedMemberships(prisma, org.id, admin.id);
  await seedPromptCategories(prisma);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
