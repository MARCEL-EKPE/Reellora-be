import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { PUBLISHING_QUEUE } from '../constants/queue-names.constant';
import { Video } from '../../pipeline-core/entities/video.entity';
import { VideoStatus } from '../../pipeline-core/enums/video-status.enum';
import { AssetType } from '../../pipeline-core/enums/asset-type.enum';
import { Publication } from '../../pipeline-core/entities/publication.entity';
import { MediaAsset } from '../../pipeline-core/entities/media-asset.entity';
import { Platform } from '../../pipeline-core/enums/platform.enum';
import { PublishingService } from '../../publishing/providers/publishing.service';
import type { PipelineJob } from '../../shared/interfaces/pipeline-job.interface';

@Processor(PUBLISHING_QUEUE)
export class PublishingProcessor extends WorkerHost {
  private readonly logger = new Logger(PublishingProcessor.name);

  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    @InjectRepository(Publication)
    private readonly publicationRepository: Repository<Publication>,
    @InjectRepository(MediaAsset)
    private readonly mediaAssetRepository: Repository<MediaAsset>,
    private readonly publishingService: PublishingService,
  ) {
    super();
  }

  async process(job: Job<PipelineJob>): Promise<void> {
    const { videoId } = job.data;
    this.logger.log(`[Publishing] videoId=${videoId}`);

    const video = await this.videoRepository.findOne({
      where: { id: videoId },
      relations: ['script'],
    });
    if (!video) {
      throw new Error(`Video ${videoId} not found`);
    }

    try {
      const finalAsset = await this.mediaAssetRepository.findOne({
        where: { video: { id: videoId }, type: AssetType.VIDEO },
      });
      const thumbnailAsset = await this.mediaAssetRepository.findOne({
        where: { video: { id: videoId }, type: AssetType.THUMBNAIL },
      });

      if (!finalAsset) {
        throw new Error(`No final video asset found for video ${videoId}`);
      }

      const result = await this.publishingService.publish(Platform.YOUTUBE, {
        videoId,
        title: video.title || video.script?.title || `Video ${videoId}`,
        description: video.description || '',
        tags: video.script?.tags || [],
        videoStorageKey: finalAsset.storageKey,
        thumbnailStorageKey: thumbnailAsset?.storageKey,
        visibility: 'unlisted',
      });

      const publication = this.publicationRepository.create({
        video,
        platform: Platform.YOUTUBE,
        status: result.status,
        platformVideoId: result.platformVideoId,
        platformVideoUrl: result.platformVideoUrl,
        publishedAt: result.publishedAt,
        errorMessage: result.errorMessage,
      });
      await this.publicationRepository.save(publication);

      if (result.status === 'published') {
        video.status = VideoStatus.PUBLISHED;
      } else if (result.status === 'failed') {
        video.status = VideoStatus.PUBLISHING_FAILED;
        video.errorMessage = result.errorMessage || 'Publishing failed';
      } else {
        video.status = VideoStatus.PUBLISHING;
      }

      await this.videoRepository.save(video);
    } catch (error) {
      this.logger.error(`[Publishing] failed for videoId=${videoId}`, error);
      video.status = VideoStatus.PUBLISHING_FAILED;
      video.errorMessage =
        error instanceof Error ? error.message : String(error);
      await this.videoRepository.save(video);
      throw error;
    }
  }
}
