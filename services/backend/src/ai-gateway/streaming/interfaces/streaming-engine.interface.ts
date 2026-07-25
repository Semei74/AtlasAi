import type { StreamingChunk } from "./streaming-chunk.interface.js";
import type { StreamingRequest } from "./streaming-request.interface.js";
import type { StreamingOptions } from "./streaming-options.interface.js";

export const STREAMING_ENGINE = "STREAMING_ENGINE";

export interface StreamingEngine {
  stream(request: StreamingRequest, options?: StreamingOptions): AsyncIterable<StreamingChunk>;
}
