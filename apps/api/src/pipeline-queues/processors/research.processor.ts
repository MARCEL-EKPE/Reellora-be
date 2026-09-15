import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { RESEARCH_QUEUE } from '../constants/queue-names.constant';
import { Video } from '../../pipeline-core/entities/video.entity';
import { VideoStatus } from '../../pipeline-core/enums/video-status.enum';
import { Research } from '../../pipeline-core/entities/research.entity';
import { ResearchProvider } from '../../research/providers/research.provider';
import { PipelineOrchestratorService } from '../providers/pipeline-orchestrator.service';
import type { PipelineJob } from '../../shared/interfaces/pipeline-job.interface';

@Processor(RESEARCH_QUEUE)
export class ResearchProcessor extends WorkerHost {
  private readonly logger = new Logger(ResearchProcessor.name);

  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    @InjectRepository(Research)
    private readonly researchRepository: Repository<Research>,
    private readonly researchProvider: ResearchProvider,
    private readonly orchestrator: PipelineOrchestratorService,
  ) {
    super();
  }

  async process(job: Job<PipelineJob>): Promise<void> {
    const { videoId } = job.data;
    this.logger.log(`[Research] videoId=${videoId}`);

    const video = await this.videoRepository.findOne({
      where: { id: videoId },
      relations: ['newsItem'],
    });
    if (!video || !video.newsItem) {
      throw new Error(`Video ${videoId} has no linked news item`);
    }

    try {
      const result = await this.researchProvider.researchNewsItem(video.newsItem);

      const research = this.researchRepository.create({
        video,
        topic: result.topic,
        summary: result.summary,
        keyFacts: result.keyFacts,
        entities: result.entities,
        timeline: result.timeline,
        uncertainties: result.uncertainties,
        sources: result.sources,
      });

      await this.researchRepository.save(research);
      video.status = VideoStatus.SCRIPT_GENERATING;
      await this.videoRepository.save(video);
      await this.orchestrator.enqueue(videoId, 'script');
    } catch (error) {
      this.logger.error(`[Research] failed for videoId=${videoId}`, error);
      video.status = VideoStatus.RESEARCH_FAILED;
      video.errorMessage =
        error instanceof Error ? error.message : String(error);
      await this.videoRepository.save(video);
      throw error;
    }
  }
}
