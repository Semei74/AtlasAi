export { VectorSearchModule } from "./vector-search.module.js";
export { VECTOR_SEARCH_SERVICE } from "./interfaces/vector-search.interface.js";
export type { VectorSearchService, VectorSearchQuery, VectorSearchResult } from "./interfaces/vector-search.interface.js";
export type { VectorStore, VectorRecord, SearchResult } from "./interfaces/vector-store.interface.js";
export { InMemoryVectorStore } from "./services/in-memory-vector-store.js";
export { VectorSearchServiceImpl } from "./services/vector-search.service.js";
