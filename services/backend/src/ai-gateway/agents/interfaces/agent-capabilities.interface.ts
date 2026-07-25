export interface AgentCapabilities {
  readonly reasoning: boolean;
  readonly planning: boolean;
  readonly toolExecution: boolean;
  readonly fileAnalysis: boolean;
  readonly codeGeneration: boolean;
  readonly knowledgeRetrieval: boolean;
  readonly workflowExecution: boolean;
  readonly collaboration: boolean;
  readonly memory: boolean;
  readonly streaming: boolean;
}
