import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PipelineCoreModule } from '../pipeline-core/pipeline-core.module';
import { PipelineOrchestratorService } from './providers/pipeline-orchestrator.service';
import { PipelineSchedulerService } from './providers/pipeline-scheduler.service';
import { ResearchProcessor } from './processors/research.processor';
import { ScriptProcessor } from './processors/script.processor';
import { VideoPlanningProcessor } from './processors/video-planning.processor';
import { VideoGenerationProcessor } from './processors/video-generation.processor';
import { MediaProcessingProcessor } from './processors/media-processing.processor';
import { QualityControlProcessor } from './processors/quality-control.processor';
import { PublishingProcessor } from './processors/publishing.processor';
import { ContentIngestionModule } from '../content-ingestion/content-ingestion.module';
import { ResearchModule } from '../research/research.module';
import { ScriptModule } from '../script/script.module';
import { VideoPlanningModule } from '../video-planning/video-planning.module';
import { VideoGenerationModule } from '../video-generation/video-generation.module';
import { AssetsModule } from '../assets/assets.module';
import { MediaProcessingModule } from '../media-processing/media-processing.module';
import { QualityControlModule } from '../quality-control/quality-control.module';
import { PublishingModule } from '../publishing/publishing.module';
import {
  RESEARCH_QUEUE,
  SCRIPT_QUEUE,
  VIDEO_PLANNING_QUEUE,
  VIDEO_GENERATION_QUEUE,
  RENDER_QUEUE,
  QUALITY_CONTROL_QUEUE,
  PUBLISHING_QUEUE,
} from './constants/queue-names.constant';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: RESEARCH_QUEUE },
      { name: SCRIPT_QUEUE },
      { name: VIDEO_PLANNING_QUEUE },
      { name: VIDEO_GENERATION_QUEUE },
      { name: RENDER_QUEUE },
      { name: QUALITY_CONTROL_QUEUE },
      { name: PUBLISHING_QUEUE },
    ),
    PipelineCoreModule,
    ContentIngestionModule,
    ResearchModule,
    ScriptModule,
    VideoPlanningModule,
    VideoGenerationModule,
    AssetsModule,
    MediaProcessingModule,
    QualityControlModule,
    PublishingModule,
  ],
  providers: [
    PipelineOrchestratorService,
    PipelineSchedulerService,
    ResearchProcessor,
    ScriptProcessor,
    VideoPlanningProcessor,
    VideoGenerationProcessor,
    MediaProcessingProcessor,
    QualityControlProcessor,
    PublishingProcessor,
  ],
  exports: [PipelineOrchestratorService],
})
export class PipelineQueuesModule {}
