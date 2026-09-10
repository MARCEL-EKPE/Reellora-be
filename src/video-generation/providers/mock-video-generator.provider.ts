import { Injectable } from '@nestjs/common';
import {
  type VideoGenerator,
  type VideoGenerationRequest,
  type VideoGenerationResult,
  type VideoGenerationStatus,
} from '../../pipeline-core/interfaces/video-generation.interface';

@Injectable()
export class MockVideoGeneratorProvider implements VideoGenerator {
  async generate(request: VideoGenerationRequest): Promise<VideoGenerationResult> {
    return {
      providerTaskId: `mock-${request.sceneId}`,
      status: 'completed',
      outputUrl: `https://example.com/mock-${request.sceneId}.mp4`,
    };
  }

  async getStatus(providerTaskId: string): Promise<VideoGenerationStatus> {
    return {
      status: 'completed',
      outputUrl: `https://example.com/${providerTaskId}.mp4`,
    };
  }
}
