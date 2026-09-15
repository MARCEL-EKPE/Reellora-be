import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ContentIngestionService } from '../../content-ingestion/providers/content-ingestion.service';
import { NewsItemIngestionService } from '../../content-ingestion/providers/news-item-ingestion.service';

@Injectable()
export class PipelineSchedulerService {
  private readonly logger = new Logger(PipelineSchedulerService.name);

  constructor(
    private readonly contentIngestionService: ContentIngestionService,
    private readonly newsItemIngestionService: NewsItemIngestionService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async discoverContent(): Promise<void> {
    this.logger.log('Scheduled content discovery started');

    try {
      const sourceDefinitions = this.contentIngestionService.getConfiguredSources();
      const itemsBySource = await this.contentIngestionService.discoverItemsBySource();
      await this.newsItemIngestionService.ingestFromSources(
        sourceDefinitions,
        itemsBySource,
      );
    } catch (error) {
      this.logger.error('Scheduled content discovery failed', error);
    }
  }
}
