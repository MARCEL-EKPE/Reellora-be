import { Injectable, BadRequestException, Logger, Inject } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import {
  type VideoGenerator,
  type VideoGenerationRequest,
  type VideoGenerationResult,
  type VideoGenerationStatus,
} from '../../pipeline-core/interfaces/video-generation.interface';
import videoGenerationConfig from '../config/video-generation.config';

@Injectable()
export class RunwayVideoGeneratorProvider implements VideoGenerator {
  private readonly logger = new Logger(RunwayVideoGeneratorProvider.name);

  constructor(
    @Inject(videoGenerationConfig.KEY)
    private readonly config: ConfigType<typeof videoGenerationConfig>,
  ) {}

  async generate(request: VideoGenerationRequest): Promise<VideoGenerationResult> {
    if (this.config.useMockVideoGeneration) {
      return this.getMockResult(request.sceneId);
    }

    if (!this.config.runwayApiKey) {
      throw new BadRequestException('Runway API key is not configured');
    }

    this.logger.warn('Runway video generation is not fully implemented');
    throw new BadRequestException('Runway video generation is not implemented');
  }

  async getStatus(providerTaskId: string): Promise<VideoGenerationStatus> {
    if (this.config.useMockVideoGeneration) {
      return this.getMockResult(providerTaskId);
    }

    if (!this.config.runwayApiKey) {
      throw new BadRequestException('Runway API key is not configured');
    }

    this.logger.warn('Runway status polling is not fully implemented');
    throw new BadRequestException('Runway status polling is not implemented');
  }

  private getMockResult(sceneId: string): VideoGenerationResult {
    return {
      providerTaskId: `runway-mock-${sceneId}`,
      status: 'completed',
      outputUrl: 'https://example.com/mock.mp4',
    };
  }
}
