import { Injectable } from "@nestjs/common";
import type { AgentHealthStatus } from "../interfaces/agent-health.interface.js";

@Injectable()
export class AgentHealthService {
  private readonly healthStates = new Map<string, AgentHealthStatus>();

  public getHealth(agentId: string): Promise<AgentHealthStatus> {
    const health = this.healthStates.get(agentId);
    if (health === undefined) {
      return Promise.resolve({
        status: "unknown",
        lastChecked: null,
        responseTimeMs: null,
        lastError: null,
        consecutiveFailures: 0,
      });
    }
    return Promise.resolve({ ...health });
  }

  public updateHealth(agentId: string, status: Partial<AgentHealthStatus>): Promise<void> {
    const current = this.healthStates.get(agentId) ?? {
      status: "unknown",
      lastChecked: null,
      responseTimeMs: null,
      lastError: null,
      consecutiveFailures: 0,
    };
    this.healthStates.set(agentId, { ...current, ...status });
    return Promise.resolve();
  }

  public getAllHealthStates(): Map<string, AgentHealthStatus> {
    return new Map(this.healthStates);
  }

  public reportError(agentId: string, error: string): Promise<void> {
    const current = this.healthStates.get(agentId) ?? {
      status: "unknown",
      lastChecked: null,
      responseTimeMs: null,
      lastError: null,
      consecutiveFailures: 0,
    };
    this.healthStates.set(agentId, {
      ...current,
      status: "unhealthy",
      lastChecked: new Date(),
      lastError: error,
      consecutiveFailures: current.consecutiveFailures + 1,
    });
    return Promise.resolve();
  }
}
