import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MediaPipelineOrchestratorService } from './providers/media-pipeline-orchestrator.service';
import { MediaJobsWorker } from './providers/media-jobs.worker';
import { BullModule } from '@nestjs/bullmq';
import mediaProcessingConfig from './config/media-processing.config';
import { FfmpegProvider } from './providers/ffmpeg.provider';
import { TranscriptionProvider } from './providers/transcription.provider';
import { TranscriptHighlightExtractorProvider } from './providers/transcript-highlight-extractor.provider';
import { NewsSummaryProvider } from './providers/news-summary.provider';
import { VisionFrameSelectorProvider } from './providers/vision-frame-selector.provider';
import { VideoIngestProvider } from './providers/video-ingest.provider';
import { VideoUploadProvider } from './providers/video-upload.provider';
import { TextToSpeechProvider } from './providers/text-to-speech.provider';
import { MediaScrapperModule } from 'src/media-scrapper/media-scrapper.module';
import { ShutterstockProvider } from './providers/shutterstock.provider';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'video-processing' }),
    ConfigModule.forFeature(mediaProcessingConfig),
    MediaScrapperModule,
  ],
  providers: [
    MediaPipelineOrchestratorService,
    MediaJobsWorker,
    FfmpegProvider,
    TranscriptionProvider,
    TranscriptHighlightExtractorProvider,
    NewsSummaryProvider,
    VisionFrameSelectorProvider,
    VideoIngestProvider,
    VideoUploadProvider,
    TextToSpeechProvider,
    ShutterstockProvider,
  ],
  exports: [MediaPipelineOrchestratorService, TextToSpeechProvider, BullModule.registerQueue({ name: 'video-processing' })]
})
export class MediaProcessingModule { }
