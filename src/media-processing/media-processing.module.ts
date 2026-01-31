import { Module } from '@nestjs/common';
import { MediaProcessingService } from './providers/media-processing.service';
import { MediaProcessorWorker } from './providers/media-processor.worker';
import { BullModule } from '@nestjs/bullmq';
import { FfmpegProvider } from './providers/ffmpeg.provider';

@Module({
  imports: [BullModule.registerQueue({
    name: 'video-processing'
  })],
  providers: [MediaProcessingService, MediaProcessorWorker, FfmpegProvider],
  exports: [MediaProcessingService, BullModule.registerQueue({ name: 'video-processing' })]
})
export class MediaProcessingModule { }
