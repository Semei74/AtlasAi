import type { PrismaClient } from "../src/generated/prisma/client.js";

export const DEFAULT_CATEGORY_ID = "00000000-0000-0000-0000-000000000030";

export async function seedPromptCategories(prisma: PrismaClient): Promise<void> {
  await prisma.promptCategory.upsert({
    where: { id: DEFAULT_CATEGORY_ID },
    update: {},
    create: {
      id: DEFAULT_CATEGORY_ID,
      name: "General",
      slug: "general",
      description: "General-purpose prompts",
    },
  });
}
