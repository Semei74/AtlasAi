import { Module } from "@nestjs/common";
import { VECTOR_SEARCH_SERVICE } from "./interfaces/vector-search.interface.js";
import { InMemoryVectorStore } from "./services/in-memory-vector-store.js";
import { VectorSearchServiceImpl } from "./services/vector-search.service.js";

@Module({
  providers: [
    InMemoryVectorStore,
    {
      provide: VECTOR_SEARCH_SERVICE,
      useFactory: (store: InMemoryVectorStore): VectorSearchServiceImpl => new VectorSearchServiceImpl(store),
      inject: [InMemoryVectorStore],
    },
  ],
  exports: [VECTOR_SEARCH_SERVICE, InMemoryVectorStore],
})
export class VectorSearchModule {}
