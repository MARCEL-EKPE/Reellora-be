export interface VideoGenerationRequest {
  sceneId: string;
  prompt: string;
  durationSeconds?: number;
  referenceImageUrl?: string;
}

export interface VideoGenerationResult {
  providerTaskId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  outputUrl?: string;
  errorMessage?: string;
}

export interface VideoGenerationStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  outputUrl?: string;
  errorMessage?: string;
}

export const VIDEO_GENERATOR = Symbol('VIDEO_GENERATOR');

export interface VideoGenerator {
  generate(request: VideoGenerationRequest): Promise<VideoGenerationResult>;
  getStatus(providerTaskId: string): Promise<VideoGenerationStatus>;
}
