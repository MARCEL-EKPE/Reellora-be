import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsItem, NewsItemStatus } from '../pipeline-core/entities/news-item.entity';
import { Video } from '../pipeline-core/entities/video.entity';
import { VideoStatus } from '../pipeline-core/enums/video-status.enum';
import { PipelineOrchestratorService } from '../pipeline-queues/providers/pipeline-orchestrator.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectRepository(NewsItem)
    private readonly newsItemRepository: Repository<NewsItem>,
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    private readonly orchestrator: PipelineOrchestratorService,
  ) {}

  async getFeed(category?: string, limit = 50): Promise<NewsItem[]> {
    const query: Record<string, unknown> = {
      status: NewsItemStatus.PUBLISHED_TO_FEED,
    };
    if (category) {
      query.category = { slug: category };
    }

    return this.newsItemRepository.find({
      where: query,
      order: { publishedAt: 'DESC' },
      take: limit,
      relations: ['category', 'feed', 'assets'],
    });
  }

  async requestVideoGeneration(newsItemId: string): Promise<Video> {
    const newsItem = await this.newsItemRepository.findOne({
      where: { id: newsItemId },
    });
    if (!newsItem) {
      throw new NotFoundException(`News item ${newsItemId} not found`);
    }

    const existing = await this.videoRepository.findOne({
      where: { newsItem: { id: newsItemId } },
    });
    if (existing) {
      this.logger.log(
        `Video already exists for news item ${newsItemId}; returning existing video ${existing.id}`,
      );
      return existing;
    }

    const video = this.videoRepository.create({
      newsItemId,
      status: VideoStatus.QUEUED,
      title: newsItem.title,
    });
    const saved = await this.videoRepository.save(video);

    await this.orchestrator.enqueueFromRequest(saved.id);

    return saved;
  }

  async getVideoStatus(videoId: string): Promise<Video> {
    const video = await this.videoRepository.findOne({
      where: { id: videoId },
      relations: ['newsItem', 'assets', 'publications'],
    });
    if (!video) {
      throw new NotFoundException(`Video ${videoId} not found`);
    }
    return video;
  }

  async listVideos(limit = 50): Promise<Video[]> {
    return this.videoRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['newsItem', 'assets', 'publications'],
    });
  }
}
