import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MediaProcessingService } from './providers/media-processing.service';
import { MediaProcessorWorker } from './providers/media-processor.worker';
import { BullModule } from '@nestjs/bullmq';
import mediaProcessingConfig from './config/media-processing.config';
import { FfmpegProvider } from './providers/ffmpeg.provider';
import { TranscriptionProvider } from './providers/transcription.provider';
import { AiProvider } from './providers/ai.provider';
import { VideoSourceProvider } from './providers/video-source.provider';
import { VideoUploadProvider } from './providers/video-upload.provider';
import { TextToSpeechProvider } from './providers/text-to-speech.provider';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'video-processing' }),
    ConfigModule.forFeature(mediaProcessingConfig),
  ],
  providers: [
    MediaProcessingService,
    MediaProcessorWorker,
    FfmpegProvider,
    TranscriptionProvider,
    AiProvider,
    VideoSourceProvider,
    VideoUploadProvider,
    TextToSpeechProvider,
  ],
  exports: [MediaProcessingService, TextToSpeechProvider, BullModule.registerQueue({ name: 'video-processing' })]
})
export class MediaProcessingModule { }
