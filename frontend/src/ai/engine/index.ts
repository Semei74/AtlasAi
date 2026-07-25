export { ConversationEngine } from './conversation';
export type {
  ConversationSettings,
  ConversationMetadata,
  ConversationSummary,
  ConversationFilter,
  ConversationData,
  ConversationEngineState,
  ExportOptions,
  ImportResult,
} from './conversation';

export { StreamingEngine, StreamParser, TypingIndicator } from './streaming';
export type {
  StreamState,
  StreamEvent,
  StreamBuffer,
  StreamMetrics,
  StreamConfig,
  StreamEventType,
} from './streaming';
export { DEFAULT_STREAM_CONFIG, STREAM_STATE_MACHINE } from './streaming';

export {
  AIProvider,
  OpenAIProvider,
  AnthropicProvider,
  GeminiProvider,
  DeepSeekProvider,
  OllamaProvider,
  OpenRouterProvider,
  ProviderRegistry,
  createDefaultRegistry,
  ProviderFactory,
} from './providers';
export type {
  ProviderId,
  ProviderStatus,
  Capability,
  ProviderCapabilities,
  ProviderConfig,
  ModelInfo,
  ChatRequest,
  ChatRequestMessage,
  ToolDefinition,
  ToolCall,
  ChatResponse,
  StreamChunk,
  TokenUsage,
  ProviderHealth,
  EmbeddingRequest,
  EmbeddingResponse,
  ProviderStats,
} from './providers';

export { PromptRuntime } from './prompt';
export type {
  PromptDefinition,
  PromptScope,
  PromptVariable,
  PromptMergeResult,
  PromptValidationResult,
  PromptValidationError,
  PromptContext,
  PromptPreview,
} from './prompt';

export { Retriever, Chunker, ContextBuilder, CitationBuilder, EmbeddingProviderAdapter } from './rag';
export type {
  IEmbeddingProvider,
  Chunk,
  ChunkMetadata,
  RetrievalQuery,
  RetrievalResult,
  ScoredChunk,
  ContextBuilderConfig,
  BuiltContext,
  Citation,
  RetrieverPipelineStep,
  ContextSource,
  ContextScope,
  ChunkerConfig,
  RetrievalStrategy,
} from './rag';

export { DocumentPipeline, OCRInterface, parsers } from './documents';
export type {
  DocumentFormat,
  DocumentProcessingStage,
  DocumentParseResult,
  ParsedMetadata,
  DocumentSection,
  OCRResult,
  OCRBlock,
  DocumentProcessingResult,
  DocumentParser,
  IOCRInterface,
  MetadataExtractor,
} from './documents';

export { ToolRegistry, ToolExecutor } from './tools';
export type {
  ToolDefinition as ToolDef,
  ToolParameter,
  ToolCallRequest,
  ToolCallResult,
  ToolContext,
  ToolValidationResult,
  ToolValidationError,
  PermissionCheck,
  ToolPermission,
} from './tools';

export { ConversationMemory } from './memory';
export type {
  ConversationSummary as MemoryConversationSummary,
  RollingContext,
  MemoryMessage,
  ContextWindow,
  TokenBudget,
  HistoryCompressionResult,
  MemoryConfig,
} from './memory';

export { SearchEngine } from './search';
export type {
  SearchQuery,
  SearchResult,
  SearchResponse,
  SearchProvider,
  RankingFunction,
  SearchScope,
  SearchType,
  SearchFilters,
} from './search';

export {
  useConversation,
  useConversationList,
  usePinnedConversations,
  useArchivedConversations,
  useRecentConversations,
  useCreateConversation,
  useDeleteConversation,
  useRenameConversation,
  useTogglePinConversation,
  useToggleArchiveConversation,
  useExportConversation,
  useImportConversation,
  useConversationMessages,
  useAddMessage,
  useUpdateMessage,
  useRemoveLastAssistantMessage,
  useStreamingChat,
  useProviders,
  useActiveProvider,
  useProviderHealth,
  useProviderModels,
  useProviderCapabilities,
  useRegisteredPrompts,
  useRegisterPrompt,
  useRenderPrompt,
  useValidatePrompt,
  usePreviewPrompt,
  useMergePrompts,
  useKnowledgeRetrieval,
  useBuildContext,
  useAddChunks,
  useChunkDocument,
  useConversationSearch,
  useGlobalSearch,
  useIndexItem,
  useProcessDocument,
  useConversationContext,
  useTokenBudget,
  useConversationSummary,
  useAddMemoryMessage,
  useCompressMemory,
  conversationEngine,
  getProviderRegistry,
  promptRuntime,
  retriever,
  chunker,
  contextBuilder,
  searchEngine,
  documentPipeline,
  conversationMemory,
} from './hooks';

export { EngineStore, engineStore } from './state';
export type { EngineState, UIState, ConversationState, StreamingState, ProviderState, RuntimeState, MemoryState } from './state';

export type { EngineConfig, EngineEvent, EngineEventType, EngineEventListener, PaginationParams, PaginatedResult, SortParams, FilterParams } from './types';
