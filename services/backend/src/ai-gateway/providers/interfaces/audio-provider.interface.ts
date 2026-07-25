export type AudioTask = "tts" | "transcribe" | "translate";

export type AudioFormat = "mp3" | "wav" | "opus" | "flac" | "aac";

export type AudioVoice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";

export interface TextToSpeechRequest {
  readonly text: string;
  readonly voice: AudioVoice;
  readonly format: AudioFormat;
  readonly speed: number;
}

export interface TranscriptionRequest {
  readonly audioData: string;
  readonly format: AudioFormat;
  readonly language: string | null;
  readonly prompt: string | null;
}

export interface AudioResult {
  readonly data: string;
  readonly format: AudioFormat;
  readonly durationMs: number;
  readonly text: string | null;
}

export interface AudioProvider {
  readonly generateSpeech: (request: TextToSpeechRequest) => Promise<AudioResult>;
  readonly transcribe: (request: TranscriptionRequest) => Promise<AudioResult>;
  readonly translate: (request: TranscriptionRequest) => Promise<AudioResult>;
  readonly supportedVoices: readonly AudioVoice[];
  readonly supportedFormats: readonly AudioFormat[];
}
