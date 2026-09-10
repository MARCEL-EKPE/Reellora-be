import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import mediaProcessingConfig from './config/media-processing.config';
import { AudioMixingProvider } from './providers/audio-mixing.provider';
import { FfmpegCompositionProvider } from './providers/ffmpeg-composition.provider';
import { SubtitleProvider } from './providers/subtitle.provider';

@Module({
  imports: [ConfigModule.forFeature(mediaProcessingConfig)],
  providers: [FfmpegCompositionProvider, AudioMixingProvider, SubtitleProvider],
  exports: [FfmpegCompositionProvider],
})
export class MediaProcessingModule {}
