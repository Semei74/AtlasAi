import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { AsyncLocalStorage } from "node:async_hooks";
import type { CorrelationIdConfig, CorrelationIdService } from "../interfaces/correlation-id.interface.js";

const DEFAULT_CONFIG: CorrelationIdConfig = {
  headerName: "x-correlation-id",
  injectInResponse: true,
  responseHeaderName: "x-correlation-id",
};

@Injectable()
export class CorrelationIdServiceImpl implements CorrelationIdService {
  public readonly config: CorrelationIdConfig;
  private readonly storage: AsyncLocalStorage<string>;

  public constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.storage = new AsyncLocalStorage<string>();
  }

  public get(): string {
    return this.storage.getStore() ?? this.generate();
  }

  public set(id: string): void {
    this.storage.enterWith(id);
  }

  public generate(): string {
    return randomUUID();
  }

  public reset(): void {
    this.storage.disable();
  }
}
