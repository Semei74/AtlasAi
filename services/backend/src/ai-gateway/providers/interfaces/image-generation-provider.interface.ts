export type ImageSize = "256x256" | "512x512" | "1024x1024" | "1792x1024" | "1024x1792";

export type ImageQuality = "standard" | "hd";

export type ImageStyle = "natural" | "vivid" | "photographic" | "digital_art";

export interface ImageGenerationRequest {
  readonly prompt: string;
  readonly size: ImageSize;
  readonly quality: ImageQuality;
  readonly style: ImageStyle | null;
  readonly n: number;
}

export interface ImageGenerationResult {
  readonly url: string;
  readonly revisedPrompt: string | null;
  readonly size: ImageSize;
  readonly contentType: string;
}

export interface ImageGenerationProvider {
  readonly generate: (request: ImageGenerationRequest) => Promise<readonly ImageGenerationResult[]>;
  readonly supportedSizes: readonly ImageSize[];
  readonly maxBatchSize: number;
}
