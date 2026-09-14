import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from '../../pipeline-core/entities/video.entity';
import { VideoStatus } from '../../pipeline-core/enums/video-status.enum';
import { ContentIngestionService } from '../../content-ingestion/providers/content-ingestion.service';
import { ArticleIngestionService } from '../../content-ingestion/providers/article-ingestion.service';
import { PipelineOrchestratorService } from './pipeline-orchestrator.service';

@Injectable()
export class PipelineSchedulerService {
  private readonly logger = new Logger(PipelineSchedulerService.name);

  constructor(
    private readonly contentIngestionService: ContentIngestionService,
    private readonly articleIngestionService: ArticleIngestionService,
    private readonly orchestrator: PipelineOrchestratorService,
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async discoverAndStartPipeline(): Promise<void> {
    this.logger.log('Scheduled feed discovery started');

    try {
      const items = await this.contentIngestionService.discoverFeeds();
      const articles = await this.articleIngestionService.ingestArticles(items);

      for (const article of articles.slice(0, 5)) {
        const existingVideo = await this.videoRepository.findOne({
          where: { article: { id: article.id } },
        });
        if (existingVideo) {
          continue;
        }

        const video = this.videoRepository.create({
          status: VideoStatus.DISCOVERED,
          title: article.title,
          article,
        });
        const saved = await this.videoRepository.save(video);
        await this.orchestrator.startPipeline(saved.id);
      }
    } catch (error) {
      this.logger.error('Scheduled pipeline discovery failed', error);
    }
  }
}
