import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
import { VIDEO_GENERATION_QUEUE } from '../constants/queue-names.constant';
import { VideoScene } from '../../pipeline-core/entities/video-scene.entity';
import { SceneStatus } from '../../pipeline-core/enums/scene-status.enum';
import { GenerationJob } from '../../pipeline-core/entities/generation-job.entity';
import { GenerationProvider } from '../../pipeline-core/enums/generation-provider.enum';
import { AssetType } from '../../pipeline-core/enums/asset-type.enum';
import { Video } from '../../pipeline-core/entities/video.entity';
import { MediaAsset } from '../../pipeline-core/entities/media-asset.entity';
import { VideoGenerationService } from '../../video-generation/providers/video-generation.service';
import { AssetStorageService } from '../../assets/providers/asset-storage.service';
import { PipelineOrchestratorService } from '../providers/pipeline-orchestrator.service';
import type { SceneGenerationJob } from '../../shared/interfaces/pipeline-job.interface';

@Processor(VIDEO_GENERATION_QUEUE)
export class VideoGenerationProcessor extends WorkerHost {
  private readonly logger = new Logger(VideoGenerationProcessor.name);

  constructor(
    @InjectRepository(VideoScene)
    private readonly videoSceneRepository: Repository<VideoScene>,
    @InjectRepository(GenerationJob)
    private readonly generationJobRepository: Repository<GenerationJob>,
    @InjectRepository(MediaAsset)
    private readonly mediaAssetRepository: Repository<MediaAsset>,
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    private readonly videoGenerationService: VideoGenerationService,
    private readonly assetStorageService: AssetStorageService,
    private readonly orchestrator: PipelineOrchestratorService,
  ) {
    super();
  }

  async process(job: Job<SceneGenerationJob>): Promise<void> {
    const { videoId, sceneId } = job.data;
    this.logger.log(`[VideoGeneration] sceneId=${sceneId} videoId=${videoId}`);

    const scene = await this.videoSceneRepository.findOne({
      where: { id: sceneId },
      relations: ['videoPlan', 'videoPlan.video'],
    });
    if (!scene) {
      throw new Error(`Scene ${sceneId} not found`);
    }

    try {
      scene.status = SceneStatus.GENERATING;
      await this.videoSceneRepository.save(scene);

      const prompt =
        typeof scene.visual?.prompt === 'string'
          ? scene.visual.prompt
          : `Scene for video ${videoId}`;

      const result = await this.videoGenerationService.generate({
        sceneId,
        prompt,
        durationSeconds: scene.durationSeconds ?? undefined,
      });

      const generationJob = this.generationJobRepository.create({
        sceneId,
        provider: GenerationProvider.RUNWAY,
        providerTaskId: result.providerTaskId,
        status: result.status,
        prompt,
        outputUrl: result.outputUrl,
        errorMessage: result.errorMessage,
        startedAt: new Date(),
      });
      await this.generationJobRepository.save(generationJob);

      if (result.outputUrl) {
        const video = await this.videoRepository.findOne({
          where: { id: videoId },
        });
        if (video) {
          const asset = this.mediaAssetRepository.create({
            video,
            scene,
            type: AssetType.VIDEO,
            storageKey: `videos/${videoId}/scenes/${sceneId}/video.mp4`,
            url: result.outputUrl,
            mimeType: 'video/mp4',
            durationSeconds: scene.durationSeconds ?? undefined,
            metadata: { providerTaskId: result.providerTaskId },
          });
          await this.mediaAssetRepository.save(asset);
        }
      }

      scene.status =
        result.status === 'completed'
          ? SceneStatus.COMPLETED
          : SceneStatus.FAILED;
      scene.errorMessage = result.errorMessage;
      await this.videoSceneRepository.save(scene);

      await this.checkAndAdvanceToRender(videoId);
    } catch (error) {
      this.logger.error(
        `[VideoGeneration] failed for sceneId=${sceneId}`,
        error,
      );
      scene.status = SceneStatus.FAILED;
      scene.errorMessage =
        error instanceof Error ? error.message : String(error);
      await this.videoSceneRepository.save(scene);
      throw error;
    }
  }

  private async checkAndAdvanceToRender(videoId: string): Promise<void> {
    const scenes = await this.videoSceneRepository.find({
      where: { videoPlan: { video: { id: videoId } } },
    });
    const allDone = scenes.every(
      (s) =>
        s.status === SceneStatus.COMPLETED || s.status === SceneStatus.FAILED,
    );

    if (allDone) {
      this.logger.log(
        `[VideoGeneration] all scenes processed for videoId=${videoId}; advancing to render`,
      );
      await this.orchestrator.enqueue(videoId, 'render');
    }
  }
}
