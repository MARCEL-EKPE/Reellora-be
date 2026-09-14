import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { INGESTION_QUEUE } from '../constants/queue-names.constant';
import { Video } from '../../pipeline-core/entities/video.entity';
import { VideoStatus } from '../../pipeline-core/enums/video-status.enum';
import { ContentIngestionService } from '../../content-ingestion/providers/content-ingestion.service';
import { ArticleIngestionService } from '../../content-ingestion/providers/article-ingestion.service';
import { PipelineOrchestratorService } from '../providers/pipeline-orchestrator.service';
import type { PipelineJob } from '../interfaces/pipeline-job.interface';

@Processor(INGESTION_QUEUE)
export class IngestionProcessor extends WorkerHost {
  private readonly logger = new Logger(IngestionProcessor.name);

  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    private readonly contentIngestionService: ContentIngestionService,
    private readonly articleIngestionService: ArticleIngestionService,
    private readonly orchestrator: PipelineOrchestratorService,
  ) {
    super();
  }

  async process(job: Job<PipelineJob>): Promise<void> {
    const { videoId } = job.data;
    this.logger.log(`[Ingestion] videoId=${videoId}`);

    const video = await this.videoRepository.findOne({
      where: { id: videoId },
      relations: ['article'],
    });
    if (!video || !video.article) {
      throw new Error(`Video ${videoId} has no linked article`);
    }

    const items = await this.contentIngestionService.discoverFeeds();
    await this.articleIngestionService.ingestArticles(items);

    video.status = VideoStatus.RESEARCHING;
    await this.videoRepository.save(video);
    await this.orchestrator.enqueue(videoId, 'research');
  }
}
