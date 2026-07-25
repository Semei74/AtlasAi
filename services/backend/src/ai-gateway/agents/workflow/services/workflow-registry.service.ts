import { Injectable } from "@nestjs/common";
import type { WorkflowDefinition } from "../interfaces/workflow-definition.interface.js";
import type { WorkflowRegistry, WorkflowFilter } from "../interfaces/workflow-registry.interface.js";

@Injectable()
export class WorkflowRegistryService implements WorkflowRegistry {
  private readonly definitions = new Map<string, WorkflowDefinition>();

  public register(definition: WorkflowDefinition): Promise<WorkflowDefinition> {
    if (this.definitions.has(definition.id)) {
      return Promise.reject(new Error(`Workflow "${definition.id}" is already registered`));
    }
    this.definitions.set(definition.id, definition);
    return Promise.resolve(definition);
  }

  public unregister(id: string): Promise<boolean> {
    return Promise.resolve(this.definitions.delete(id));
  }

  public get(id: string): Promise<WorkflowDefinition | null> {
    return Promise.resolve(this.definitions.get(id) ?? null);
  }

  public list(filter?: WorkflowFilter): Promise<readonly WorkflowDefinition[]> {
    let results = [...this.definitions.values()];

    if (filter) {
      if (filter.organizationId) {
        results = results.filter((w) => w.organizationId === filter.organizationId);
      }
      if (filter.workspaceId) {
        results = results.filter((w) => w.workspaceId === filter.workspaceId);
      }
      if (filter.status) {
        results = results.filter((w) => w.status === filter.status);
      }
      if (filter.tags && filter.tags.length > 0) {
        const tags = filter.tags;
        results = results.filter((w) =>
          tags.some((tag) => w.tags.includes(tag)),
        );
      }
    }

    return Promise.resolve(results);
  }

  public update(id: string, partial: Partial<WorkflowDefinition>): Promise<WorkflowDefinition> {
    const existing = this.definitions.get(id);
    if (!existing) {
      return Promise.reject(new Error(`Workflow "${id}" not found`));
    }
    const updated: WorkflowDefinition = { ...existing, ...partial, id };
    this.definitions.set(id, updated);
    return Promise.resolve(updated);
  }

  public exists(id: string): Promise<boolean> {
    return Promise.resolve(this.definitions.has(id));
  }

  public count(organizationId?: string): Promise<number> {
    if (organizationId) {
      let total = 0;
      for (const def of this.definitions.values()) {
        if (def.organizationId === organizationId) total++;
      }
      return Promise.resolve(total);
    }
    return Promise.resolve(this.definitions.size);
  }
}
