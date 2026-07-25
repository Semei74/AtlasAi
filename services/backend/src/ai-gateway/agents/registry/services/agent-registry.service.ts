import { Injectable } from "@nestjs/common";
import type { AgentDefinition } from "../../interfaces/agent-definition.interface.js";
import type { AgentCapabilities } from "../../interfaces/agent-capabilities.interface.js";
import { AgentState } from "../../interfaces/agent-state.enum.js";
import type { Registry } from "../interfaces/agent-registry.interface.js";
import type { AgentRegistration } from "../interfaces/agent-registration.interface.js";
import type { AgentDescriptor } from "../interfaces/agent-descriptor.interface.js";
import type { AgentHealthStatus } from "../interfaces/agent-health.interface.js";
import type { AgentVersionInfo } from "../interfaces/agent-version.interface.js";
import type { AgentSearchOptions, AgentSearchResult } from "../interfaces/agent-search-options.interface.js";
import type { AgentFilter } from "../interfaces/agent-filter.interface.js";
import { AgentDiscoveryService } from "./agent-discovery.service.js";
import { AgentHealthService } from "./agent-health.service.js";
import { AgentVersionService } from "./agent-version.service.js";

@Injectable()
export class AgentRegistryService implements Registry {
  private readonly agents = new Map<string, AgentDefinition>();
  private readonly metadata = new Map<string, Readonly<Record<string, unknown>>>();

  public constructor(
    private readonly discoveryService: AgentDiscoveryService,
    private readonly healthService: AgentHealthService,
    private readonly versionService: AgentVersionService,
  ) {}

  public register(definition: AgentDefinition): Promise<void> {
    if (this.agents.has(definition.id)) {
      return Promise.reject(new Error(`Agent with id "${definition.id}" is already registered`));
    }
    this.agents.set(definition.id, { ...definition });
    return Promise.resolve();
  }

  public registerFromRegistration(registration: AgentRegistration): Promise<string> {
    const id = this.generateId(registration.name);
    if (this.agents.has(id)) {
      return Promise.reject(new Error(`Agent with generated id "${id}" already exists`));
    }
    const now = new Date();
    const definition: AgentDefinition = {
      id,
      name: registration.name,
      description: registration.description,
      version: registration.version,
      capabilities: registration.capabilities,
      supportedModels: registration.supportedModels,
      supportedProviders: registration.supportedProviders,
      defaultModel: registration.defaultModel,
      defaultProvider: registration.defaultProvider,
      maxConcurrency: registration.maxConcurrency,
      timeoutMs: registration.timeoutMs,
      maxRetries: registration.maxRetries,
      state: AgentState.Ready,
      enabled: true,
      tags: [...registration.tags],
      createdAt: now,
      updatedAt: now,
    };
    this.agents.set(id, definition);
    this.metadata.set(id, { ...registration.metadata });

    const versionInfo: AgentVersionInfo = {
      agentId: id,
      version: registration.version,
      createdAt: now,
      changelog: "",
      deprecated: false,
      deprecationMessage: null,
      compatibility: {
        minRuntimeVersion: "1.0.0",
        maxRuntimeVersion: "99.0.0",
        breakingChanges: [],
      },
    };
    this.versionService.registerVersion(versionInfo).catch(() => {
      /* version registration error is non-fatal */
    });

    return Promise.resolve(id);
  }

  public unregister(agentId: string): Promise<boolean> {
    const deleted = this.agents.delete(agentId);
    if (deleted) {
      this.metadata.delete(agentId);
      this.versionService.removeAgentVersions(agentId).catch(() => {
        /* version cleanup error is non-fatal */
      });
    }
    return Promise.resolve(deleted);
  }

  public get(agentId: string): Promise<AgentDefinition | null> {
    return Promise.resolve(this.agents.get(agentId) ?? null);
  }

  public exists(agentId: string): Promise<boolean> {
    return Promise.resolve(this.agents.has(agentId));
  }

  public list(): Promise<readonly AgentDefinition[]> {
    return Promise.resolve([...this.agents.values()]);
  }

  public listByCapability(capability: keyof AgentCapabilities): Promise<readonly AgentDefinition[]> {
    return Promise.resolve(
      [...this.agents.values()].filter(
        (a) => a.capabilities[capability] && a.enabled,
      ),
    );
  }

  public listByOrganization(organizationId: string): Promise<readonly AgentDefinition[]> {
    return Promise.resolve(
      [...this.agents.values()].filter(
        (a) => a.tags.includes(organizationId) || a.tags.includes(`org:${organizationId}`),
      ),
    );
  }

  public listByWorkspace(workspaceId: string): Promise<readonly AgentDefinition[]> {
    return Promise.resolve(
      [...this.agents.values()].filter(
        (a) => a.tags.includes(workspaceId) || a.tags.includes(`ws:${workspaceId}`),
      ),
    );
  }

  public findByProvider(provider: string): Promise<readonly AgentDefinition[]> {
    return Promise.resolve(
      [...this.agents.values()].filter(
        (a) => a.supportedProviders.includes(provider) && a.enabled,
      ),
    );
  }

  public findByModel(model: string): Promise<readonly AgentDefinition[]> {
    return Promise.resolve(
      [...this.agents.values()].filter(
        (a) => a.supportedModels.includes(model) && a.enabled,
      ),
    );
  }

  public enable(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) return Promise.reject(new Error(`Agent "${agentId}" not found`));
    this.agents.set(agentId, { ...agent, enabled: true, state: AgentState.Ready, updatedAt: new Date() });
    return Promise.resolve();
  }

  public disable(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) return Promise.reject(new Error(`Agent "${agentId}" not found`));
    this.agents.set(agentId, { ...agent, enabled: false, state: AgentState.Disabled, updatedAt: new Date() });
    return Promise.resolve();
  }

  public getDescriptor(agentId: string): Promise<AgentDescriptor | null> {
    const agent = this.agents.get(agentId);
    if (!agent) return Promise.resolve(null);
    return this.healthService.getHealth(agentId).then((health) =>
      this.discoveryService.toDescriptor(agent, health),
    );
  }

  public search(options: AgentSearchOptions): Promise<AgentSearchResult> {
    const healthMap = this.buildHealthMap();
    return Promise.resolve(
      this.discoveryService.search([...this.agents.values()], healthMap, options),
    );
  }

  public filter(filter: AgentFilter): Promise<readonly AgentDescriptor[]> {
    const healthMap = this.buildHealthMap();
    return Promise.resolve(
      this.discoveryService.filter([...this.agents.values()], healthMap, filter),
    );
  }

  public getHealth(agentId: string): Promise<AgentHealthStatus> {
    return this.healthService.getHealth(agentId);
  }

  public updateHealth(agentId: string, status: Partial<AgentHealthStatus>): Promise<void> {
    return this.healthService.updateHealth(agentId, status);
  }

  public getVersionHistory(agentId: string): Promise<readonly AgentVersionInfo[]> {
    return this.versionService.getVersionHistory(agentId);
  }

  public getLatestVersion(agentId: string): Promise<AgentVersionInfo | null> {
    return this.versionService.getLatestVersion(agentId);
  }

  public deprecateVersion(agentId: string, version: string, message: string): Promise<void> {
    return this.versionService.deprecateVersion(agentId, version, message);
  }

  public getMetadata(agentId: string): Promise<Readonly<Record<string, unknown>> | null> {
    return Promise.resolve(this.metadata.get(agentId) ?? null);
  }

  public updateMetadata(agentId: string, metadata: Readonly<Record<string, unknown>>): Promise<void> {
    if (!this.agents.has(agentId)) {
      return Promise.reject(new Error(`Agent "${agentId}" not found`));
    }
    this.metadata.set(agentId, { ...metadata });
    return Promise.resolve();
  }

  private buildHealthMap(): Map<string, AgentHealthStatus> {
    return this.healthService.getAllHealthStates();
  }

  private generateId(name: string): string {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const suffix = crypto.randomUUID().slice(0, 8);
    return `${slug}-${suffix}`;
  }
}
