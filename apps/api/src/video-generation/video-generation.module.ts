import { Module } from '@nestjs/common';
import { ConfigModule, type ConfigType } from '@nestjs/config';
import videoGenerationConfig from './config/video-generation.config';
import { RunwayVideoGeneratorProvider } from './providers/runway-video-generator.provider';
import { MockVideoGeneratorProvider } from './providers/mock-video-generator.provider';
import { VideoGenerationService } from './providers/video-generation.service';
import { VIDEO_GENERATOR } from '../pipeline-core/interfaces/video-generation.interface';
import { GenerationProvider } from '../pipeline-core/enums/generation-provider.enum';

@Module({
  imports: [ConfigModule.forFeature(videoGenerationConfig)],
  providers: [
    RunwayVideoGeneratorProvider,
    MockVideoGeneratorProvider,
    VideoGenerationService,
    {
      provide: VIDEO_GENERATOR,
      useFactory: (
        config: ConfigType<typeof videoGenerationConfig>,
        runway: RunwayVideoGeneratorProvider,
        mock: MockVideoGeneratorProvider,
      ) => {
        const provider = config.useMockVideoGeneration
          ? GenerationProvider.MOCK
          : config.provider || GenerationProvider.RUNWAY;
        return provider === GenerationProvider.MOCK ? mock : runway;
      },
      inject: [
        videoGenerationConfig.KEY,
        RunwayVideoGeneratorProvider,
        MockVideoGeneratorProvider,
      ],
    },
  ],
  exports: [VIDEO_GENERATOR, VideoGenerationService],
})
export class VideoGenerationModule {}
