import { Injectable } from "@nestjs/common";
import type { AgentContext } from "../../interfaces/agent-context.interface.js";
import type { AgentMemoryEntry } from "../../interfaces/agent-memory.interface.js";
import type { MemoryAccessPolicy } from "../interfaces/agent-memory-policy.interface.js";

@Injectable()
export class MemoryPolicyService implements MemoryAccessPolicy {
  public canRead(context: AgentContext, entry: AgentMemoryEntry): boolean {
    if (entry.context.organizationId !== context.organizationId) return false;
    if (entry.type === "workspace" && entry.context.workspaceId !== context.workspaceId) return false;
    return true;
  }

  public canWrite(context: AgentContext, entry: AgentMemoryEntry): boolean {
    if (entry.context.organizationId !== context.organizationId) return false;
    if (entry.context.agentId !== context.agentId) return false;
    if (entry.type === "workspace" && entry.context.workspaceId !== context.workspaceId) return false;
    return true;
  }

  public canDelete(context: AgentContext, entry: AgentMemoryEntry): boolean {
    if (entry.context.organizationId !== context.organizationId) return false;
    if (entry.context.agentId !== context.agentId) return false;
    return true;
  }
}
