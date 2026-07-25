import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { rootLogger } from "@atlas/logger";
import { ConfigurationError } from "@atlas/errors";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  public constructor() {
    const connectionString = process.env["DATABASE_URL"];
    if (!connectionString) {
      throw new ConfigurationError("DATABASE_URL environment variable is required");
    }
    const adapter = new PrismaPg({ connectionString });
    super({ adapter });
  }

  public async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      rootLogger.info("Connected to PostgreSQL via Prisma");
    } catch {
      rootLogger.warn("Could not connect to PostgreSQL");
    }
  }

  public async onModuleDestroy(): Promise<void> {
    try {
      await this.$disconnect();
      rootLogger.info("Disconnected from PostgreSQL");
    } catch {
      // ignore disconnect errors
    }
  }
}
