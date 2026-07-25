import { Injectable, Inject } from "@nestjs/common";
import type { PasswordHistoryStore } from "../password/interfaces/password-history-store.interface.js";
import { PrismaService } from "../../prisma/prisma.service.js";

@Injectable()
export class PasswordHistoryStoreService implements PasswordHistoryStore {
  public constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  public async add(userId: string, passwordHash: string): Promise<void> {
    await this.prisma.passwordHistory.create({
      data: { userId, passwordHash },
    });
  }

  public async getAll(userId: string): Promise<readonly string[]> {
    const records = await this.prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { passwordHash: true },
    });
    return records.map((r) => r.passwordHash);
  }
}
