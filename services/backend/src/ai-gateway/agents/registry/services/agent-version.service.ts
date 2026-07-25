import { Injectable } from "@nestjs/common";
import type { AgentVersionInfo } from "../interfaces/agent-version.interface.js";

@Injectable()
export class AgentVersionService {
  private readonly versions = new Map<string, AgentVersionInfo[]>();

  public getVersionHistory(agentId: string): Promise<readonly AgentVersionInfo[]> {
    const versions = this.versions.get(agentId);
    return Promise.resolve(versions !== undefined ? [...versions] : []);
  }

  public getLatestVersion(agentId: string): Promise<AgentVersionInfo | null> {
    const versions = this.versions.get(agentId);
    if (versions === undefined || versions.length === 0) {
      return Promise.resolve(null);
    }
    const sorted = [...versions].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
    return Promise.resolve(sorted[0] ?? null);
  }

  public registerVersion(info: AgentVersionInfo): Promise<void> {
    const existing = this.versions.get(info.agentId) ?? [];
    const isDuplicate = existing.some((v) => v.version === info.version);
    if (isDuplicate) {
      return Promise.reject(new Error(`Version "${info.version}" is already registered for agent "${info.agentId}"`));
    }
    this.versions.set(info.agentId, [...existing, info]);
    return Promise.resolve();
  }

  public deprecateVersion(agentId: string, version: string, message: string): Promise<void> {
    const existing = this.versions.get(agentId);
    if (existing === undefined) {
      return Promise.reject(new Error(`No versions found for agent "${agentId}"`));
    }
    const updated = existing.map((v) =>
      v.version === version
        ? { ...v, deprecated: true, deprecationMessage: message }
        : v,
    );
    this.versions.set(agentId, updated);
    return Promise.resolve();
  }

  public removeAgentVersions(agentId: string): Promise<void> {
    this.versions.delete(agentId);
    return Promise.resolve();
  }
}
