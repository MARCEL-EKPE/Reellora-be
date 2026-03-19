import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MediaProcessingService } from './providers/media-processing.service';
import { MediaProcessorWorker } from './providers/media-processor.worker';
import { BullModule } from '@nestjs/bullmq';
import mediaProcessingConfig from './config/media-processing.config';
import { FfmpegProvider } from './providers/ffmpeg.provider';
import { TranscriptionProvider } from './providers/transcription.provider';
import { AiProvider } from './providers/ai.provider';
import { HighlightExtractionProvider } from './providers/highlight-extraction.provider';
import { TranscriptSummaryProvider } from './providers/transcript-summary.provider';
import { VisualHighlightsProvider } from './providers/visual-highlights.provider';
import { VideoSourceProvider } from './providers/video-source.provider';
import { VideoUploadProvider } from './providers/video-upload.provider';
import { TextToSpeechProvider } from './providers/text-to-speech.provider';
import { MediaScrapperModule } from 'src/media-scrapper/media-scrapper.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'video-processing' }),
    ConfigModule.forFeature(mediaProcessingConfig),
    MediaScrapperModule,
  ],
  providers: [
    MediaProcessingService,
    MediaProcessorWorker,
    FfmpegProvider,
    TranscriptionProvider,
    AiProvider,
    HighlightExtractionProvider,
    TranscriptSummaryProvider,
    VisualHighlightsProvider,
    VideoSourceProvider,
    VideoUploadProvider,
    TextToSpeechProvider,
  ],
  exports: [MediaProcessingService, TextToSpeechProvider, BullModule.registerQueue({ name: 'video-processing' })]
})
export class MediaProcessingModule { }
