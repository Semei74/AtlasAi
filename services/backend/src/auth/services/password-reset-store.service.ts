import { Injectable, Inject } from "@nestjs/common";
import type {
  PasswordResetStore,
  PasswordResetTokenData,
} from "../password/interfaces/password-reset-store.interface.js";
import { PrismaService } from "../../prisma/prisma.service.js";

@Injectable()
export class PasswordResetStoreService implements PasswordResetStore {
  public constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  public async save(token: string, userId: string, expiresAt: Date): Promise<void> {
    await this.prisma.passwordResetToken.create({
      data: { token, userId, expiresAt },
    });
  }

  public async find(token: string): Promise<PasswordResetTokenData | null> {
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { token },
    });
    if (!record) return null;
    return {
      userId: record.userId,
      expiresAt: record.expiresAt,
      consumed: record.consumed,
    };
  }

  public async markConsumed(token: string): Promise<void> {
    await this.prisma.passwordResetToken.update({
      where: { token },
      data: { consumed: true },
    });
  }

  public async invalidateByUser(userId: string): Promise<void> {
    await this.prisma.passwordResetToken.updateMany({
      where: { userId, consumed: false },
      data: { consumed: true },
    });
  }
}
