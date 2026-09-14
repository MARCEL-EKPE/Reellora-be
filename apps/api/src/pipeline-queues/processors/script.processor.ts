import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { SCRIPT_QUEUE } from '../constants/queue-names.constant';
import { Video } from '../../pipeline-core/entities/video.entity';
import { VideoStatus } from '../../pipeline-core/enums/video-status.enum';
import { Script } from '../../pipeline-core/entities/script.entity';
import { ScriptProvider } from '../../script/providers/script.provider';
import { PipelineOrchestratorService } from '../providers/pipeline-orchestrator.service';
import type { PipelineJob } from '../interfaces/pipeline-job.interface';
import type { ResearchResult } from '../../research/interfaces/research.interface';

@Processor(SCRIPT_QUEUE)
export class ScriptProcessor extends WorkerHost {
  private readonly logger = new Logger(ScriptProcessor.name);

  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    @InjectRepository(Script)
    private readonly scriptRepository: Repository<Script>,
    private readonly scriptProvider: ScriptProvider,
    private readonly orchestrator: PipelineOrchestratorService,
  ) {
    super();
  }

  async process(job: Job<PipelineJob>): Promise<void> {
    const { videoId } = job.data;
    this.logger.log(`[Script] videoId=${videoId}`);

    const video = await this.videoRepository.findOne({
      where: { id: videoId },
      relations: ['research'],
    });
    if (!video || !video.research) {
      throw new Error(`Video ${videoId} has no linked research`);
    }

    try {
      const result = await this.scriptProvider.generateScript(
        video.research as ResearchResult,
      );

      const script = this.scriptRepository.create({
        video,
        title: result.title,
        hook: result.hook,
        sections: result.sections,
        conclusion: result.conclusion,
        fullText: result.fullText,
        keywords: result.keywords,
        tags: result.tags,
        thumbnailConcept: result.thumbnailConcept,
        estimatedDurationSeconds: result.estimatedDurationSeconds,
      });

      await this.scriptRepository.save(script);
      video.status = VideoStatus.PLANNING;
      await this.videoRepository.save(video);
      await this.orchestrator.enqueue(videoId, 'plan');
    } catch (error) {
      this.logger.error(`[Script] failed for videoId=${videoId}`, error);
      video.status = VideoStatus.SCRIPT_GENERATION_FAILED;
      video.errorMessage =
        error instanceof Error ? error.message : String(error);
      await this.videoRepository.save(video);
      throw error;
    }
  }
}
