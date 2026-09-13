import { Injectable, Inject } from '@nestjs/common';
import {
  VIDEO_GENERATOR,
  type VideoGenerator,
  type VideoGenerationRequest,
  type VideoGenerationResult,
  type VideoGenerationStatus,
} from '../../pipeline-core/interfaces/video-generation.interface';

@Injectable()
export class VideoGenerationService implements VideoGenerator {
  constructor(
    @Inject(VIDEO_GENERATOR)
    private readonly generator: VideoGenerator,
  ) {}

  async generate(request: VideoGenerationRequest): Promise<VideoGenerationResult> {
    return this.generator.generate(request);
  }

  async getStatus(providerTaskId: string): Promise<VideoGenerationStatus> {
    return this.generator.getStatus(providerTaskId);
  }
}
