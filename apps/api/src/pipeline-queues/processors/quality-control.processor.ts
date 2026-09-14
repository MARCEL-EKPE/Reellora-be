import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { QUALITY_CONTROL_QUEUE } from '../constants/queue-names.constant';
import { Video } from '../../pipeline-core/entities/video.entity';
import { VideoStatus } from '../../pipeline-core/enums/video-status.enum';
import { AssetType } from '../../pipeline-core/enums/asset-type.enum';
import { QualityCheck } from '../../pipeline-core/entities/quality-check.entity';
import { MediaAsset } from '../../pipeline-core/entities/media-asset.entity';
import { QualityControlProvider } from '../../quality-control/providers/quality-control.provider';
import { PipelineOrchestratorService } from '../providers/pipeline-orchestrator.service';
import type { PipelineJob } from '../interfaces/pipeline-job.interface';

@Processor(QUALITY_CONTROL_QUEUE)
export class QualityControlProcessor extends WorkerHost {
  private readonly logger = new Logger(QualityControlProcessor.name);

  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    @InjectRepository(QualityCheck)
    private readonly qualityCheckRepository: Repository<QualityCheck>,
    @InjectRepository(MediaAsset)
    private readonly mediaAssetRepository: Repository<MediaAsset>,
    private readonly qualityControlProvider: QualityControlProvider,
    private readonly orchestrator: PipelineOrchestratorService,
  ) {
    super();
  }

  async process(job: Job<PipelineJob>): Promise<void> {
    const { videoId } = job.data;
    this.logger.log(`[QualityControl] videoId=${videoId}`);

    const video = await this.videoRepository.findOne({
      where: { id: videoId },
    });
    if (!video) {
      throw new Error(`Video ${videoId} not found`);
    }

    try {
      const finalAsset = await this.mediaAssetRepository.findOne({
        where: { video: { id: videoId }, type: AssetType.VIDEO },
      });

      const finalOutputPath =
        finalAsset?.storageKey || `videos/${videoId}/final.mp4`;
      const result = await this.qualityControlProvider.validateVideo(
        videoId,
        finalOutputPath,
      );

      const check = this.qualityCheckRepository.create({
        video,
        status: result.passed ? 'passed' : 'failed',
        checkedAssetType: 'video',
        checks: result.checks,
        errorMessage: result.errorMessage,
      });
      await this.qualityCheckRepository.save(check);

      if (!result.passed) {
        video.status = VideoStatus.QUALITY_CHECK_FAILED;
        video.errorMessage = result.errorMessage || 'Quality check failed';
        await this.videoRepository.save(video);
        throw new Error(video.errorMessage);
      }

      video.status = VideoStatus.READY_TO_PUBLISH;
      await this.videoRepository.save(video);
      await this.orchestrator.enqueue(videoId, 'publish');
    } catch (error) {
      this.logger.error(
        `[QualityControl] failed for videoId=${videoId}`,
        error,
      );
      if (video.status !== VideoStatus.QUALITY_CHECK_FAILED) {
        video.status = VideoStatus.QUALITY_CHECK_FAILED;
        video.errorMessage =
          error instanceof Error ? error.message : String(error);
        await this.videoRepository.save(video);
      }
      throw error;
    }
  }
}
