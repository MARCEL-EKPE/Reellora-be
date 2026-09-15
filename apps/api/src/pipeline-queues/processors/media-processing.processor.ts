import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { RENDER_QUEUE } from '../constants/queue-names.constant';
import { Video } from '../../pipeline-core/entities/video.entity';
import { VideoStatus } from '../../pipeline-core/enums/video-status.enum';
import { AssetType } from '../../pipeline-core/enums/asset-type.enum';
import { VideoScene } from '../../pipeline-core/entities/video-scene.entity';
import { MediaAsset } from '../../pipeline-core/entities/media-asset.entity';
import { FfmpegCompositionProvider } from '../../media-processing/providers/ffmpeg-composition.provider';
import { AssetStorageService } from '../../assets/providers/asset-storage.service';
import { PipelineOrchestratorService } from '../providers/pipeline-orchestrator.service';
import type { PipelineJob } from '../../shared/interfaces/pipeline-job.interface';

@Processor(RENDER_QUEUE)
export class MediaProcessingProcessor extends WorkerHost {
  private readonly logger = new Logger(MediaProcessingProcessor.name);

  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    @InjectRepository(VideoScene)
    private readonly videoSceneRepository: Repository<VideoScene>,
    @InjectRepository(MediaAsset)
    private readonly mediaAssetRepository: Repository<MediaAsset>,
    private readonly ffmpegCompositionProvider: FfmpegCompositionProvider,
    private readonly assetStorageService: AssetStorageService,
    private readonly orchestrator: PipelineOrchestratorService,
  ) {
    super();
  }

  async process(job: Job<PipelineJob>): Promise<void> {
    const { videoId } = job.data;
    this.logger.log(`[MediaProcessing] videoId=${videoId}`);

    const video = await this.videoRepository.findOne({
      where: { id: videoId },
    });
    if (!video) {
      throw new Error(`Video ${videoId} not found`);
    }

    try {
      const scenes = await this.videoSceneRepository.find({
        where: { videoPlan: { video: { id: videoId } } },
        relations: ['assets'],
      });

      const sceneAssets = scenes
        .filter((scene) => scene.status === 'completed')
        .map((scene) => {
          const videoAsset = scene.assets?.find(
            (a) => a.type === AssetType.VIDEO,
          );
          const narrationAsset = scene.assets?.find(
            (a) => a.type === AssetType.AUDIO,
          );
          return {
            storageKey: videoAsset?.storageKey || '',
            durationSeconds: scene.durationSeconds || 5,
            narrationStorageKey: narrationAsset?.storageKey,
          };
        })
        .filter((s) => s.storageKey);

      const finalOutputPath = path.resolve(
        `./pipeline-output/${videoId}/final.mp4`,
      );

      await this.ffmpegCompositionProvider.compose({
        videoId,
        sceneAssets,
        finalOutputPath,
      });

      const buffer = await fs.promises.readFile(finalOutputPath);
      const asset = await this.assetStorageService.upload({
        key: `videos/${videoId}/final.mp4`,
        body: buffer,
        contentType: 'video/mp4',
      });

      const mediaAsset = this.mediaAssetRepository.create({
        video,
        type: AssetType.VIDEO,
        storageKey: asset.storageKey,
        url: asset.url,
        mimeType: 'video/mp4',
        sizeBytes: asset.sizeBytes,
      });
      await this.mediaAssetRepository.save(mediaAsset);

      video.status = VideoStatus.QUALITY_CHECK;
      await this.videoRepository.save(video);
      await this.orchestrator.enqueue(videoId, 'quality-check');
    } catch (error) {
      this.logger.error(
        `[MediaProcessing] failed for videoId=${videoId}`,
        error,
      );
      video.status = VideoStatus.RENDERING_FAILED;
      video.errorMessage =
        error instanceof Error ? error.message : String(error);
      await this.videoRepository.save(video);
      throw error;
    }
  }
}
