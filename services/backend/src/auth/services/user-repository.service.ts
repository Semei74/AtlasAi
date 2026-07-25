import { Injectable, Inject } from "@nestjs/common";
import type { UserRepository, UserRecord } from "../interfaces/user-repository.interface.js";
import { PrismaService } from "../../prisma/prisma.service.js";
import { UserStatus } from "../../generated/prisma/enums.js";

@Injectable()
export class UserRepositoryService implements UserRepository {
  public constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
  ) {}

  public async findByEmail(email: string): Promise<UserRecord | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (!user) return null;
    return this.toRecord(user);
  }

  public async findById(id: string): Promise<UserRecord | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) return null;
    return this.toRecord(user);
  }

  public async create(
    record: Omit<UserRecord, "createdAt" | "updatedAt">,
  ): Promise<UserRecord> {
    const user = await this.prisma.user.create({
      data: {
        id: record.id,
        email: record.email,
        passwordHash: record.passwordHash,
        displayName: record.displayName,
        status: record.status as UserStatus,
        avatarUrl: record.avatarUrl ?? null,
        bio: record.bio ?? null,
        timezone: record.timezone ?? null,
        theme: record.theme,
        locale: record.locale,
        emailNotifications: record.emailNotifications,
        pushNotifications: record.pushNotifications,
      },
    });
    return this.toRecord(user);
  }

  public async update(
    id: string,
    changes: Partial<Omit<UserRecord, "id">>,
  ): Promise<UserRecord> {
    const data: Record<string, unknown> = {};
    if (changes.email !== undefined) data["email"] = changes.email;
    if (changes.passwordHash !== undefined) data["passwordHash"] = changes.passwordHash;
    if (changes.displayName !== undefined) data["displayName"] = changes.displayName;
    if (changes.status !== undefined) data["status"] = changes.status;
    if (changes.avatarUrl !== undefined) data["avatarUrl"] = changes.avatarUrl;
    if (changes.bio !== undefined) data["bio"] = changes.bio;
    if (changes.timezone !== undefined) data["timezone"] = changes.timezone;
    if (changes.theme !== undefined) data["theme"] = changes.theme;
    if (changes.locale !== undefined) data["locale"] = changes.locale;
    if (changes.emailNotifications !== undefined)
      data["emailNotifications"] = changes.emailNotifications;
    if (changes.pushNotifications !== undefined)
      data["pushNotifications"] = changes.pushNotifications;

    const user = await this.prisma.user.update({
      where: { id },
      data: data as never,
    });
    return this.toRecord(user);
  }

  private toRecord(user: {
    id: string;
    email: string;
    passwordHash: string;
    displayName: string;
    status: string;
    avatarUrl: string | null;
    bio: string | null;
    timezone: string | null;
    theme: string;
    locale: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): UserRecord {
    return {
      id: user.id,
      email: user.email,
      passwordHash: user.passwordHash,
      displayName: user.displayName,
      status: user.status,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      timezone: user.timezone,
      theme: user.theme,
      locale: user.locale,
      emailNotifications: user.emailNotifications,
      pushNotifications: user.pushNotifications,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
